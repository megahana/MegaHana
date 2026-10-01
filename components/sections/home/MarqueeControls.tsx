"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PlayPauseButton } from "@/components/ui/PlayPauseButton";
import { useMobileMarqueeAutoScroll } from "./useMobileMarqueeAutoScroll";

/**
 * Seule partie interactive de la Galerie : l'état pause/lecture et le
 * bouton qui le pilote. Les rangées de cartes (déjà rendues côté serveur
 * par Galerie.tsx) arrivent en children — ce composant se contente de les
 * poser dans son propre wrapper .marquee-stack et d'y toggler la classe
 * .paused (cf. sélecteur CSS partagé avec :hover/:focus-within dans
 * Galerie.tsx, les trois méthodes de pause coexistent).
 *
 * En mobile, le défilement n'est plus une animation CSS mais un défilement
 * réel piloté par useMobileMarqueeAutoScroll (swipe natif conservé) : le
 * même état `paused` le suspend, pour que le bouton ait le même effet partout.
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
  const stackRef = useRef<HTMLDivElement>(null);
  useMobileMarqueeAutoScroll(stackRef, paused);

  return (
    <>
      <div ref={stackRef} className={cn("marquee-stack", paused && "paused")}>
        {children}
      </div>
      {/* Sous le bandeau, aligné à droite dans les marges de la section (même
          verticale que le bouton du hero), hors des cartes et de leur
          découpe. */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4 flex justify-end motion-reduce:hidden">
        <PlayPauseButton
          paused={paused}
          onToggle={() => setPaused((p) => !p)}
          pauseLabel={pauseLabel}
          resumeLabel={resumeLabel}
        />
      </div>
    </>
  );
}
