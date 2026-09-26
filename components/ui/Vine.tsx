import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { buildVine, type VineHue, type VineTone, type VineVariant } from "@/lib/vine-geometry";

/**
 * Ronce / liane décorative (géométrie : lib/vine-geometry.ts, styles :
 * .mh-vine* dans app/globals.css). Purement décorative : aria-hidden,
 * pointer-events: none, aucun élément focusable.
 *
 * Le composant est un point d'ancrage de taille nulle, toujours en
 * position absolue : le placer avec `className` (ex. "top-full left-1/4"
 * sous un header) — le point d'attache de l'élément tombe exactement sur
 * ce point, l'élément pend vers le bas (`rotate` pour une autre direction).
 *
 * Fondu transparent → couleur pleine depuis le point d'attache, un seul
 * asset pour les deux thèmes (fondu vers l'alpha, jamais vers --bg) :
 * - stem (tige à pétales) : tige effilée à la racine + masque CSS linéaire ;
 * - thorn (ronce ponctuée) : couches superposées le long du tracé ;
 * - tendril (vrille) : masque SVG radial centré sur le point d'attache ;
 * - garland (guirlande) : opacité croissante pétale par pétale.
 *
 * Vent : keyframes CSS sur des conteneurs HTML (compositeur, aucun JS),
 * désactivé sous prefers-reduced-motion. Sans "use client" : utilisable
 * depuis un Server Component (aucune fonction en props).
 */

const TONE_CLASS: Record<VineTone, string> = {
  sakura: "mh-vine-sakura",
  gold: "mh-vine-gold",
};

const DEFAULTS: Record<VineVariant, { bend: number; count: number; fade: number }> = {
  stem: { bend: 0.35, count: 3, fade: 0.45 },
  thorn: { bend: 0.4, count: 5, fade: 0.5 },
  tendril: { bend: 0.5, count: 2, fade: 0.55 },
  garland: { bend: 0.3, count: 6, fade: 0.6 },
};

/** Déplacement visé du bout de l'élément par le balancement principal (px). */
const SWAY_TIP_PX = 3.5;
/** Rafale (rotation imbriquée) : fraction de l'amplitude du balancement principal. */
const GUST_RATIO = 0.4;
/** Angle total maximal (balancement + rafale), en degrés. */
const MAX_SWAY_DEG = 4.5;

export interface VineProps {
  variant?: VineVariant;
  /** Longueur du tracé en px (défaut 56). */
  length?: number;
  /** Courbure -1…1 (signe = côté). */
  bend?: number;
  /** Rotation de l'ensemble autour du point d'attache (degrés ; 180 = pousse vers le haut). */
  rotate?: number;
  /** Feuilles (tige, vrille), épines (ronce) ou pétales (guirlande). */
  count?: number;
  hue?: VineHue;
  /** Part de la longueur couverte par le fondu depuis la racine (0…1). */
  fade?: number;
  /** Balancement "vent" (défaut true). */
  sway?: boolean;
  /** Décalage de phase du balancement (s) — désynchronise plusieurs éléments. */
  phase?: number;
  /** Estompé (ex. suspendu au header tant que celui-ci est transparent, en haut de page). */
  faded?: boolean;
  className?: string;
}

