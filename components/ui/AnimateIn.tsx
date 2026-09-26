"use client";

import { motion, useInView } from "framer-motion";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface AnimateInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

const directionMap = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { y: 0, x: 30 },
  right: { y: 0, x: -30 },
  none: { y: 0, x: 0 },
};
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/**
 * Apparition d'un bloc — amélioration progressive : le contenu est VISIBLE
 * PAR DÉFAUT dans le HTML (jamais opacity:0 en attendant React).
 *
 * - Au premier affichage (HTML serveur, ou montage client) : courte entrée
 *   100 % CSS (.mh-animate-in, app/globals.css), qui se termine visible même
 *   si le JavaScript ne charge jamais.
 * - À l'hydratation (ou au montage client), un bloc encore SOUS l'écran est
 *   "armé" : masqué alors qu'il n'est pas visible (aucun flash visible →
 *   caché), puis révélé au scroll comme avant (framer-motion, useInView).
 *   Un bloc déjà à l'écran ou au-dessus n'est jamais re-masqué.
 * - Mouvement réduit : pas d'entrée CSS ; au scroll, framer ne garde que le
 *   fondu (MotionConfigProvider, reducedMotion="user"), comme avant.
 */
export function AnimateIn({ children, delay = 0, direction = "up", className }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const offset = directionMap[direction];

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Avant le paint qui suit l'hydratation : le bloc est-il entièrement
    // sous l'écran ? Seulement alors on peut le masquer sans que ça se voie.
    if (el.getBoundingClientRect().top >= window.innerHeight) {
      setArmed(true);
    }
  }, []);

  const visible = { opacity: 1, x: 0, y: 0 };
  const hidden = { opacity: 0, ...offset };

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={armed && !isInView ? hidden : visible}
      transition={armed && isInView ? { duration: 0.6, delay, ease: EASE } : { duration: 0 }}
      // Armé : plus d'entrée CSS (une animation CSS l'emporterait sur les
      // styles de framer et empêcherait le masquage).
      className={cn(!armed && "mh-animate-in", className)}
      style={
        {
          "--mh-animate-in-x": `${offset.x}px`,
          "--mh-animate-in-y": `${offset.y}px`,
          "--mh-animate-in-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      {children}
    </motion.div>
  );
}
