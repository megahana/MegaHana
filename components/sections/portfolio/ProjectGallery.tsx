"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { useTranslations } from "next-intl";
import type { GalleryImage } from "@/types";
import { cn } from "@/lib/utils";
import { MEGARECO_DARK_BG } from "@/components/sections/portfolio/megareco-theme";

interface ProjectGalleryProps {
  images: GalleryImage[];
  accentColor?: string;
}

const PLACEHOLDER_GRADIENT =
  "bg-gradient-to-br from-surface-2 to-surface border border-dashed border-border";

function hasImage(src: string) {
  // On considère l'image comme présente — next/image gère le 404 silencieusement.
  // En prod les fichiers réels seront là ; en dev les placeholders s'affichent.
  return src && src.length > 0;
}

export function ProjectGallery({ images, accentColor }: ProjectGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [direction, setDirection] = useState(0); // -1 prev, 1 next
  const reduceMotion = useReducedMotion();
  const tg = useTranslations("Common.gallery");

  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);

  const total = images.length;
  const ring = accentColor ?? "#C1622E"; // fallback = --accent (garder synchro avec globals.css)

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setActive((prev) => (prev + delta + total) % total);
    },
    [total],
  );

  /* Ferme la lightbox ET rend le focus au bouton "Agrandir" qui l'a ouverte
     (jamais au survol/clic souris seul : un utilisateur clavier doit
     retrouver exactement où il était sur la page). */
  const closeLightbox = useCallback(() => {
    setLightbox(false);
    expandButtonRef.current?.focus();
  }, []);

  /* Focus déplacé sur le bouton Fermer à l'ouverture — sans ça le focus
     clavier reste sur le bouton "Agrandir", caché derrière l'overlay. */
  useEffect(() => {
    if (!lightbox) return;
    closeButtonRef.current?.focus();
  }, [lightbox]);

  /* Keyboard navigation — lightbox global (Echap/flèches) + piège de focus
     (Tab/Shift+Tab confinés aux boutons de la lightbox : le contenu de la
     page derrière l'overlay ne doit pas être atteignable au clavier tant
     qu'elle est ouverte — équivalent fonctionnel à un inert/aria-hidden sur
     le reste de la page, sans avoir à sortir de l'arbre de ce composant
     pour atteindre le Header/Footer). */
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Tab" && lightboxRef.current) {
        const focusables = Array.from(
          lightboxRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, go, closeLightbox]);

  /* Lock scroll when lightbox open */
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  /* Keyboard navigation — carrousel principal (quand focus) */
  const onCarouselKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const current = images[active];

  const variants = reduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
      };

  return (
    <>
      {/* ── Carousel ── */}
      <div
        className="space-y-3"
        role="region"
        aria-roledescription="carousel"
        aria-label={tg("region")}
      >
        {/* Main image — pattern APG carousel : région (ligne ~86) > groupe slide (ici) */}
        <div
          className="relative group/main rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          tabIndex={0}
          onKeyDown={onCarouselKey}
          role="group"
          aria-roledescription="slide"
          aria-label={tg("slide", { current: active + 1, total, label: current.label })}
          aria-live="polite"
          style={{
            ["--tw-ring-color" as string]: ring,
            ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
          }}
        >
          {/* Glow — couleur accent ou fallback primary/sakura/or */}
          {accentColor ? (
            <div
              className="absolute -inset-px rounded-2xl blur-sm opacity-50 group-hover/main:opacity-80 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${accentColor}55, ${accentColor}22, ${accentColor}44)`,
              }}
            />
          ) : (
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/25 via-sakura/15 to-gold/25 blur-sm opacity-50 group-hover/main:opacity-80 transition-opacity duration-500 pointer-events-none" />
          )}

          <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-primary/10 bg-surface-2 aspect-[16/8] md:aspect-[16/7]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={active}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0"
              >
                {hasImage(current.src) ? (
                  <Image
                    src={current.src}
                    alt={current.label}
                    fill
                    priority={active === 0}
                    quality={95}
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                  />
                ) : (
                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col items-center justify-center gap-2",
                      PLACEHOLDER_GRADIENT,
                    )}
                  >
                    <p className="text-text-muted text-sm">{current.label}</p>
                    <p className="text-text-muted/50 text-xs">{current.src.split("/").pop()}</p>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                {/* Label + description */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8">
                  <p className="text-white font-semibold text-sm">{current.label}</p>
                  {current.description && (
                    <p className="text-white/80 text-xs mt-0.5 hidden sm:block">
                      {current.description}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Expand button */}
            <button
              ref={expandButtonRef}
              onClick={() => setLightbox(true)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover/main:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={tg("expand")}
            >
              <Expand className="w-3.5 h-3.5" />
            </button>

            {/* Prev / next arrows on main */}
            {total > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover/main:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label={tg("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover/main:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label={tg("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Counter */}
        <p className="text-center text-xs text-text-muted">
          {active + 1} / {total}
        </p>

        {/* Thumbnails */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > active ? 1 : -1);
                setActive(i);
              }}
              className={cn(
                "relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-200 bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                i === active ? "scale-[1.03]" : "opacity-70 hover:opacity-100",
              )}
              style={
                i === active
                  ? {
                      borderColor: ring,
                      boxShadow: `0 0 0 1px ${ring}66`,
                      ["--tw-ring-color" as string]: ring,
                      ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
                    }
                  : {
                      borderColor: "rgba(255,255,255,0.14)",
                      ["--tw-ring-color" as string]: ring,
                      ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
                    }
              }
              aria-label={tg("view", { label: img.label })}
              aria-current={i === active}
            >
              {hasImage(img.src) ? (
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  quality={90}
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 33vw, 250px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[9px] text-text-muted text-center px-1 leading-tight">
                    {img.label}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={tg("region")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              ref={closeButtonRef}
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={tg("close")}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Counter */}
            <p className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/50">
              {active + 1} / {total}
            </p>

            {/* Prev */}
            {total > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={tg("prev")}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Image container */}
            {/* onClick ne fait qu'un stopPropagation (empêche la fermeture de la lightbox
                au clic à l'intérieur) : aucune action réelle, pas d'équivalent clavier
                pertinent à ajouter. */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
              className="relative max-w-5xl w-full max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={active}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: reduceMotion ? 0.12 : 0.25,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {hasImage(current.src) ? (
                      <Image
                        src={current.src}
                        alt={current.label}
                        fill
                        quality={100}
                        className="object-contain"
                        sizes="(max-width: 1280px) 100vw, 1200px"
                      />
                    ) : (
                      <div
                        className={cn(
                          "absolute inset-0 flex flex-col items-center justify-center gap-2",
                          PLACEHOLDER_GRADIENT,
                        )}
                      >
                        <p className="text-text-muted text-sm">{current.label}</p>
                        <p className="text-text-muted/50 text-xs">{current.src.split("/").pop()}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-white font-medium text-sm">{current.label}</p>
                    {current.description && (
                      <p className="text-white/50 text-xs mt-1">{current.description}</p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next */}
            {total > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={tg("next")}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