export function Vine({
  variant = "stem",
  length = 56,
  bend,
  rotate = 0,
  count,
  hue = "mixed",
  fade,
  sway = true,
  phase = 0,
  faded = false,
  className,
}: VineProps) {
  const defaults = DEFAULTS[variant];
  const shape = buildVine(variant, {
    length,
    bend: bend ?? defaults.bend,
    count: count ?? defaults.count,
    hue,
    fade: fade ?? defaults.fade,
  });
  const maskId = `mh-vine-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const fadeLength = length * (fade ?? defaults.fade);
  // Amplitude du vent exprimée en déplacement du bout (≈3,5 px, plus ≈40 %
  // pour la rafale) plutôt qu'en degrés : un élément court et un long
  // "respirent" autant à l'écran. Les deux rotations s'additionnent : c'est
  // l'angle TOTAL (balancement + rafale) qui est borné à MAX_SWAY_DEG ;
  // plancher du balancement 1,5° (2,1° au total).
  const swayDeg = Math.min(
    MAX_SWAY_DEG / (1 + GUST_RATIO),
    Math.max(1.5, (Math.atan(SWAY_TIP_PX / shape.reach) * 180) / Math.PI),
  );

  const style = {
    "--vine-rotate": `${rotate}deg`,
    "--vine-phase": `${-phase}s`,
    "--vine-sway-amp": `${swayDeg.toFixed(2)}deg`,
    "--vine-gust-amp": `${(swayDeg * GUST_RATIO).toFixed(2)}deg`,
    // Fin du fondu du masque linéaire (tige), mesurée depuis le haut du SVG.
    "--vine-fade-end": `${Math.round(fadeLength - shape.minY)}px`,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={cn("mh-vine", className)}
      data-variant={variant}
      data-sway={sway ? "" : undefined}
      data-faded={faded ? "" : undefined}
      style={style}
    >
      <span className="mh-vine-sway">
        <span className="mh-vine-gust">
          <svg
            className="mh-vine-svg"
            data-variant={variant}
            width={shape.width}
            height={shape.height}
            viewBox={`${shape.minX} ${shape.minY} ${shape.width} ${shape.height}`}
            style={{ left: shape.minX, top: shape.minY }}
            focusable="false"
          >
            {variant === "tendril" && (
              <defs>
                <radialGradient
                  id={`${maskId}-g`}
                  gradientUnits="userSpaceOnUse"
                  cx={0}
                  cy={0}
                  r={shape.reach * (fade ?? defaults.fade) * 1.4}
                >
                  <stop offset="0" stopColor="black" />
                  <stop offset="0.12" stopColor="black" />
                  <stop offset="1" stopColor="white" />
                </radialGradient>
                <mask
                  id={maskId}
                  maskUnits="userSpaceOnUse"
                  x={shape.minX}
                  y={shape.minY}
                  width={shape.width}
                  height={shape.height}
                >
                  <rect
                    x={shape.minX}
                    y={shape.minY}
                    width={shape.width}
                    height={shape.height}
                    fill={`url(#${maskId}-g)`}
                  />
                </mask>
              </defs>
            )}
            <g mask={variant === "tendril" ? `url(#${maskId})` : undefined}>
              {shape.stem && <path d={shape.stem.d} className={TONE_CLASS[shape.stem.tone]} />}
              {shape.stemLayers.map((layer, i) => (
                <path
                  key={`l${i}`}
                  d={layer.d}
                  className={TONE_CLASS[layer.tone]}
                  fillOpacity={layer.opacity}
                />
              ))}
              {shape.thorns.map((thorn, i) => (
                <path
                  key={`t${i}`}
                  d={thorn.d}
                  className={TONE_CLASS[thorn.tone]}
                  fillOpacity={thorn.opacity}
                />
              ))}
              {shape.ellipses.map((e, i) => (
                <g
                  key={`e${i}`}
                  className={variant === "garland" ? "mh-vine-flutter" : undefined}
                  style={
                    variant === "garland"
                      ? ({
                          transformOrigin: `${e.pivotX}px ${e.pivotY}px`,
                          "--vine-flutter-delay": `${-phase - i * 0.35}s`,
                        } as CSSProperties)
                      : undefined
                  }
                >
                  <ellipse
                    cx={e.cx}
                    cy={e.cy}
                    rx={e.rx}
                    ry={e.ry}
                    transform={`rotate(${e.rotate} ${e.cx} ${e.cy})`}
                    className={TONE_CLASS[e.tone]}
                    fillOpacity={e.opacity < 1 ? e.opacity : undefined}
                  />
                </g>
              ))}
            </g>
          </svg>
        </span>
      </span>
    </span>
  );
}
