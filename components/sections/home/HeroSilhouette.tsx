"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { PETALS, type Petal } from "@/lib/logo-geometry";

/**
 * Fond du hero de l'accueil — « silhouette constante » (piste C, choisie le
 * 27/09 après comparaison au labo interne avec un fond vectoriel animé et
 * une vidéo codée) : le grand pétale du logo, agrandi, sert de fenêtre fixe
 * dont la pointe émerge sous les boutons comme un arc d'horizon ; seul son
 * remplissage change, toutes les VARIATION_MS (6 s, desktop et mobile).
 * Transition (choisie le 29/09 au labo, « piste C ») : le nouveau remplissage
 * se révèle depuis la base de la fenêtre vers la pointe, en REVEAL_MS, par un
 * masque dont le front diffus couvre un tiers de la hauteur visible de l'arc
 * (mesurée, --mh-hs-arc-h) ; l'ancien porte le masque inverse et disparaît
 * dans la même zone.
 *
 * Minuteur plutôt qu'une animation CSS en boucle : mesuré au labo, chaque
 * animation active coûte du fil principal en continu ; ici seule la
 * révélation tourne, une fois par changement. Aucun <img>/<video>/<image> : formes SVG,
 * jamais candidates au LCP (le H1 reste l'élément LCP), aucun octet réseau.
 *
 * - Silhouette : PETALS[0] (lib/logo-geometry.ts) ×14, inclinaison d'origine
 *   (−8°), sommet vers y 625 du repère 1600 × 900, ancré en bas
 *   (xMidYMax slice), descendu si besoin pour rester sous la ligne des
 *   atouts (useWindowClearance) : le texte reste toujours sur le fond de page.
 * - Remplissages (jeu choisi le 29/09 au labo, concept hero-pistes) : satin
 *   bicolore, contours, fibres courbes, pétales imbriqués. Desktop
 *   (≥ 768px) : les 4 × 6 s (boucle de 24 s). Mobile : les 3 premiers × 6 s
 *   (18 s) — la fenêtre n'y apparaît qu'autour des deux boutons pleine
 *   largeur, les motifs les plus chargés y faisaient du bruit.
 * - Côtés (≥ 1024px, CSS) : fragments statiques des 4 autres pétales
 *   (PETALS[1…4], formes, teintes et angles d'origine), trait fin + voile
 *   7–8 % : on devine la fleur entière hors champ. Dans le même repère que
 *   la fenêtre : rognés d'eux-mêmes quand l'écran s'éloigne du 16:9.
 * - Mouvement réduit : figé sur le premier remplissage du cycle (satin, ou
 *   automne en saison), sans cycle ni révélation ; bouton pause masqué (rien
 *   ne bouge).
 * - Clair/sombre : un seul jeu de tracés, teintes par tokens (.mh-hs-* dans
 *   app/globals.css).
 *
 * Le cycle ne démarre qu'à la fin de l'Intro (`ready`, piloté par Hero.tsx
 * sur "mh:intro-done") ; avant, la première variation est déjà affichée. Il
 * s'arrête (minuteur supprimé) quand le hero sort de l'écran ou que l'onglet
 * est masqué, et reprend au retour (useCycleVisible).
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

type VariationId = "satin" | "contours" | "fibres" | "petales" | "automne";
/** Ordre du cycle desktop ; le mobile en prend les MOBILE_COUNT premières. */
const SEQUENCE: readonly VariationId[] = ["satin", "contours", "fibres", "petales"];
const MOBILE_COUNT = 3;
/**
 * Automne (1er septembre – 30 novembre, lib/season.ts) : « automne »
 * remplace « satin » en tête du cycle, le reste de SEQUENCE est inchangé.
 * En tête, il est aussi la variation du mobile (MOBILE_COUNT premières) et
 * celle, figée, du mouvement réduit.
 */
const AUTUMN_SEQUENCE: readonly VariationId[] = [
  "automne",
  ...SEQUENCE.filter((v) => v !== "satin"),
];
/** Cadence du cycle, révélation comprise (desktop et mobile). */
const VARIATION_MS = 6000;
/** Durée de la révélation : doit rester égale à l'animation CSS (mh-hs-reveal). */
const REVEAL_MS = 1100;
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

/** Arches de la variation automne : décalage du sommet sous la pointe, échelle par rapport à la fenêtre. */
const AUTUMN_ARCHES = [
  { top: 25, scale: 0.8 },
  { top: 85, scale: 0.6 },
  { top: 145, scale: 0.42 },
] as const;
/** Arches plus hautes que larges, relativement à la fenêtre. */
const AUTUMN_ARCH_STRETCH = 1.25;

