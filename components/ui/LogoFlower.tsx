"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { animate, motionValue } from "framer-motion";
import {
  LOGO_CENTER,
  LOGO_ORIGIN,
  LOGO_VIEWBOX,
  PETALS,
  PETAL_FILL_CLASS,
  SEPARATOR_WIDTH,
} from "@/lib/logo-geometry";
import { BLOOM_TOTAL_MS, OPEN_PETAL_STATE, bloomState, type PetalState } from "@/lib/logo-bloom";

/**
 * Fleur du logo (géométrie : lib/logo-geometry.ts, jamais redessinée),
 * décorative (aria-hidden). Séparations et cœur réellement transparents via
 * un <mask> : la fleur se pose sur n'importe quel fond (dégradé du bouton,
 * bloc de succès…).
 *
 * Chaque pétale est un groupe sous son `rotate()`, dont l'attribut
 * `transform` est l'état fourni (lib/logo-bloom.ts) — échelles ancrées au
 * point d'attache. `petalWrapperClassName` pose une classe sur un groupe
 * intermédiaire (ex. respiration CSS du bourgeon).
 */
export function LogoFlower({
  size,
  state,
  petalWrapperClassName,
  className,
  fillRefs,
  cutRefs,
}: {
  size: number;
  state: (index: number) => PetalState;
  petalWrapperClassName?: string;
  className?: string;
  fillRefs?: RefObject<(SVGGElement | null)[]>;
  cutRefs?: RefObject<(SVGGElement | null)[]>;
}) {
  const maskId = `mh-flower-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const extent = {
    x: -LOGO_VIEWBOX,
    y: -LOGO_VIEWBOX,
    width: LOGO_VIEWBOX * 2,
    height: LOGO_VIEWBOX * 2,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${LOGO_VIEWBOX} ${LOGO_VIEWBOX}`}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" {...extent}>
          <rect {...extent} fill="white" />
          {PETALS.map((p, i) => (
            <g key={i} transform={`rotate(${p.rotate})`}>
              <g className={petalWrapperClassName}>
                <g
                  ref={(el) => {
                    if (cutRefs?.current) cutRefs.current[i] = el;
                  }}
                  transform={state(i).transform}
                  strokeOpacity={state(i).opacity}
                >
                  <ellipse
                    cx={p.cx}
                    cy={p.cy}
                    rx={p.rx}
                    ry={p.ry}
                    fill="none"
                    stroke="black"
                    strokeWidth={SEPARATOR_WIDTH}
                  />
                </g>
              </g>
            </g>
          ))}
          <circle cx={LOGO_CENTER.cx} cy={LOGO_CENTER.cy} r={LOGO_CENTER.r} fill="black" />
        </mask>
      </defs>
      <g transform={`translate(${LOGO_ORIGIN.x} ${LOGO_ORIGIN.y})`}>
        <g mask={`url(#${maskId})`}>
          {PETALS.map((p, i) => (
            <g key={i} transform={`rotate(${p.rotate})`}>
              <g className={petalWrapperClassName}>
                <g
                  ref={(el) => {
                    if (fillRefs?.current) fillRefs.current[i] = el;
                  }}
                  transform={state(i).transform}
                  opacity={state(i).opacity}
                >
                  <ellipse
                    cx={p.cx}
                    cy={p.cy}
                    rx={p.rx}
                    ry={p.ry}
                    className={PETAL_FILL_CLASS[p.hue]}
                  />
                </g>
              </g>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

/**
 * Fleur qui éclot dès son montage (chorégraphie de l'intro, lib/logo-bloom.ts,
 * ≈850ms) — même technique que Intro.tsx : un MotionValue de temps, attributs
 * SVG écrits directement (aucun re-rendu React par frame). En mouvement
 * réduit : fleur ouverte, immobile.
 */
export function BloomingLogoFlower({
  size,
  reducedMotion,
  className,
}: {
  size: number;
  reducedMotion: boolean;
  className?: string;
}) {
  const fillRefs = useRef<(SVGGElement | null)[]>([]);
  const cutRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    if (reducedMotion) return;
    const time = motionValue(0);
    const unsubscribe = time.on("change", (t) => {
      PETALS.forEach((_, i) => {
        const s = bloomState(i, t);
        fillRefs.current[i]?.setAttribute("transform", s.transform);
        fillRefs.current[i]?.setAttribute("opacity", String(s.opacity));
        cutRefs.current[i]?.setAttribute("transform", s.transform);
        cutRefs.current[i]?.setAttribute("stroke-opacity", String(s.opacity));
      });
    });
    const controls = animate(time, BLOOM_TOTAL_MS, {
      duration: BLOOM_TOTAL_MS / 1000,
      ease: "linear",
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [reducedMotion]);

  return (
    <LogoFlower
      size={size}
      className={className}
      state={(i) => (reducedMotion ? OPEN_PETAL_STATE : bloomState(i, 0))}
      fillRefs={fillRefs}
      cutRefs={cutRefs}
    />
  );
}
