"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  directOffers,
  formatRoutePrice,
  launchOption,
  type OrderRoute,
  type TierId,
} from "@/lib/services-offers";
import { UPWORK_LAUNCH_URL, upworkLaunchOption, upworkPackageFor } from "@/lib/upwork";

/**
 * Panneau flottant "Votre sélection" de /services (remplace l'ancien
 * récapitulatif en bas de page). Monté par Configurator seulement après
 * une première interaction (formule ou mise en ligne) — jamais au
 * chargement, aucune formule présélectionnée.
 *
 * Deux parcours, jamais mélangés dans un même montant :
 * - direct : formule + mise en ligne en EUR, "Total estimé", CTA devis
 *   (sélection transmise à /contact en query params, lue par ContactPage) ;
 * - upwork : prix USD de la formule seule + CTA vers son annonce ; si la
 *   mise en ligne est cochée, ligne à son prix d'annonce (180 $) + mention
 *   "disponible séparément" + CTA séparé vers l'annonce Upwork "Website
 *   Launch" (UPWORK_LAUNCH_URL) — deux commandes, jamais additionnées.
 *
 * Position : ordinateur (≥640px) fixe bas-droite, déplié à l'apparition ;
 * mobile, barre compacte fixe en bas, détail uniquement à la demande. Le
 * repli est un vrai bouton (aria-expanded) ; le <body> reçoit un padding
 * bas égal à la hauteur du panneau pour qu'aucun contenu ne reste masqué.
 * Pas de vol de focus ; le montant est annoncé par la zone live de
 * Configurator, pas ici. Apparition : fondu + léger glissé (glissé coupé
 * en mouvement réduit par MotionConfigProvider).
 */
export function SelectionPanel({
  route,
  selectedTier,
  launchEnabled,
}: {
  route: OrderRoute;
  selectedTier: TierId | null;
  launchEnabled: boolean;
}) {
  const t = useTranslations("Services.selection");
  const tPackages = useTranslations("Services.packages");
  const tc = useTranslations("Common");
  const titleId = useId();
  const bodyId = useId();
  const panelRef = useRef<HTMLElement>(null);
  // Monté côté client uniquement (après une interaction) : lecture directe
  // de la largeur. Ordinateur : déplié ; mobile : barre compacte.
  const [expanded, setExpanded] = useState(() => window.matchMedia("(min-width: 640px)").matches);

  // Réserve la hauteur du panneau en bas de page (fin de page jamais masquée).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const previous = document.body.style.paddingBottom;
    const observer = new ResizeObserver(() => {
      document.body.style.paddingBottom = `${Math.ceil(panel.getBoundingClientRect().height) + 16}px`;
    });
    observer.observe(panel);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = previous;
    };
  }, []);

  const isDirect = route === "direct";
  const tierName = selectedTier ? tPackages(`${selectedTier}.name`) : "";
  const tierPrice = selectedTier
    ? isDirect
      ? directOffers[selectedTier].price
      : upworkPackageFor(selectedTier).price
    : null;
  const directTotal =
    isDirect && tierPrice !== null ? tierPrice + (launchEnabled ? launchOption.price : 0) : null;
  // Montants formatés (une seule grille par parcours, jamais mélangées).
  const tierAmount = tierPrice === null ? null : formatRoutePrice(tierPrice, route);
  const totalAmount = directTotal === null ? null : formatRoutePrice(directTotal, "direct");
  const headerAmount = isDirect ? totalAmount : tierAmount;

  const toggle = () => setExpanded((v) => !v);

  return (
    <motion.aside
      ref={panelRef}
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-40 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[22rem]"
    >
      <div className="card-border rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/20">
        <div className="rounded-t-2xl sm:rounded-2xl bg-surface pb-[env(safe-area-inset-bottom)] sm:pb-0">
          {/* En-tête : toujours visible (titre, montant, repli). */}
          <div className="flex items-center gap-3 px-4 py-3">
            <h2 id={titleId} className="font-sans text-sm font-semibold text-text-primary">
              {t("title")}
            </h2>
            {headerAmount && (
              <span className="ml-auto text-lg font-bold gradient-text whitespace-nowrap">
                {headerAmount}
              </span>
            )}
            {/* UN seul bouton (le focus clavier reste dessus quand on replie/
                déplie). Nom accessible = texte visible quand il y en a :
                mobile replié "Voir le détail" ; sinon icône + texte sr-only
                "Afficher/Réduire le résumé de votre sélection". */}
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={bodyId}
              onClick={toggle}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-1 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-accessible",
                !headerAmount && "ml-auto",
                expanded
                  ? "h-9 w-9"
                  : "border border-border px-3 py-2 text-xs font-medium text-text-primary sm:h-9 sm:w-9 sm:border-0 sm:p-0",
              )}
            >
              {expanded ? (
                <>
                  <span className="sr-only">{t("collapse")}</span>
                  <ChevronDown className="w-5 h-5" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span className="sm:hidden">{t("viewDetails")}</span>
                  <span className="sr-only hidden sm:inline">{t("expand")}</span>
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {/* Détail : masqué (hidden) quand replié, pour garder aria-controls valide. */}
          <div
            id={bodyId}
            hidden={!expanded}
            className="max-h-[60vh] overflow-y-auto border-t border-border px-4 pb-4 pt-3"
          >
            {selectedTier === null ? (
              <p className="text-sm text-text-secondary">{t("empty")}</p>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-text-secondary">{t("tierLine", { name: tierName })}</dt>
                  <dd className="font-medium text-text-primary whitespace-nowrap">{tierAmount}</dd>
                </div>
                {isDirect && launchEnabled && (
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-text-secondary">{t("launchLine")}</dt>
                    <dd className="font-medium text-text-primary whitespace-nowrap">
                      {formatRoutePrice(launchOption.price, "direct")}
                    </dd>
                  </div>
                )}
                {isDirect && (
                  <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2">
                    <dt className="font-semibold text-text-primary">{t("total")}</dt>
                    <dd className="text-lg font-bold gradient-text whitespace-nowrap">
                      {totalAmount}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {/* Parcours direct : un seul CTA, la mise en ligne est dans la demande de devis. */}
            {isDirect && selectedTier && (
              <Button
                href={`/contact?tier=${selectedTier}&launch=${launchEnabled ? 1 : 0}#discuss`}
                variant="primary"
                size="md"
                className="mt-4 w-full"
              >
                {t("ctaDirect")}
              </Button>
            )}

            {/* Parcours Upwork : formule seule, puis mise en ligne à part (jamais sommées). */}
            {!isDirect && selectedTier && (
              <Button
                href={upworkPackageFor(selectedTier).url}
                external
                variant="primary"
                size="md"
                ariaLabel={`${t("ctaUpwork")} ${tc("newTab")}`}
                className="mt-4 w-full"
              >
                {t("ctaUpwork")}
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
            {!isDirect && launchEnabled && (
              <div className="mt-4 space-y-3">
                <dl className="text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-text-secondary">{t("launchLine")}</dt>
                    <dd className="font-medium text-text-primary whitespace-nowrap">
                      {formatRoutePrice(upworkLaunchOption.price, "upwork")}
                    </dd>
                  </div>
                </dl>
                <p className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text-secondary leading-relaxed">
                  {t("launchSeparate")}
                </p>
                <Button
                  href={UPWORK_LAUNCH_URL}
                  external
                  variant="outline"
                  size="md"
                  ariaLabel={`${t("ctaUpworkLaunch")} ${tc("newTab")}`}
                  className="w-full"
                >
                  {t("ctaUpworkLaunch")}
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
