"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  LOGO_CENTER,
  LOGO_ORIGIN,
  LOGO_VIEWBOX,
  PETALS,
  PETAL_FILL_CLASS,
  SEPARATOR_WIDTH,
} from "@/lib/logo-geometry";

type Props = ImageProps & {
  showLoader?: boolean;
  containerClassName?: string;
};

type Status = "loading" | "loaded" | "error";

const LOADER_FLOWER_SIZE_PX = 44;

function sourceKey(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;

  return "default" in src ? src.default.src : src.src;
}

/**
 * Une nouvelle source crée une nouvelle instance de chargement.
 * Aucun état "loaded" hérité de l'image précédente (via `key` sur LoadingImage).
 */
export function ImageWithLoader({ showLoader = true, containerClassName, ...imageProps }: Props) {
  // Mode sans overlay : comportement next/image habituel, sans conteneur supplémentaire.
  if (!showLoader) {
    // `alt` est un champ obligatoire de `ImageProps` (imposé par TypeScript) et transite bien
    // par ce spread ; jsx-a11y/alt-text ne sait pas suivre un spread, d'où ce faux positif.
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...imageProps} />;
  }

  return (
    <LoadingImage
      key={sourceKey(imageProps.src)}
      {...imageProps}
      containerClassName={containerClassName}
    />
  );
}

/**
 * Fleur du logo en SVG inline (plus de PNG à charger pour le loader), dont
 * les pétales se referment et se rouvrent doucement depuis leur point
 * d'attache — tous ensemble, jamais en vague autour du cœur (lecture
 * "spinner"). Animation 100 % CSS (.mh-image-loader-petal, globals.css).
 *
 * Séparations et cœur peints en --surface-2, la couleur du voile opaque qui
 * porte la fleur : visuellement identique à la transparence du vrai logo,
 * sans <mask> à animer.
 */
function LoaderFlower() {
  return (
    <svg
      width={LOADER_FLOWER_SIZE_PX}
      height={LOADER_FLOWER_SIZE_PX}
      viewBox={`0 0 ${LOGO_VIEWBOX} ${LOGO_VIEWBOX}`}
      className="mh-image-loader-mark"
    >
      <g transform={`translate(${LOGO_ORIGIN.x} ${LOGO_ORIGIN.y})`}>
        {PETALS.map((p, i) => (
          <g key={`fill-${i}`} transform={`rotate(${p.rotate})`}>
            <g className="mh-image-loader-petal">
              <ellipse
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                className={PETAL_FILL_CLASS[p.hue]}
              />
            </g>
          </g>
        ))}
        {PETALS.map((p, i) => (
          <g key={`sep-${i}`} transform={`rotate(${p.rotate})`}>
            <g className="mh-image-loader-petal">
              <ellipse
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill="none"
                strokeWidth={SEPARATOR_WIDTH}
                className="stroke-surface-2"
              />
            </g>
          </g>
        ))}
        <circle
          cx={LOGO_CENTER.cx}
          cy={LOGO_CENTER.cy}
          r={LOGO_CENTER.r}
          className="fill-surface-2"
        />
      </g>
    </svg>
  );
}

/**
 * Attente : voile --surface-2 (même teinte que le fond des cartes) portant la
 * fleur qui respire. Arrivée : le voile se dissout pendant que l'image passe
 * du flou au net. Tout le visuel est en CSS (.mh-image-loader-*, globals.css),
 * piloté par data-state.
 *
 * Performance : l'image n'est JAMAIS masquée (pas d'opacity 0), seulement
 * floutée sous le voile. Elle est donc peinte dès son chargement et le LCP
 * n'attend pas la révélation — mesuré sur build de prod avec latence réseau
 * réelle : LCP ≈ arrivée de l'image + 26ms, contre + 594ms pour une variante
 * qui masquait l'image jusqu'à la révélation.
 *
 * data-state="idle" avant montage : le HTML serveur n'applique ni voile ni
 * flou, l'image reste visible sans JS.
 */
function LoadingImage({
  containerClassName,
  className,
  onLoad,
  onError,
  ...imageProps
}: ImageProps & { containerClassName?: string }) {
  const t = useTranslations("Common.image");
  const imageRef = useRef<HTMLImageElement>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = imageRef.current;

    // Même pattern "isMounted" que ThemeToggle.tsx : évite un mismatch
    // d'hydratation, aucune alternative sans effet pour détecter cet état.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnhanced(true);

    // Vérification complémentaire pour une image déjà en cache navigateur
    // (le navigateur peut ne pas redéclencher onLoad de façon fiable pour
    // une image déjà "complete" au moment où React attache le handler).
    if (image?.complete && image.naturalWidth > 0) {
      void image.decode().then(
        () => {
          if (!cancelled) setStatus("loaded");
        },
        () => {
          // Une annulation de decode n'est pas forcément une erreur réseau :
          // laisser onLoad/onError décider dans ce cas.
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const state = enhanced ? status : "idle";
  const pending = state === "loading";

  return (
    <div
      className={cn(
        "mh-image-loader relative isolate",
        imageProps.fill ? "h-full w-full" : "inline-block align-top",
        containerClassName,
      )}
      data-state={state}
      aria-busy={pending || undefined}
    >
      {/* Calque porteur du flou : l'<img> garde ses propres transitions
          (ex. scale au survol des cartes) sans conflit. */}
      <div
        className={cn("mh-image-loader-media", imageProps.fill ? "absolute inset-0" : "relative")}
      >
        {/* Même faux positif jsx-a11y/alt-text qu'en tête de fichier : `alt` transite par le spread. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          {...imageProps}
          ref={imageRef}
          className={className}
          onLoad={(event) => {
            setStatus("loaded");
            onLoad?.(event);
          }}
          onError={(event) => {
            setStatus("error");
            onError?.(event);
          }}
        />
      </div>

      <div aria-hidden="true" className="mh-image-loader-veil">
        {state !== "idle" && <LoaderFlower />}
      </div>

      {status === "error" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-2 p-4 text-center">
          <p className="text-sm text-text-secondary">{t("unavailable")}</p>
        </div>
      )}
    </div>
  );
}
