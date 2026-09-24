"use client";

import { useState } from "react";
import { motion, type Transition } from "framer-motion";
import { PETALS, PETAL_FILL_CLASS } from "@/lib/logo-geometry";
import {
  BLOOM_EASE,
  BLOOM_PETAL_FADE_MS,
  BLOOM_PETAL_MS,
  BLOOM_START_ANGLE_DEG,
  BLOOM_START_LENGTH,
  BLOOM_START_WIDTH,
} from "@/lib/logo-bloom";

/**
 * Pétales de progression qui poussent DERRIÈRE le bouton d'envoi du
 * formulaire de contact et en dépassent : le bouton devient le cœur de la
 * fleur (variante choisie au labo interne, "pétales derrière le bouton").
 *
 * - Calque strictement sous le bouton (le parent pose `isolate`, le bouton
 *   `relative z-10`, fond opaque) : un pétale n'est visible que dans la
 *   partie qui dépasse, jamais devant le libellé.
 * - Un pétale par pétale du logo (forme, couleur, angle de PETALS), ancré
 *   sur un bord du bouton et orienté selon son angle dans le logo — même
 *   technique que PetalDispersion.tsx (div positionnée en %, trajet le long
 *   d'une direction), mais en croissance, pas en dispersion.
 * - 2 pétales or : toujours sortis. 3 pétales sakura = 3 champs obligatoires
 *   valides, en COMPTE (ordre horaire des pétales) — useRequiredFieldsProgress,
 *   mêmes règles que la validation réelle (lib/contact-validation.ts).
 *
 * Chorégraphie (états = ceux de lib/logo-bloom.ts : 35 % de longueur, 60 %
 * de largeur, -5°) :
 * - pousse : sort de sous le bouton en 650ms, courbe de l'éclosion, fondu
 *   d'apparition 250ms ;
 * - retrait (champ quitté invalide) : rentre vers son ancrage en 200ms,
 *   décélération douce ;
 * - envoi : TOUS les pétales rentrent (même retrait) ; le bouton n'affiche
 *   plus que « Envoi en cours… », aucune fleur ni bourgeon ;
 * - échec : retour instantané à l'état ouvert ;
 * - mouvement réduit : tout est instantané, les pétales restent sortis
 *   pendant l'envoi.
 * Décoratif (aria-hidden) : n'annonce rien, n'influence jamais la
 * validation. Aucune dispersion ici — la seule est celle de la confirmation
 * (PetalDispersion.tsx).
 */

/** Taille d'affichage : px par unité du logo (pétale sakura du haut ≈ 24px). */
const PX_PER_UNIT = 0.24;
/** Base du pétale ouvert, en retrait sous le bouton (px). */
const OPEN_INSET_PX = 6;
/** Retrait : base assez loin sous le bouton pour que tout le pétale y soit caché (px). */
const RETRACTED_INSET_PX = 14;
const RETRACT_MS = 200;

/**
 * Point d'ancrage de chaque pétale sur le pourtour du bouton (% de sa
 * taille) : haut, bord droit, bas, bas, bord gauche — hors des coins
 * arrondis. La direction de sortie est l'angle du pétale dans le logo.
 */
const ANCHORS = [
  { left: 40, top: 0 },
  { left: 100, top: 32 },
  { left: 72, top: 100 },
  { left: 22, top: 100 },
  { left: 0, top: 36 },
] as const;

const SAKURA_ORDER = PETALS.flatMap((p, i) => (p.hue === "sakura" ? [i] : []));

const OPEN = { y: OPEN_INSET_PX, rotate: 0, scaleX: 1, scaleY: 1, opacity: 1 };
const RETRACTED = {
  y: RETRACTED_INSET_PX,
  rotate: BLOOM_START_ANGLE_DEG,
  scaleX: BLOOM_START_WIDTH,
  scaleY: BLOOM_START_LENGTH,
  opacity: 0,
};

const GROW: Transition = {
  duration: BLOOM_PETAL_MS / 1000,
  ease: BLOOM_EASE,
  opacity: { duration: BLOOM_PETAL_FADE_MS / 1000, ease: BLOOM_EASE },
};
const RETRACT: Transition = { duration: RETRACT_MS / 1000, ease: "easeOut" };
const INSTANT: Transition = { duration: 0 };

function isOut(index: number, count: number): boolean {
  if (PETALS[index].hue === "gold") return true;
  return SAKURA_ORDER.indexOf(index) < count;
}

export function ButtonPetals({
  count,
  sending,
  reducedMotion,
}: {
  count: number;
  sending: boolean;
  reducedMotion: boolean;
}) {
  // Fin d'un envoi (échec) : le prochain changement d'état est instantané.
  // Tout autre changement (compte) rétablit l'animation.
  const [prev, setPrev] = useState({ count, sending });
  const [instant, setInstant] = useState(false);
  if (prev.count !== count || prev.sending !== sending) {
    setPrev({ count, sending });
    setInstant(prev.sending && !sending);
  }

  // Mouvement réduit : pas de repli à l'envoi.
  const folded = sending && !reducedMotion;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {PETALS.map((petal, i) => {
        const out = !folded && isOut(i, count);
        const width = 2 * petal.rx * PX_PER_UNIT;
        const height = 2 * petal.ry * PX_PER_UNIT;
        const transition = reducedMotion || instant ? INSTANT : out ? GROW : RETRACT;
        return (
          <div
            key={i}
            className="absolute h-0 w-0"
            style={{
              left: `${ANCHORS[i].left}%`,
              top: `${ANCHORS[i].top}%`,
              transform: `rotate(${petal.rotate}deg)`,
            }}
          >
            {/* Repère du pétale : "haut" = vers l'extérieur, base à l'ancrage. */}
            <motion.div
              className="absolute bottom-0"
              style={{ left: -width / 2, width, height, originX: 0.5, originY: 1 }}
              initial={false}
              animate={out ? OPEN : RETRACTED}
              transition={transition}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`${-petal.rx} ${-petal.ry} ${petal.rx * 2} ${petal.ry * 2}`}
              >
                <ellipse
                  cx={0}
                  cy={0}
                  rx={petal.rx}
                  ry={petal.ry}
                  className={PETAL_FILL_CLASS[petal.hue]}
                />
              </svg>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
