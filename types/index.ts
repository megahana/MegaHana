export interface GalleryImage {
  src: string;
  label: string;
  description?: string;
}

/**
 * Données STRUCTURELLES d'une étude de cas (non traduisibles).
 * Les textes (tagline, intro, fonctionnalités, défis…) vivent dans les
 * catalogues i18n sous "Portfolio.caseStudy".
 */
export interface CaseStudy {
  mobileImage?: string;
  /** Icônes (clés lucide) des groupes de fonctionnalités, alignées par index */
  featureIcons?: string[];
  /** Icônes (clés lucide) des défis techniques, alignées par index */
  challengeIcons?: string[];
}

/** Statut d'un projet portfolio — vrai client livré, démo en ligne, ou démo pas encore prête. */
export type PortfolioStatus = "real-client" | "demo-live" | "demo-upcoming";

/** Les 8 secteurs des sites de démonstration (slugs ASCII, voir ETAT-PROJET-MEGAHANA.md §3). */
export type Sector =
  | "artisans"
  | "artistes"
  | "startup"
  | "restaurant"
  | "architecte"
  | "musicien"
  | "mode"
  | "bien-etre";

export interface Project {
  id: string;
  title: string;
  url?: string;
  githubUrl?: string;
  tags?: string[];
  images?: {
    homepage?: string;
    logo?: string;
  };
  /** Chemins des captures (légendes traduites dans les catalogues) */
  gallerySrc?: string[];
  techStack?: { name: string; color: "default" | "primary" | "sakura" | "gold" }[];
  caseStudy?: CaseStudy;
  featured?: boolean;

  /* ── Portfolio évolutif (Phase 10) — voir docs/MEGAHANA-PLAN-REFONTE.md §7 ── */
  status: PortfolioStatus;
  /** null pour les projets réels (MegaReco) — pas de secteur démo. MegaTaste
   *  est une démo vitrine (status "demo-live"), pas un client réel : elle a
   *  un secteur ("restaurant"), comme les autres démos. */
  sector: Sector | null;
  /** Regroupe les 2 démos d'un même secteur (ex. "artisans"). */
  pairSlug?: string;
  /** Descripteur court style Galerie ("Storytelling · Matière") — non traduit, affiché tel quel. */
  descriptor?: string;
  /** Courte phrase d'accroche affichée sur les cartes réelles de la Galerie — non traduite, affichée telle quelle (même convention que descriptor). */
  teaser?: string;
  posterImage?: string;
  previewVideo?: string;
}
