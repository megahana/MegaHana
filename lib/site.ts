/**
 * Source unique de l'URL du site.
 * En production, définir NEXT_PUBLIC_SITE_URL sur le domaine canonique définitif.
 * La valeur de secours sert uniquement tant que le domaine n'est pas connecté.
 */
const FALLBACK_URL = "https://megamind-studio.com";

// URL normalisée (sans barre oblique finale) pour éviter les doubles "/".
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL).replace(/\/+$/, "");

// Page LinkedIn officielle de Megahana (source unique réutilisée dans le site).
export const LINKEDIN_STUDIO_URL = "https://www.linkedin.com/company/megahana";

/**
 * Logo officiel — icône "fleur pixel" Megahana, image LOCALE (app/icon.png,
 * servie par Next sur /icon.png). PNG carré 1254×1254 avec canal alpha (centre
 * et fond transparents) → s'adapte à tout fond (light/dark), pas de rectangle
 * sombre. Aucune dépendance externe. Taille d'affichage pilotée par le CSS
 * (h-12 w-12, fixe sur tous les breakpoints — correction 14/09 : sous 48px le
 * détail pixel/mosaïque de l'icône devenait peu lisible, voir système de
 * marque) ; on déclare le ratio réel (carré) pour éviter toute déformation.
 */
export const LOGO_URL = "/icon.png";
export const LOGO_WIDTH = 1254;
export const LOGO_HEIGHT = 1254;

/* ─── i18n / SEO multilingue ───────────────────────────────────── */

export const OG_LOCALES: Record<string, string> = { fr: "fr_FR", en: "en_US" };

/**
 * Construit les métadonnées localisées d'une page.
 * @param locale langue courante ("fr" | "en")
 * @param path   chemin SANS préfixe de langue ("" pour l'accueil, "/services"…)
 */
// Image Open Graph partagée (convention fichier app/opengraph-image.png, 1200×400).
// Déclarée explicitement ici car le merge de métadonnées Next écrase l'openGraph
// hérité dès qu'une page définit le sien : on garantit ainsi og:image + twitter:image
// sur chaque page.
const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 400,
  alt: "Megahana",
};

export function localizedMetadata(locale: string, path: string) {
  const other = locale === "fr" ? "en" : "fr";
  return {
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        fr: `/fr${path}`,
        en: `/en${path}`,
        "x-default": `/fr${path}`,
      },
    },
    openGraph: {
      type: "website" as const,
      siteName: "Megahana",
      url: `/${locale}${path}`,
      locale: OG_LOCALES[locale],
      alternateLocale: OG_LOCALES[other],
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [OG_IMAGE.url],
    },
  };
}
