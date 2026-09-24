import { cubicBezier } from "framer-motion";
import { PETALS } from "./logo-geometry";

/**
 * Chorégraphie d'éclosion du logo (piste B "Éclosion contenue") — source
 * unique, partagée par l'intro d'accueil (components/sections/home/Intro.tsx)
 * et la fleur de confirmation du formulaire de contact (ContactForm.tsx).
 *
 * Chaque pétale part refermé (35 % de sa longueur, 60 % de sa largeur,
 * -5°) et s'ouvre depuis le point d'attache jusqu'à sa forme exacte, l'un
 * après l'autre dans le sens horaire. Les états sont exprimés dans le repère
 * propre de chaque pétale : à appliquer en attribut SVG `transform` sur un
 * groupe placé sous son `rotate()` (échelles ancrées au point d'attache).
 */

/** Longueur de départ d'un pétale (fraction de sa longueur finale). */
export const BLOOM_START_LENGTH = 0.35;
/** Largeur de départ d'un pétale (fraction de sa largeur finale). */
export const BLOOM_START_WIDTH = 0.6;
/** Angle de départ, légèrement refermé (≤ 5° : au-delà, lecture "spinner"). */
export const BLOOM_START_ANGLE_DEG = -5;
export const BLOOM_PETAL_MS = 650;
export const BLOOM_PETAL_FADE_MS = 250;
export const BLOOM_STAGGER_MS = 50;
/** Durée totale de l'éclosion des 5 pétales (850ms). */
export const BLOOM_TOTAL_MS = (PETALS.length - 1) * BLOOM_STAGGER_MS + BLOOM_PETAL_MS;

/** Points de la courbe (décélération douce, sans dépassement) — pour les transitions framer-motion. */
export const BLOOM_EASE = [0.22, 1, 0.36, 1] as const;
const bloomEase = cubicBezier(...BLOOM_EASE);

export interface PetalState {
  transform: string;
  opacity: number;
}

function progress(t: number, startMs: number, durationMs: number): number {
  return Math.min(1, Math.max(0, (t - startMs) / durationMs));
}

function lerp(from: number, to: number, p: number): number {
  return from + (to - from) * p;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** État d'un pétale à l'instant t (ms) de l'éclosion, dans son propre repère. */
export function bloomState(index: number, t: number): PetalState {
  const start = index * BLOOM_STAGGER_MS;
  const p = bloomEase(progress(t, start, BLOOM_PETAL_MS));
  const rotate = round(BLOOM_START_ANGLE_DEG * (1 - p));
  const sx = round(lerp(BLOOM_START_WIDTH, 1, p));
  const sy = round(lerp(BLOOM_START_LENGTH, 1, p));
  return {
    transform: `rotate(${rotate}) scale(${sx} ${sy})`,
    opacity: round(bloomEase(progress(t, start, BLOOM_PETAL_FADE_MS))),
  };
}

/** Fleur ouverte (état final, et état statique en mouvement réduit). */
export const OPEN_PETAL_STATE: PetalState = { transform: "rotate(0) scale(1 1)", opacity: 1 };
