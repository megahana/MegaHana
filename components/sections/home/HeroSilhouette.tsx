"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { LOGO_ORIGIN, PETALS, type Petal } from "@/lib/logo-geometry";
import { buildVine } from "@/lib/vine-geometry";

/**
 * Fond du hero de l'accueil — « silhouette constante » (piste C, choisie le
 * 27/09 après comparaison au labo interne avec un fond vectoriel animé et
 * une vidéo codée) : le grand pétale du logo, agrandi, sert de fenêtre fixe
 * dont la pointe émerge sous les boutons comme un arc d'horizon ; seul son
 * remplissage change, toutes les VARIATION_MS, par un fondu de 350 ms.
 *
 * Minuteur plutôt qu'une animation CSS en boucle : mesuré au labo, chaque
 * animation active coûte du fil principal en continu ; ici seul le fondu
 * tourne, une fois par changement. Aucun <img>/<video>/<image> : formes SVG,
 * jamais candidates au LCP (le H1 reste l'élément LCP), aucun octet réseau.
 *
 * - Silhouette : PETALS[0] (lib/logo-geometry.ts) ×14, inclinaison d'origine
 *   (−8°), sommet vers y 625 du repère 1600 × 900, ancré en bas
 *   (xMidYMax slice), descendu si besoin pour rester sous la ligne des
 *   atouts (useWindowClearance) : le texte reste toujours sur le fond de page.
 * - Desktop (≥ 768px) : 5 variations × 4 s (boucle de 20 s). Mobile : les 3
 *   premières, calmes, × 5 s (15 s) — la fenêtre n'y apparaît qu'autour des
 *   deux boutons pleine largeur, les motifs y faisaient du bruit.
 * - Côtés (≥ 1024px, CSS) : fragments statiques des 4 autres pétales
 *   (PETALS[1…4], formes, teintes et angles d'origine), trait fin + voile
 *   7–8 % : on devine la fleur entière hors champ. Dans le même repère que
 *   la fenêtre : rognés d'eux-mêmes quand l'écran s'éloigne du 16:9.
 * - Mouvement réduit : figé sur le dégradé, sans cycle ni fondu ; bouton
 *   pause masqué (rien ne bouge).
 * - Clair/sombre : un seul jeu de tracés, teintes par tokens (.mh-hs-* dans
 *   app/globals.css).
 *
 * Le cycle ne démarre qu'à la fin de l'Intro (`ready`, piloté par Hero.tsx
 * sur "mh:intro-done") ; avant, la première variation est déjà affichée.
 */

/** Repère du dessin : rapport du hero desktop. */
const VIEW_W = 1600;
const VIEW_H = 900;
const PETAL = PETALS[0];
/** Échelle de la fenêtre par rapport au pétale du logo. */
const WINDOW_SCALE = 14;
/** Centre de la fenêtre : sommet de l'ellipse ≈ y 620, sous la ligne des atouts. */
const WINDOW_CENTER = { x: VIEW_W / 2, y: VIEW_H + 420 };
const ALIGN = "xMidYMax slice";
/** Sommet réel de la fenêtre inclinée (repère 1600 × 900) : ≈ 625. */
const WINDOW_TOP = (() => {
  const theta = (PETAL.rotate * Math.PI) / 180;
  const rx = PETAL.rx * WINDOW_SCALE;
  const ry = PETAL.ry * WINDOW_SCALE;
  return WINDOW_CENTER.y - Math.sqrt((rx * Math.sin(theta)) ** 2 + (ry * Math.cos(theta)) ** 2);
})();
/**
 * Écart minimal (px) entre le bas de la ligne des atouts et le sommet de la
 * fenêtre. La fenêtre suit les dimensions de l'écran, le texte (rem) sa
 * propre mise en page : sur certaines proportions (tablette 700–1023px,
 * 1280 × 720, très large 21:9), le sommet remontait sous les atouts. On ne
 * descend alors la fenêtre que du nécessaire ; ailleurs, rien ne bouge.
 */
const MIN_GAP_PX = 16;

type VariationId = "degrade" | "contours" | "nervures" | "eclosion" | "ronces";
/** Ordre du cycle desktop ; le mobile en prend les MOBILE_COUNT premières. */
const SEQUENCE: readonly VariationId[] = ["degrade", "contours", "nervures", "eclosion", "ronces"];
const MOBILE_COUNT = 3;
const VARIATION_MS = 4000;
const MOBILE_VARIATION_MS = 5000;
const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const SIDE_PETALS: ReadonlyArray<{ petal: Petal; scale: number; x: number; y: number }> = [
  // Gauche : pétale qui pointe vers la gauche (292°), sakura.
  { petal: PETALS[4], scale: 9, x: 30, y: 500 },
  // Droite : pétale or qui pointe vers la droite (65°).
  { petal: PETALS[1], scale: 9, x: 1590, y: 380 },
  // Coins bas : les deux pétales du bas de la fleur (218° or, 155° sakura).
  { petal: PETALS[3], scale: 7, x: 190, y: 890 },
  { petal: PETALS[2], scale: 6.5, x: 1500, y: 960 },
];

