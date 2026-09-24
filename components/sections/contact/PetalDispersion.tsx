"use client";

import { motion } from "framer-motion";
import { PETALS, PETAL_FILL_CLASS } from "@/lib/logo-geometry";
import { BLOOM_EASE } from "@/lib/logo-bloom";

/**
 * Dispersion CONTENUE de pétales derrière la carte de succès du formulaire
 * de contact (choisie au labo, variante "A+"). Volontairement pas une
 * explosion confetti :
 * - 5 pétales, un par pétale du logo (forme, couleur et angle de PETALS) ;
 * - trajectoires fixes (aucun aléatoire), courte distance ;
 * - même courbe que l'éclosion, pas de physique ni de rebond ;
 * - ≈600ms au total, fondu de sortie ;
 * - calque SOUS la carte (le parent pose z-10 sur la carte, isolate autour) :
 *   les pétales partent de derrière, juste en retrait des bords, et ne sont
 *   visibles qu'en en sortant — jamais devant le texte.
 * Décorative (aria-hidden). Jamais rendue en mouvement réduit (cf. ContactForm).
 */

/** Distance parcourue par chaque pétale (px). */
const TRAVEL_PX = 36;
/** Départ en retrait sous la carte (px) : seule la fin du trajet dépasse. */
const START_INSET_PX = 12;
/** Dérive de rotation, identique pour tous (pas de rotation chaotique). */
const DRIFT_DEG = 12;
/** Hauteur d'affichage d'un pétale (px). */
const PETAL_HEIGHT_PX = 16;
const PETAL_MS = 520;
const STAGGER_MS = 20;
/** Opacité : invisible sous la carte, visible en sortant, puis fondu (fractions de PETAL_MS). */
const OPACITY_KEYFRAMES = [0, 0, 1, 0];
const OPACITY_TIMES = [0, 0.25, 0.45, 1];

/**
 * Départ sur le pourtour de la carte (en % de sa taille) et direction de
 * sortie (normalisée plus bas) : haut-gauche, haut-droite, droite, bas,
 * gauche — un pétale par côté ou coin, dans l'ordre horaire des pétales.
 */
const ANCHORS = [
  { left: 18, top: 0, dx: -0.45, dy: -1 },
  { left: 82, top: 0, dx: 0.55, dy: -1 },
  { left: 100, top: 62, dx: 1, dy: 0.25 },
  { left: 30, top: 100, dx: -0.35, dy: 1 },
  { left: 0, top: 38, dx: -1, dy: -0.2 },
] as const;

export function PetalDispersion() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {PETALS.map((petal, i) => {
        const anchor = ANCHORS[i];
        const length = Math.hypot(anchor.dx, anchor.dy);
        const ux = anchor.dx / length;
        const uy = anchor.dy / length;
        const width = (PETAL_HEIGHT_PX * petal.rx) / petal.ry;
        const delay = (i * STAGGER_MS) / 1000;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${anchor.left}%`,
              top: `${anchor.top}%`,
              width,
              height: PETAL_HEIGHT_PX,
              marginLeft: -width / 2,
              marginTop: -PETAL_HEIGHT_PX / 2,
            }}
            initial={{
              x: -ux * START_INSET_PX,
              y: -uy * START_INSET_PX,
              rotate: petal.rotate,
              opacity: 0,
            }}
            animate={{
              x: ux * (TRAVEL_PX - START_INSET_PX),
              y: uy * (TRAVEL_PX - START_INSET_PX),
              rotate: petal.rotate + DRIFT_DEG,
              opacity: OPACITY_KEYFRAMES,
            }}
            transition={{
              duration: PETAL_MS / 1000,
              delay,
              ease: BLOOM_EASE,
              opacity: {
                duration: PETAL_MS / 1000,
                delay,
                times: OPACITY_TIMES,
                ease: "linear",
              },
            }}
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
        );
      })}
    </div>
  );
}
