"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PackageCards } from "@/components/sections/services/PackageCards";
import { LaunchOption } from "@/components/sections/services/LaunchOption";
import { SelectionPanel } from "@/components/sections/services/SelectionPanel";
import {
  directOffers,
  formatRoutePrice,
  launchOption,
  type OrderRoute,
  type TierId,
} from "@/lib/services-offers";
import { upworkLaunchOption, upworkPackageFor } from "@/lib/upwork";

/**
 * Configurateur de /services : état partagé entre PackageCards (radios des
 * formules + sélecteur de parcours), LaunchOption (checkbox) et le panneau
 * flottant "Votre sélection" (SelectionPanel), qui remplace l'ancien
 * récapitulatif en flux de page.
 *
 * - Aucune formule présélectionnée ; le panneau n'apparaît qu'après une
 *   première interaction (formule ou mise en ligne).
 * - Deux parcours, pas deux devises : "direct" (EUR, devis) / "upwork"
 *   (USD, annonces). Changer de parcours ne décoche jamais la mise en ligne :
 *   sur Upwork elle passe visiblement à son annonce séparée (180 $, jamais
 *   additionnée au prix de la formule).
 * - Parcours direct : le CTA transmet la sélection à /contact en query
 *   params (tier/launch), lue côté serveur par ContactPage
 *   (app/[locale]/contact/page.tsx) pour pré-remplir sujet et message.
 * - Zone live (toujours montée, vide avant la première sélection) : annonce
 *   le montant à chaque changement, sans voler le focus.
 */
export function Configurator() {
  const t = useTranslations("Services.selection");
  const tPackages = useTranslations("Services.packages");
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [launchEnabled, setLaunchEnabled] = useState(false);
  const [route, setRoute] = useState<OrderRoute>("direct");
  const [hasInteracted, setHasInteracted] = useState(false);

  const selectTier = (tier: TierId) => {
    setSelectedTier(tier);
    setHasInteracted(true);
  };
  const toggleLaunch = () => {
    setLaunchEnabled((v) => !v);
    setHasInteracted(true);
  };

  // Texte annoncé : une seule grille par parcours, jamais de somme mélangée.
  let liveText = "";
  if (selectedTier) {
    if (route === "direct") {
      const total = directOffers[selectedTier].price + (launchEnabled ? launchOption.price : 0);
      liveText = t("liveDirect", { price: formatRoutePrice(total, "direct") });
    } else {
      liveText = t("liveUpwork", {
        name: tPackages(`${selectedTier}.name`),
        price: formatRoutePrice(upworkPackageFor(selectedTier).price, "upwork"),
      });
      // Point entre les deux phrases : une pause à l'oreille (lecteur d'écran).
      // Prix de l'annonce Website Launch lu à la fin, comme affiché.
      if (launchEnabled)
        liveText += `. ${t("liveUpworkLaunch", {
          separate: t("launchSeparate"),
          price: formatRoutePrice(upworkLaunchOption.price, "upwork"),
        })}`;
    }
  }

  return (
    <>
      <PackageCards
        selectedTier={selectedTier}
        onSelectTier={selectTier}
        route={route}
        onRouteChange={setRoute}
      />
      <LaunchOption enabled={launchEnabled} onToggle={toggleLaunch} route={route} />

      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </p>

      {hasInteracted && (
        <SelectionPanel route={route} selectedTier={selectedTier} launchEnabled={launchEnabled} />
      )}
    </>
  );
}
