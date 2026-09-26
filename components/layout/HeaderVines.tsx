"use client";

import { Vine } from "@/components/ui/Vine";

/**
 * Lianes suspendues à la ligne basse du header (choisies au labo interne) :
 * tige à pétales à gauche, vrille à droite. Invisibles au repos, elles
 * apparaissent avec le fond et l'ombre du header (même état `scrolled` que
 * Header.tsx, aucun écouteur de plus). Décoratives (aria-hidden,
 * pointer-events: none, voir Vine.tsx). Jamais sur l'accueil (exclu dans
 * Header.tsx : sa galerie pleine largeur passe sous n'importe quelle
 * position).
 *
 * Placement : au milieu de la marge EXTÉRIEURE au conteneur de contenu
 * (max-w-7xl = 80rem, moins px-8 de chaque côté = 76rem de contenu), là où
 * rien ne défile dessous. Positions relatives à la largeur du header (fixe,
 * pleine largeur).
 *
 * Seuil 1440px — volontairement PAS le seuil lg (1024px) du menu du
 * header : la contrainte est la largeur de la marge extérieure, pas la nav.
 * Mesuré sur /services, /contact, /about, /portfolio (Playwright, balayage
 * de toute la page, débattement du vent compris) : premier chevauchement
 * sous ≈1360px de largeur utile (cartes de /portfolio, un peu plus larges
 * que le conteneur), soit ≈1381px de fenêtre avec une barre de défilement
 * classique de 17px. 1440px laisse ≈60px de marge. En dessous : rien.
 *
 * Chargé côté client seulement (next/dynamic, ssr: false, depuis
 * Header.tsx) : invisibles au premier rendu, elles n'ont rien à faire dans
 * le HTML initial — rendues côté serveur, leurs ≈6 Ko de tracés SVG
 * retardaient le LCP de toutes les pages (+60 à +170 ms mesurés).
 */
const CONTENT_WIDTH = "76rem";
/** Distance du bord de l'écran au milieu de la marge extérieure. */
const GUTTER_CENTER = `(100% - ${CONTENT_WIDTH}) / 4`;

export function HeaderVines({ scrolled }: { scrolled: boolean }) {
  return (
    <span className="hidden min-[1440px]:contents">
      <span className="absolute top-full h-0 w-0" style={{ left: `calc(${GUTTER_CENTER})` }}>
        <Vine variant="stem" length={56} bend={0.35} phase={0} faded={!scrolled} />
      </span>
      <span className="absolute top-full h-0 w-0" style={{ left: `calc(100% - ${GUTTER_CENTER})` }}>
        <Vine variant="tendril" length={70} bend={-0.3} phase={2.6} faded={!scrolled} />
      </span>
    </span>
  );
}
