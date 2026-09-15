"use client";

import { useMemo, useState } from "react";
import { Clock, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ImageWithLoader } from "@/components/ui/ImageWithLoader";
import { cn } from "@/lib/utils";
import type { Project, Sector } from "@/types";

type Filter = "all" | Sector;

const SHOWCASE_IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

/* Même ordre que Home.galerie.sectors (source unique des noms de secteurs,
   voir components/sections/home/Galerie.tsx) — pour que les filtres du
   portfolio et la légende de la Galerie restent cohérents visuellement. */
const SECTOR_ORDER: Sector[] = [
  "restaurant",
  "artisans",
  "artistes",
  "startup",
  "architecte",
  "musicien",
  "mode",
  "bien-etre",
];

export function ShowcaseGrid({ projects }: { projects: Project[] }) {
  const t = useTranslations("Portfolio");
  const tc = useTranslations("Common");
  const tf = useTranslations("Portfolio.filters");
  const tSectors = useTranslations("Home.galerie.sectors");
  const [active, setActive] = useState<Filter>("all");

  // On ne propose que les secteurs réellement présents dans les cartes reçues.
  const availableSectors = useMemo(
    () => SECTOR_ORDER.filter((sector) => projects.some((p) => p.sector === sector)),
    [projects],
  );

  const visibleProjects = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.sector === active)),
    [projects, active],
  );

  return (
    <div>
      <div role="group" aria-label={tf("ariaLabel")} className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActive("all")}
          aria-pressed={active === "all"}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
            active === "all"
              ? "bg-accent-accessible text-accent-contrast border-accent-accessible"
              : "border-border bg-surface text-text-secondary hover:bg-surface-2",
          )}
        >
          {tf("all")}
        </button>
        {availableSectors.map((sector) => (
          <button
            key={sector}
            type="button"
            onClick={() => setActive(sector)}
            aria-pressed={active === sector}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
              active === sector
                ? "bg-accent-accessible text-accent-contrast border-accent-accessible"
                : "border-border bg-surface text-text-secondary hover:bg-surface-2",
            )}
          >
            {tSectors(sector)}
          </button>
        ))}
      </div>

      {/* Annonce discrète pour les lecteurs d'écran quand le filtre change */}
      <p role="status" aria-live="polite" className="sr-only">
        {tf("resultsCount", { count: visibleProjects.length })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleProjects.map((p, i) => (
          <AnimateIn key={p.id} delay={i * 0.06}>
            <div className="relative group h-full">
              <div className="relative rounded-2xl overflow-hidden h-full flex flex-col card-border">
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-2">
                  {p.images?.homepage ? (
                    <ImageWithLoader
                      src={p.images.homepage}
                      alt={p.title}
                      fill
                      sizes={SHOWCASE_IMAGE_SIZES}
                      className={cn(
                        "object-cover object-top",
                        "transition-transform duration-700",
                        "motion-safe:group-hover:scale-[1.03]",
                        "motion-reduce:transition-none",
                      )}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-text-muted">{t("captureSoon")}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-2 to-transparent" />
                  {p.sector && (
                    <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-border bg-surface/90 backdrop-blur-sm text-text-secondary">
                      {tSectors(p.sector)}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg">{p.title}</h3>
                      <p className="text-sm mt-1 leading-relaxed">
                        {t(`showcase.${p.id}.description`)}
                      </p>
                    </div>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium shrink-0 group/lnk mt-0.5 transition-colors hover:opacity-80"
                      >
                        {tc("viewSite")}
                        <ExternalLink className="w-3.5 h-3.5 group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        ))}

        {/* Placeholder futur projet — uniquement visible sans filtre actif,
            pour ne pas laisser un "Prochain projet" orphelin dans une liste
            filtrée par secteur où il n'a pas de sens. */}
        {active === "all" && (
          <AnimateIn delay={0.1}>
            <div className="rounded-2xl border border-dashed border-border p-6 sm:p-8 flex flex-col items-center justify-center gap-2 aspect-[16/10] text-center">
              <Clock className="w-5 h-5 text-text-muted" />
              <p className="text-sm font-medium text-text-muted">{t("nextProjectTitle")}</p>
              <p className="text-xs text-text-muted/60">{t("nextProjectStatus")}</p>
            </div>
          </AnimateIn>
        )}
      </div>
    </div>
  );
}
