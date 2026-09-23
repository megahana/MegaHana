"use client";

import { useServerInsertedHTML } from "next/navigation";

interface Props {
  themeScript: string;
  /** Masque l'overlay d'intro avant le premier paint quand elle ne jouera pas (lib/intro.ts). */
  introSkipScript: string;
  jsonLd: string;
}

/**
 * Injecte les <script> (anti-flash thème, anti-flash intro + JSON-LD Organization) via
 * useServerInsertedHTML plutôt qu'en JSX direct dans le Server Component du
 * layout — React 19 avertit ("Encountered a script tag while rendering React
 * component") dès qu'un <script> est un enfant JSX rendu par un composant,
 * même si le script fonctionne correctement côté SSR (avertissement dev
 * documenté, pas un bug fonctionnel : shadcn-ui/ui#10104, react/react#34008).
 * useServerInsertedHTML est l'API Next.js prévue pour ce cas — insère le HTML
 * pendant le rendu serveur, hors de l'arbre de composants React, ce qui fait
 * disparaître l'avertissement à la racine plutôt que de le masquer.
 */
export function InsertedScripts({ themeScript, introSkipScript, jsonLd }: Props) {
  useServerInsertedHTML(() => (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <script dangerouslySetInnerHTML={{ __html: introSkipScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </>
  ));

  return null;
}
