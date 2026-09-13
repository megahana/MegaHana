"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Seule partie interactive de la Galerie : l'état pause/lecture et le
 * bouton qui le pilote. Les rangées de cartes (déjà rendues côté serveur
 * par Galerie.tsx) arrivent en children — ce composant se contente de les
 * poser dans son propre wrapper .marquee-stack et d'y toggler la classe
 * .paused (cf. sélecteur CSS partagé avec :hover/:focus-within dans
 * Galerie.tsx, les trois méthodes de pause coexistent).
 */
export function MarqueeControls({
  pauseLabel,
  resumeLabel,
  children,
}: {
  pauseLabel: string;
  resumeLabel: string;
  children: React.ReactNode;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 mb-3 flex justify-end motion-reduce:hidden">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? resumeLabel : pauseLabel}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-border-light hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {paused ? (
            <Play className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Pause className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <div className={cn("marquee-stack", paused && "paused")}>{children}</div>
    </>
  );
}
