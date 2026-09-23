/**
 * Géométrie vectorielle du logo Megahana — source de vérité unique, partagée
 * par l'intro d'accueil (components/sections/home/Intro.tsx) et l'animation
 * de chargement des images (components/ui/ImageWithLoader.tsx).
 *
 * 5 pétales elliptiques tournés autour d'un point d'attache commun,
 * séparations et cœur transparents. Fidélité mesurée contre app/icon.png
 * (rendu 1254 px, masques alpha comparés pixel par pixel, sans
 * réajustement) : 99,66 % de recouvrement, couleurs identiques à
 * --sakura / --gold.
 */

/** Taille du viewBox carré (unités SVG). */
export const LOGO_VIEWBOX = 200;

/** Point d'attache des pétales : reproduit exactement le cadrage de app/icon.png. */
export const LOGO_ORIGIN = { x: 104, y: 103.45 };

export type PetalHue = "sakura" | "gold";

export interface Petal {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Rotation (degrés) autour du point d'attache. */
  rotate: number;
  hue: PetalHue;
}

/** Coordonnées exactes des 5 pétales — ordre = sens horaire depuis le haut, et ordre de peinture. */
export const PETALS: readonly Petal[] = [
  { cx: 0, cy: -52, rx: 25, ry: 50, rotate: -8, hue: "sakura" },
  { cx: 4, cy: -40, rx: 19, ry: 36, rotate: 65, hue: "gold" },
  { cx: -2, cy: -54, rx: 21, ry: 50, rotate: 155, hue: "sakura" },
  { cx: 3, cy: -32, rx: 15, ry: 30, rotate: 218, hue: "gold" },
  { cx: -3, cy: -44, rx: 18, ry: 40, rotate: 292, hue: "sakura" },
];

/** Cœur transparent, relatif au point d'attache. */
export const LOGO_CENTER = { cx: 5, cy: 1, r: 14 };

/** Épaisseur des séparations transparentes entre pétales (unités SVG). */
export const SEPARATOR_WIDTH = 3;

/** Classes Tailwind de remplissage (tokens --sakura / --gold). */
export const PETAL_FILL_CLASS: Record<PetalHue, string> = {
  sakura: "fill-sakura",
  gold: "fill-gold",
};
