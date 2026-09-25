"use client";

import { MotionConfig } from "framer-motion";

/**
 * Politique "prefers-reduced-motion" pour tous les composants motion.* du
 * site (recette V1, priorité 3). reducedMotion="user" respecte le réglage
 * OS/navigateur et désactive automatiquement, pour ces composants, les
 * animations de transform (x/y/scale/rotate) ET de propriétés positionnelles
 * comme height/width (confirmé dans le code source de motion-dom :
 * render/utils/keys-position.mjs, positionalKeys inclut width/height/top/
 * left/right/bottom en plus des props de transform) — l'opacité continue de
 * s'animer normalement, ce qui reste un fondu acceptable en accessibilité.
 *
 * Couvre ainsi AnimateIn.tsx, ProjectDetailsDrawer.tsx, FaqList.tsx (/faq),
 * le menu mobile du Header et MobileCtaBanner.tsx (tous animent height/x/y
 * en plus de l'opacité) sans avoir à modifier chacun individuellement.
 *
 * Ne couvre PAS les animations CSS pures (classes Tailwind, @keyframes) —
 * celles déjà en place (rebond du teaser, dégradé du Hero, overlay
 * ImageWithLoader) restent gérées par leurs propres media queries
 * prefers-reduced-motion, volontairement non touchées ici. ProjectGallery.tsx
 * garde aussi sa propre logique via useReducedMotion() (variants différents
 * pour le slide du carrousel) — indépendante de ce provider, non redondante.
 */
export function MotionConfigProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
