import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bouton lecture/pause des animations automatiques de l'accueil (fond du
 * hero, défilement de la galerie — WCAG 2.2.2). Présentation seule : chaque
 * appelant garde son état et sa logique (aucune synchronisation entre eux),
 * et le place lui-même. Style partagé : .mh-play-pause (app/globals.css).
 *
 * Icône pause tant que l'animation tourne, lecture une fois arrêtée ; le nom
 * accessible suit l'action proposée (pas d'aria-pressed en plus : il
 * doublerait l'état déjà porté par le libellé).
 */
export function PlayPauseButton({
  paused,
  onToggle,
  pauseLabel,
  resumeLabel,
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  pauseLabel: string;
  resumeLabel: string;
  className?: string;
}) {
  const label = paused ? resumeLabel : pauseLabel;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={cn("mh-play-pause", className)}
    >
      {paused ? (
        <Play className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Pause className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
