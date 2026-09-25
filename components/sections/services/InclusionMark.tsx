"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Coche / croix "inclus / non inclus" de la page Services (cartes des
 * formules, comparaison d'hébergement). Pictogramme porteur d'information :
 * - coche en or ACCESSIBLE (≥3:1 requis, WCAG 1.4.11 — l'or normal des
 *   listes décoratives ne l'atteint pas en thème clair) ;
 * - croix en gris atténué (text-muted) ;
 * - pas de vert/rouge (palette de marque) : la forme ✓/✕ porte
 *   l'information, la couleur ne fait que la renforcer ;
 * - texte "Inclus :" / "Non inclus :" (Services.marks) pour les lecteurs d'écran, lu juste
 *   avant le libellé qui suit.
 */
export function InclusionMark({ included, className }: { included: boolean; className?: string }) {
  const t = useTranslations("Services.marks");
  const Icon = included ? Check : X;
  return (
    <>
      <Icon
        aria-hidden="true"
        strokeWidth={2.5}
        className={cn(
          "w-4 h-4 shrink-0",
          included ? "text-gold-accessible" : "text-text-muted",
          className,
        )}
      />
      <span className="sr-only">{`${included ? t("included") : t("notIncluded")} `}</span>
    </>
  );
}
