/**
 * Offre Upwork (une seule fiche produit "Project Catalog", 3 niveaux).
 * Données STRUCTURELLES uniquement ; les libellés traduisibles vivent
 * dans les catalogues i18n sous "Services.packages".
 *
 * Grille USD affichée sur /services (bascule EUR/USD) : 430/720/1150 $.
 * ⚠️ Écart TEMPORAIRE assumé (24/09/2026) : les annonces Upwork en ligne
 * sont encore à l'ancienne grille (150/350/650 $) — Ahmed les aligne une
 * par une. Tant que ce n'est pas fait, le prix affiché ici diffère de celui
 * vu sur Upwork.
 */

import type { TierId } from "@/lib/services-offers";

// Fiche produit Upwork (lien de base = tier Starter).
export const UPWORK_PRODUCT_URL =
  "https://www.upwork.com/services/product/development-it-a-modern-responsive-business-website-with-complete-source-files-2079604198186618555?ref=project_share";

const UPWORK_URLS = {
  starter: UPWORK_PRODUCT_URL,
  standard: `${UPWORK_PRODUCT_URL}&tier=1`,
  advanced: `${UPWORK_PRODUCT_URL}&tier=2`,
};

export interface UpworkPackage {
  /** Identifiant stable + nom affiché (Starter / Standard / Advanced) */
  name: string;
  /** Sous-titre du niveau */
  label: string;
  price: number;
  currency: "USD";
  delivery: number;
  revisions: number;
  /** Lien direct vers le bon tier Upwork */
  url: string;
  bilingual?: boolean;
  highlight?: boolean;
}

export const upworkOffer = {
  currency: "USD" as const,
  packages: [
    {
      name: "Starter",
      label: "One-page website",
      price: 430,
      currency: "USD",
      delivery: 5,
      revisions: 2,
      url: UPWORK_URLS.starter,
    },
    {
      name: "Standard",
      label: "Business website",
      price: 720,
      currency: "USD",
      delivery: 10,
      revisions: 3,
      highlight: true,
      url: UPWORK_URLS.standard,
    },
    {
      name: "Advanced",
      label: "Bilingual business website",
      price: 1150,
      currency: "USD",
      delivery: 14,
      revisions: 4,
      bilingual: true,
      url: UPWORK_URLS.advanced,
    },
  ] as UpworkPackage[],
};

/** Palier Upwork correspondant à chaque formule (même ordre, même périmètre). */
const UPWORK_TIER_INDEX: Record<TierId, number> = { starter: 0, standard: 1, advanced: 2 };
export function upworkPackageFor(tier: TierId): UpworkPackage {
  return upworkOffer.packages[UPWORK_TIER_INDEX[tier]];
}

/**
 * Annonce Upwork "Website Launch" (mise en ligne standard) — cible du
 * bouton "Voir la mise en ligne sur Upwork" du panneau "Votre sélection"
 * (parcours Upwork, mise en ligne cochée). Hébergement chez le client
 * uniquement côté Upwork (règle de non-contournement).
 *
 * Prix fixe de l'annonce (USD), affiché sur /services (carte mise en ligne
 * et panneau) — commande Upwork SÉPARÉE : jamais additionné au prix de la
 * formule, jamais dérivé du prix EUR.
 */
export const upworkLaunchOption = { price: 180, currency: "USD" as const };
export const UPWORK_LAUNCH_URL =
  "https://www.upwork.com/services/product/development-it-website-connected-to-a-live-domain-and-deployed-2103502174460233826?ref=project_share";