/**
 * Fibres courbes : décalage horizontal à la base (depuis l'axe), facteur
 * d'écartement vers le haut, inclinaison propre. Espacement irrégulier : un
 * groupe serré (−150 / −118 / −86), une zone ouverte, puis trois fibres plus
 * espacées et inégales — aucun foyer commun.
 */
const FIBRES = [
  { x: -215, spread: 2.1, lean: -10 },
  { x: -150, spread: 1.95, lean: 6 },
  { x: -118, spread: 1.85, lean: -4 },
  { x: -86, spread: 1.75, lean: 10 },
  { x: 38, spread: 1.9, lean: -8 },
  { x: 150, spread: 2.05, lean: 12 },
  { x: 262, spread: 2.2, lean: -6 },
] as const;
/**
 * Courbure d'une fibre : départ vertical à la base, puis inflexion vers
 * l'extérieur de plus en plus marquée en montant (droites, elles se lisaient
 * comme des rayures dans la bande visible).
 */
function fibrePath(x0: number, y0: number, x3: number, y3: number, lean: number) {
  return `M ${x0} ${y0} C ${x0 + lean} ${y0 - 170} ${x0 + (x3 - x0) * 0.35} ${y3 + 120} ${x3} ${y3}`;
}

/**
 * Pétales imbriqués : position (depuis l'axe et la pointe), hauteur,
 * rotation, teinte. Deux rangées (y ≈ +95 et +215) décalées d'une
 * demi-largeur, qui se chevauchent ; les extrêmes entrent par les côtés, la
 * rangée basse émerge du bas. Sakura dominant, 3 surfaces or.
 */
const IMPRINTS = [
  { x: -270, y: 115, h: 225, rotate: -28, hue: "sakura" },
  { x: -135, y: 90, h: 210, rotate: -12, hue: "gold" },
  { x: 0, y: 100, h: 215, rotate: 4, hue: "sakura" },
  { x: 135, y: 85, h: 205, rotate: 16, hue: "sakura" },
  { x: 270, y: 120, h: 225, rotate: 30, hue: "gold" },
  { x: -205, y: 235, h: 235, rotate: -18, hue: "sakura" },
  { x: -68, y: 220, h: 230, rotate: -4, hue: "sakura" },
  { x: 72, y: 230, h: 235, rotate: 9, hue: "gold" },
  { x: 210, y: 240, h: 230, rotate: 22, hue: "sakura" },
] as const;

/** Empreinte de pétale centrée sur (0, 0) : goutte arrondie, pointe en haut (pas l'ellipse du logo). */
function petalImprint(h: number) {
  const w = h * 0.42;
  const top = -h / 2;
  const bottom = h / 2;
  return `M 0 ${top} C ${w * 0.9} ${top + h * 0.25} ${w} ${bottom - h * 0.2} 0 ${bottom} C ${-w} ${bottom - h * 0.2} ${-w * 0.9} ${top + h * 0.25} 0 ${top} Z`;
}

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

/**
 * Vrai tant que `targetRef` est au moins en partie à l'écran ET que l'onglet
 * est visible. Écran : IntersectionObserver, même principe que la boucle de
 * défilement de la galerie (useMobileMarqueeAutoScroll.ts) ; onglet :
 * visibilitychange (un minuteur continue de tourner, ralenti, dans un onglet
 * masqué). Vrai par défaut : le hero est à l'écran au chargement.
 */
