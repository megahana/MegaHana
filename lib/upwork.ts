/**
 * Offre Upwork (une seule fiche produit "Project Catalog", 3 niveaux).
 * Données STRUCTURELLES uniquement ; les libellés traduisibles vivent
 * dans les catalogues i18n sous "Services.packages".
 *
 * ⚠️ Prix indicatifs : vérifier/ajuster pour correspondre EXACTEMENT aux
 * tiers Upwork si nécessaire.
 */

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
      price: 150,
      currency: "USD",
      delivery: 5,
      revisions: 2,
      url: UPWORK_URLS.starter,
    },
    {
      name: "Standard",
      label: "Business website",
      price: 350,
      currency: "USD",
      delivery: 10,
      revisions: 3,
      highlight: true,
      url: UPWORK_URLS.standard,
    },
    {
      name: "Advanced",
      label: "Bilingual business website",
      price: 650,
      currency: "USD",
      delivery: 14,
      revisions: 4,
      bilingual: true,
      url: UPWORK_URLS.advanced,
    },
  ] as UpworkPackage[],
};

/**
 * Stack technique commune affichée sur la page Services.
 * Valeurs STRUCTURELLES (icônes + noms techniques). Textes dans "Services.tech".
 */
export const techCommonIcons = [
  "Code2",
  "Palette",
  "Smartphone",
  "ImageIcon",
  "Search",
  "FileCode2",
] as const;

// Ordre des formules pour la section technique (clés de traduction).
export const techPackageOrder = [
  { name: "Starter", inherits: null },
  { name: "Standard", inherits: "Starter" },
  { name: "Advanced", inherits: "Standard" },
] as const;
