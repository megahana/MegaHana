/**
 * Versioning du site MegaMind Studio.
 *
 * ⚠️ Ne PAS incrémenter la version à chaque commit.
 * La version ne change QUE lors d'une vraie release / livraison :
 *   • 1.0.1 → correction mineure : bug fix, texte, SEO, metadata, petite retouche
 *   • 1.1.0 → ajout visible : nouvelle section / fonctionnalité importante
 *   • 2.0.0 → refonte majeure : architecture ou design
 *
 * `siteVersion.lastUpdated` = date de la dernière release du SITE.
 * `legalVersion.lastUpdated` = date du dernier changement des PAGES LÉGALES.
 *   → à mettre à jour UNIQUEMENT quand le contenu légal change
 *     (elle est volontairement indépendante de la version du site).
 *
 * Tenir aussi le CHANGELOG.md à la racine à jour à chaque release.
 */
export const siteVersion = {
  version: "1.1.0",
  releaseDate: "2026-07-22",
  lastUpdated: "2026-07-22",
};

export const legalVersion = {
  // Mis à jour : migration Fiverr → Upwork (CGV, mentions, confidentialité).
  lastUpdated: "2026-07-22",
};
