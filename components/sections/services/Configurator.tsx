"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Button } from "@/components/ui/Button";
import { PackageCards } from "@/components/sections/services/PackageCards";
import { LaunchOption } from "@/components/sections/services/LaunchOption";
import { directOffers, launchOption, type TierId } from "@/lib/services-offers";

/**
 * Configurateur de devis : pilote PackageCards (radios) et LaunchOption
 * (checkbox) via un état local partagé, puis affiche un récapitulatif dont
 * le CTA final construit l'URL vers /contact avec la sélection en query
 * params (tier/launch) — seul mécanisme retenu pour transmettre la
 * sélection (compatible Server Components, aucune dépendance ajoutée).
 * Voir ContactPage (app/[locale]/contact/page.tsx) côté lecture.
 */
export function Configurator() {
  const t = useTranslations("Services.configurator");
  const tPackages = useTranslations("Services.packages");
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [launchEnabled, setLaunchEnabled] = useState(false);

  const total = selectedTier
    ? directOffers[selectedTier].price + (launchEnabled ? launchOption.price : 0)
    : null;

  return (
    <>
      <PackageCards selectedTier={selectedTier} onSelectTier={setSelectedTier} />
      <LaunchOption enabled={launchEnabled} onToggle={() => setLaunchEnabled((v) => !v)} />

      <section className="pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimateIn>
          <div className="card-border rounded-2xl p-px max-w-2xl mx-auto">
            <div className="bg-surface rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center">
              {selectedTier === null || total === null ? (
                <p className="text-sm text-text-secondary">{t("emptyState")}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-text-muted">{t("totalLabel")}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold gradient-text">{total}</span>
                    <span className="text-sm text-text-muted">€</span>
                  </div>
                  <p className="mt-3 text-xs text-text-muted">
                    {t("tierLine", {
                      tier: tPackages(`${selectedTier}.name`),
                      price: directOffers[selectedTier].price,
                    })}
                  </p>
                  <p className="text-xs text-text-muted">
                    {launchEnabled
                      ? t("launchIncluded", { price: launchOption.price })
                      : t("launchExcluded")}
                  </p>
                </>
              )}

              {selectedTier ? (
                <Button
                  href={`/contact?tier=${selectedTier}&launch=${launchEnabled ? 1 : 0}#discuss`}
                  variant="primary"
                  size="lg"
                  className="mt-6"
                >
                  {t("cta")}
                </Button>
              ) : (
                <Button type="button" variant="primary" size="lg" disabled className="mt-6">
                  {t("cta")}
                </Button>
              )}
            </div>
          </div>
        </AnimateIn>
      </section>
    </>
  );
}