/** Ronces « en réserve » (variation ronces), repère de la fenêtre. */
const RESERVE_VINES = [
  { dx: -0.55, dy: -20, rotate: -14, length: 520, bend: 0.4 },
  { dx: 0.1, dy: -40, rotate: 8, length: 600, bend: -0.35 },
  { dx: 0.7, dy: 60, rotate: 24, length: 460, bend: 0.3 },
  { dx: -0.95, dy: 140, rotate: -30, length: 420, bend: -0.3 },
] as const;
const RESERVE_VINE_SCALE = 1.6;

/** Suit une media query côté client (false au rendu serveur et à l'hydratation). */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- valeur connue côté client seulement
    setMatches(list.matches);
    const onChange = () => setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Fleur du logo (géométrie partagée), centrée sur le point d'attache. */
function LogoFlowerShapes({ scale }: { scale: number }) {
  return (
    <g transform={`scale(${scale}) translate(${-LOGO_ORIGIN.x} ${-LOGO_ORIGIN.y})`}>
      {PETALS.map((p, i) => (
        <ellipse
          key={i}
          cx={LOGO_ORIGIN.x + p.cx}
          cy={LOGO_ORIGIN.y + p.cy}
          rx={p.rx}
          ry={p.ry}
          transform={`rotate(${p.rotate} ${LOGO_ORIGIN.x} ${LOGO_ORIGIN.y})`}
          className={p.hue === "sakura" ? "mh-hs-fill-sakura" : "mh-hs-fill-gold"}
        />
      ))}
    </g>
  );
}

/** Ronce de production (lib/vine-geometry.ts), tous tracés dans une seule teinte. */
function VineShapes({ length, bend }: { length: number; bend: number }) {
  const shape = buildVine("thorn", { length, bend, count: 7, hue: "gold", fade: 0 });
  return (
    <g className="mh-hs-fill-bg">
      {shape.stem && <path d={shape.stem.d} />}
      {shape.stemLayers.map((l, i) => (
        <path key={`l${i}`} d={l.d} />
      ))}
      {shape.thorns.map((t, i) => (
        <path key={`t${i}`} d={t.d} />
      ))}
      {shape.ellipses.map((e, i) => (
        <ellipse
          key={`e${i}`}
          cx={e.cx}
          cy={e.cy}
          rx={e.rx}
          ry={e.ry}
          transform={`rotate(${e.rotate} ${e.cx} ${e.cy})`}
        />
      ))}
    </g>
  );
}

/** Position verticale d'un élément dans `ancestor` (offsetTop : ignore les transform d'apparition). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/**
 * Descend la fenêtre (--mh-hs-shift) juste assez pour rester MIN_GAP_PX
 * sous `avoidRef` ; recalculé à chaque redimensionnement du hero ou du texte.
 */
