"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

interface Props {
  /** Nonce CSP de la requête (essai Report-Only, proxy.ts) ; absent hors essai. */
  nonce?: string;
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
 *
 * Une seule insertion par page : Next rappelle ce callback à CHAQUE envoi
 * d'un morceau du HTML en streaming (le contenu renvoyé est ajouté à chaque
 * fois) — c'est pourquoi les registres CSS-in-JS de la doc Next vident leur
 * registre après chaque appel. Ici le contenu est fixe : un drapeau, propre
 * à ce rendu (un composant par requête), ne le laisse passer qu'au premier
 * envoi, qui est aussi le plus tôt (thème et intro appliqués avant le premier
 * affichage). Sans lui, les trois scripts sortaient 4 fois par page.
 */
export function InsertedScripts({ nonce, themeScript, introSkipScript, jsonLd }: Props) {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: introSkipScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </>
    );
  });

  return null;
}
