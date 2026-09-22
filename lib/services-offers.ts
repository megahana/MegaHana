/**
 * Offre directe (devis-first, canal prioritaire) — 3 paliers en EUR.
 * Données STRUCTURELLES uniquement ; les libellés traduisibles vivent
 * dans les catalogues i18n sous "Services.packages"/"Services.launch".
 *
 * Grille calculée à partir du temps de travail réel × un TJM cible (250 €/j)
 * — PAS une conversion des prix Upwork. Détail et méthode : voir le modèle
 * commercial (document interne, hors dépôt).
 *
 * Périmètre (pages/langues/fonctionnalités) volontairement IDENTIQUE à
 * l'offre Upwork correspondante (lib/upwork.ts) — une seule offre, deux
 * grilles de prix selon le canal.
 *
 * ⚠️ Délai de livraison et nombre de révisions volontairement ABSENTS ici :
 * contrairement à Upwork (engagement de plateforme), ils ne sont pas encore
 * fixés pour le direct — confirmés au cas par cas dans le devis. Ne pas
 * réutiliser les valeurs de lib/upwork.ts (5/10/14 jours, 2/3/4 révisions)
 * pour le canal direct.
 */

export const tierIds = ["starter", "standard", "advanced"] as const;
export type TierId = (typeof tierIds)[number];

export interface DirectOffer {
  price: number;
  currency: "EUR";
}

export const directOffers: Record<TierId, DirectOffer> = {
  starter: { price: 380, currency: "EUR" },
  standard: { price: 650, currency: "EUR" },
  advanced: { price: 990, currency: "EUR" },
};

/**
 * Option "mise en ligne standard" — périmètre fixe (domaine/DNS, config
 * hébergeur, premier déploiement, vérifications de base, transmission des
 * accès). Migration d'un site existant ou configuration complexe (DNS
 * multi-sous-domaines, reprise d'un hébergeur tiers) : hors périmètre,
 * devis séparé (voir Services.launch dans les catalogues i18n).
 */
export const launchOption: DirectOffer = { price: 150, currency: "EUR" };
