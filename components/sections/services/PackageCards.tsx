"use client";

import { Check, Info, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { InclusionMark } from "@/components/sections/services/InclusionMark";
import {
  directOffers,
  tierIds,
  tierInclusions,
  ROUTE_CURRENCY_SYMBOL,
  type OrderRoute,
  type TierId,
} from "@/lib/services-offers";
import { upworkPackageFor } from "@/lib/upwork";

const FEATURE_KEYS = ["design", "content", "performance", "sources", "social"] as const;
const ROUTES: readonly OrderRoute[] = ["direct", "upwork"];

interface PackageCardsProps {
  selectedTier: TierId | null;
  onSelectTier: (tier: TierId) => void;
  /** Parcours : "direct" = prix EUR (devis), "upwork" = prix des annonces Upwork (USD). */
  route: OrderRoute;
  onRouteChange: (route: OrderRoute) => void;
}

function priceFor(tier: TierId, route: OrderRoute): number {
  return route === "direct" ? directOffers[tier].price : upworkPackageFor(tier).price;
}

/**
 * Sélecteur de parcours "En direct · €" / "Sur Upwork · $" : change les prix
 * des cartes, la carte mise en ligne et le panneau "Votre sélection".
 * Groupe de boutons radio natifs (flèches clavier, un seul arrêt de
 * tabulation), stylés en contrôle segmenté.
 */
function RouteToggle({
  route,
  onChange,
}: {
  route: OrderRoute;
  onChange: (route: OrderRoute) => void;
}) {
  const t = useTranslations("Services.packages.route");
  return (
    <fieldset className="mt-8 flex justify-center">
      <legend className="sr-only">{t("legend")}</legend>
      <div className="inline-flex rounded-xl border border-border bg-surface-2 p-1">
        {ROUTES.map((r) => (
          <label
            key={r}
            className={cn(
              "cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-accessible",
              route === r
                ? "bg-gradient-accessible text-accent-contrast shadow"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <input
              type="radio"
              name="order-route"
              value={r}
              checked={route === r}
              onChange={() => onChange(r)}
              className="sr-only"
            />
            {t(r)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PackageCards({
  selectedTier,
  onSelectTier,
  route,
  onRouteChange,
}: PackageCardsProps) {
  const t = useTranslations("Services.packages");

  return (
    // Padding symétrique standard (identique à LaunchOption/FaqAccordion/
    // ProjectProcess/QualitySection) — un correctif du 25/09 l'avait resserré
    // en haut pour repousser "LES FORMULES" hors du premier écran, mais le
    // correctif du 26/09 (voir app/[locale]/services/page.tsx, section hero+
    // intro en min-height calc) règle ça à la source : cette section démarre
    // maintenant toujours après le fold, son propre padding n'a plus besoin
    // d'être spécial.
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AnimateIn>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("description")}
        />
      </AnimateIn>

      <RouteToggle route={route} onChange={onRouteChange} />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {tierIds.map((tier, i) => {
          const isSelected = selectedTier === tier;
          // Seules différences réelles entre paliers : coche/croix en tête de
          // liste (le reste de la liste est identique sur les 3 formules).
          const differences = [
            { key: "multiplePages", included: tierInclusions[tier].multiplePages },
            { key: "multilingual", included: tierInclusions[tier].multilingual },
          ] as const;
          return (
            <AnimateIn key={tier} delay={i * 0.1}>
              <label className="tier-card card-border rounded-2xl p-px h-full block cursor-pointer">
                <input
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={isSelected}
                  onChange={() => onSelectTier(tier)}
                  aria-label={t(`${tier}.name`)}
                  className="sr-only"
                />
                <div className="relative bg-surface rounded-2xl h-full p-6 sm:p-8 flex flex-col">
                  <CheckCircle2
                    aria-hidden="true"
                    className={cn(
                      "absolute top-4 right-4 w-6 h-6",
                      isSelected ? "text-accent-accessible" : "text-text-muted",
                    )}
                  />
                  <h3 className="text-xl font-semibold text-text-primary">{t(`${tier}.name`)}</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    {t(`${tier}.description`)}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold gradient-text">
                      {priceFor(tier, route)}
                    </span>
                    <span className="text-sm text-text-muted">{ROUTE_CURRENCY_SYMBOL[route]}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary">
                      {t(`${tier}.pages`)}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary">
                      {t(`${tier}.languages`)}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2.5 flex-1">
                    {differences.map(({ key, included }) => (
                      <li
                        key={key}
                        className={cn(
                          "flex items-start gap-2.5 text-sm",
                          included ? "font-medium text-text-primary" : "text-text-muted",
                        )}
                      >
                        <InclusionMark included={included} className="mt-0.5" />
                        <span>{t(`differences.${key}`)}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-gold-accessible shrink-0 mt-0.5" />
                      <span>{t(`${tier}.responsive`)}</span>
                    </li>
                    {FEATURE_KEYS.map((key) => (
                      <li
                        key={key}
                        className="flex items-start gap-2.5 text-sm text-text-secondary"
                      >
                        <Check className="w-4 h-4 text-gold-accessible shrink-0 mt-0.5" />
                        <span>{t(`features.${key}`)}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-xs text-text-muted">{t("schedule")}</p>
                </div>
              </label>
            </AnimateIn>
          );
        })}
      </div>

      <AnimateIn>
        <div className="max-w-2xl mx-auto mt-10 space-y-2.5">
          <p className="flex items-start gap-2.5 text-sm text-text-secondary">
            <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span>{t("commonNote")}</span>
          </p>
          <p className="flex items-start gap-2.5 text-sm text-text-muted">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t("externalNote")}</span>
          </p>
        </div>
      </AnimateIn>
    </section>
  );
}