function useCycleVisible(targetRef: RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) =>
      setOnScreen(entries.some((e) => e.isIntersecting)),
    );
    observer.observe(target);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [targetRef]);
  return onScreen && pageVisible;
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
 * sous `avoidRef`, et mesure la hauteur d'arc visible (--mh-hs-arc-h) ;
 * recalculé à chaque redimensionnement du hero ou du texte.
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
      const shift = Math.max(0, Math.ceil(limit - top));
      layer.style.setProperty("--mh-hs-shift", `${shift}px`);
      // Hauteur visible de l'arc (du sommet au bas du calque) : dimensionne le
      // front de la révélation (un tiers) et sa course.
      layer.style.setProperty("--mh-hs-arc-h", `${Math.round(height - top - shift)}px`);
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
  leaving,
  sequence,
  layerRef,
  avoidRef,
}: {
  active: VariationId;
  /** Remplissage en train de disparaître pendant la révélation (masque inverse). */
  leaving: VariationId | null;
  /** Remplissages montés (SEQUENCE, ou AUTUMN_SEQUENCE en automne). */
  sequence: readonly VariationId[];
  layerRef: RefObject<HTMLDivElement | null>;
  avoidRef: RefObject<HTMLElement | null>;
}) {
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
    satin: (
      <>
        {/* Deux grandes plages mates : sakura à gauche, or décentré à droite,
            séparation oblique très large traversant la bande visible. Pas de
            contour ni de reflet sur le bord (effet néon en sombre). */}
        <defs>
          <linearGradient
            id={`${id}-satin`}
            gradientUnits="userSpaceOnUse"
            x1={cx - 300}
            y1={tip.y + 300}
            x2={cx + 260}
            y2={tip.y + 60}
          >
            <stop offset="0" className="mh-hs-satin-sakura" />
            <stop offset="0.38" className="mh-hs-satin-sakura-mid" />
            <stop offset="0.66" className="mh-hs-satin-gold-mid" />
            <stop offset="1" className="mh-hs-satin-gold" />
          </linearGradient>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} fill={`url(#${id}-satin)`} />
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
    fibres: (
      <g transform={tilt}>
        {tint("mh-hs-veil")}
        {/* 7 courbes fines entrant par la base, qui s'écartent en montant dans
            le sens du pétale ; découpées par la silhouette. */}
        {FIBRES.map(({ x, spread, lean }) => {
          const x0 = cx + x;
          const y0 = tip.y + 420;
          const x3 = cx + x * spread + lean;
          const y3 = tip.y - 40;
          return <path key={x} d={fibrePath(x0, y0, x3, y3, lean)} className="mh-hs-fibre" />;
        })}
      </g>
    ),
    petales: (
      <g transform={tilt}>
        {tint("mh-hs-veil")}
        {/* 9 empreintes sans contour, deux rangées décalées, vues en partie
            (côtés, bas), orientations variées. */}
        {IMPRINTS.map(({ x, y, h, rotate, hue }, i) => (
          <path
            key={i}
            d={petalImprint(h)}
            transform={`translate(${cx + x} ${tip.y + y}) rotate(${rotate})`}
            className={hue === "gold" ? "mh-hs-imprint-gold" : "mh-hs-imprint-sakura"}
          />
        ))}
      </g>
    ),
    automne: (
      <g transform={tilt}>
        {tint("mh-hs-tint-sakura")}
        {/* Trois arches or imbriquées, de plus en plus petites et basses :
            forme fermée, concentrique, plus dense vers le bas du champ.
            Sommets à pointe + 25 / 85 / 145 : lisibles avant le fondu du bas.
            Validé au labo interne (28/09, concept hero-saisons). */}
        {AUTUMN_ARCHES.map(({ top, scale }) => (
          <ellipse
            key={top}
            cx={cx}
            cy={tip.y + top + ry * scale * AUTUMN_ARCH_STRETCH}
            rx={rx * scale}
            ry={ry * scale * AUTUMN_ARCH_STRETCH}
            className="mh-hs-arch-gold"
          />
        ))}
      </g>
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
      {sequence.map((v) => (
        <div
          key={v}
          className="mh-hs-variation"
          data-active={v === active ? "" : undefined}
          data-leaving={v === leaving ? "" : undefined}
        >
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
  autumn,
  avoidRef,
}: {
  /** Automne météorologique en cours (calculé côté serveur, lib/season.ts). */
  autumn: boolean;
  ready: boolean;
  /** Ligne des atouts : la fenêtre reste toujours dessous (MIN_GAP_PX). */
  avoidRef: RefObject<HTMLElement | null>;
}) {
  const t = useTranslations("Home.hero");
  const mobile = useMediaQuery(MOBILE_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const layerRef = useRef<HTMLDivElement>(null);
  // Hors écran ou onglet masqué : le minuteur est réellement supprimé (et
  // recréé au retour, variation suivante après une période pleine).
  const visible = useCycleVisible(layerRef);
  const sequence = autumn ? AUTUMN_SEQUENCE : SEQUENCE;
  const count = mobile ? MOBILE_COUNT : sequence.length;
  const active = reducedMotion ? sequence[0] : sequence[index % count];
  const cycling = ready && !reducedMotion && !paused && visible;

  // L'ancien remplissage reste affiché, sous le masque inverse, pendant la
  // révélation. Fixé dans le même rappel que le changement de variation (un
  // seul rendu) : fixé à part, le nouveau serait visible en entier une image
  // avant que son masque ne démarre.
  const [leaving, setLeaving] = useState<VariationId | null>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!cycling) return;
    let clear = 0;
    const id = window.setInterval(() => {
      setLeaving(activeRef.current);
      window.clearTimeout(clear);
      clear = window.setTimeout(() => setLeaving(null), REVEAL_MS + 50);
      setIndex((i) => i + 1);
    }, VARIATION_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(clear);
      setLeaving(null);
    };
  }, [cycling]);

  return (
    <>
      <SilhouetteLayer
        active={active}
        leaving={leaving}
        sequence={sequence}
        layerRef={layerRef}
        avoidRef={avoidRef}
      />
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