function useWindowClearance(
  layerRef: RefObject<HTMLDivElement | null>,
  avoidRef: RefObject<HTMLElement | null>,
) {
  // useEffect et non useLayoutEffect : la ligne des atouts est rendue APRÈS
  // ce calque ; sa ref n'est attachée qu'une fois tout le commit terminé.
  useEffect(() => {
    const layer = layerRef.current;
    const avoid = avoidRef.current;
    const section = layer?.parentElement;
    if (!layer || !avoid || !section) return;
    const update = () => {
      const width = layer.clientWidth;
      const height = layer.clientHeight;
      const scale = Math.max(width / VIEW_W, height / VIEW_H);
      // Ancrage bas (xMidYMax slice) : le repère dépasse éventuellement en haut.
      const top = height - VIEW_H * scale + WINDOW_TOP * scale;
      const limit = offsetWithin(avoid, section) + avoid.offsetHeight + MIN_GAP_PX;
      layer.style.setProperty("--mh-hs-shift", `${Math.max(0, Math.ceil(limit - top))}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(layer);
    observer.observe(avoid);
    return () => observer.disconnect();
  }, [layerRef, avoidRef]);
}

function SilhouetteLayer({
  active,
  avoidRef,
}: {
  active: VariationId;
  avoidRef: RefObject<HTMLElement | null>;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  useWindowClearance(layerRef, avoidRef);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { x: cx, y: cy } = WINDOW_CENTER;
  const rx = PETAL.rx * WINDOW_SCALE;
  const ry = PETAL.ry * WINDOW_SCALE;
  // Même inclinaison que le pétale du logo, autour du centre de la fenêtre.
  const tilt = `rotate(${PETAL.rotate} ${cx} ${cy})`;
  const tip = { x: cx, y: cy - ry };
  const tint = (className: string) => (
    <rect x={-VIEW_W} y={-VIEW_H} width={VIEW_W * 3} height={VIEW_H * 3} className={className} />
  );

  const variations: Record<VariationId, ReactNode> = {
    degrade: (
      <>
        <defs>
          <linearGradient
            id={`${id}-grad`}
            gradientUnits="userSpaceOnUse"
            x1={tip.x}
            y1={tip.y}
            x2={cx}
            y2={cy + ry * 0.2}
            gradientTransform={tilt}
          >
            <stop offset="0" className="mh-hs-stop-sakura" />
            <stop offset="1" className="mh-hs-stop-gold" />
          </linearGradient>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} fill={`url(#${id}-grad)`} />
      </>
    ),
    contours: (
      <g transform={tilt}>
        {tint("mh-hs-tint-sakura")}
        {/* Lignes de croissance : le même pétale à 93 %, 86 %… de sa taille. */}
        {[0.93, 0.86, 0.79, 0.72, 0.65].map((k) => (
          <ellipse key={k} cx={cx} cy={cy} rx={rx * k} ry={ry * k} className="mh-hs-stroke-gold" />
        ))}
      </g>
    ),
    nervures: (
      <g transform={tilt}>
        {tint("mh-hs-tint-sakura")}
        <path d={`M ${cx} ${cy + ry} L ${tip.x} ${tip.y + ry * 0.06}`} className="mh-hs-vein" />
        {Array.from({ length: 9 }, (_, i) => {
          const y = tip.y + ry * (0.16 + i * 0.2);
          const half = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)) * 0.86;
          return [-1, 1].map((side) => (
            <path
              key={`${i}${side}`}
              d={`M ${cx} ${y + ry * 0.08} Q ${cx + side * half * 0.45} ${y + ry * 0.02} ${cx + side * half} ${y - ry * 0.1}`}
              className="mh-hs-vein mh-hs-vein--fine"
            />
          ));
        })}
      </g>
    ),
    eclosion: (
      <>
        <defs>
          <pattern
            id={`${id}-flowers`}
            width="150"
            height="150"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${PETAL.rotate})`}
          >
            <g transform="translate(40 40)" className="mh-hs-pattern">
              <LogoFlowerShapes scale={0.22} />
            </g>
            <g transform="translate(115 112) rotate(36)" className="mh-hs-pattern">
              <LogoFlowerShapes scale={0.14} />
            </g>
          </pattern>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} className="mh-hs-tint-gold" />
        <rect width={VIEW_W} height={VIEW_H} fill={`url(#${id}-flowers)`} />
      </>
    ),
    ronces: (
      <>
        <rect width={VIEW_W} height={VIEW_H} className="mh-hs-tint-gold-strong" />
        {/* Peintes dans la couleur du fond de page (réserve). */}
        {RESERVE_VINES.map((v, i) => (
          <g
            key={i}
            transform={`${tilt} translate(${cx + rx * v.dx} ${tip.y + v.dy}) rotate(${v.rotate}) scale(${RESERVE_VINE_SCALE})`}
          >
            <VineShapes length={v.length / RESERVE_VINE_SCALE} bend={v.bend} />
          </g>
        ))}
      </>
    ),
  };

  return (
    <div ref={layerRef} aria-hidden="true" className="mh-hs-layer">
      {/* Silhouette : un seul tracé, partagé par toutes les variations. */}
      <svg className="mh-hs-defs" width="0" height="0" focusable="false">
        <defs>
          <clipPath id={`${id}-clip`} clipPathUnits="userSpaceOnUse">
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={tilt} />
          </clipPath>
        </defs>
      </svg>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio={ALIGN}
        className="mh-hs-svg mh-hs-sides"
        focusable="false"
      >
        {SIDE_PETALS.map(({ petal, scale, x, y }, i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={petal.rx * scale}
            ry={petal.ry * scale}
            transform={`rotate(${petal.rotate} ${x} ${y})`}
            className={`mh-hs-side mh-hs-side--${petal.hue}`}
          />
        ))}
      </svg>
      {SEQUENCE.map((v) => (
        <div key={v} className="mh-hs-variation" data-active={v === active ? "" : undefined}>
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio={ALIGN}
            className="mh-hs-svg"
            focusable="false"
          >
            <g clipPath={`url(#${id}-clip)`}>{variations[v]}</g>
          </svg>
        </div>
      ))}
    </div>
  );
}

export function HeroSilhouette({
  ready,
  avoidRef,
}: {
  ready: boolean;
  /** Ligne des atouts : la fenêtre reste toujours dessous (MIN_GAP_PX). */
  avoidRef: RefObject<HTMLElement | null>;
}) {
  const t = useTranslations("Home.hero");
  const mobile = useMediaQuery(MOBILE_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const count = mobile ? MOBILE_COUNT : SEQUENCE.length;
  const duration = mobile ? MOBILE_VARIATION_MS : VARIATION_MS;
  const active = reducedMotion ? SEQUENCE[0] : SEQUENCE[index % count];
  const cycling = ready && !reducedMotion && !paused;

  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), duration);
    return () => window.clearInterval(id);
  }, [cycling, duration]);

  return (
    <>
      <SilhouetteLayer active={active} avoidRef={avoidRef} />
      {/* WCAG 2.2.2 : fond qui change seul pendant plus de 5 s → arrêt possible.
          Masqué en mouvement réduit (CSS : rien ne bouge alors). */}
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={t("motionPause")}
        title={paused ? t("motionPlay") : t("motionPause")}
        className="mh-hs-pause"
      >
        {paused ? (
          <Play className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Pause className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
