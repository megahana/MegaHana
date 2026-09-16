"use client";

import { useEffect } from "react";

/**
 * Déplace le focus clavier sur l'élément ciblé par le hash de l'URL au
 * montage — sans quoi une ancre interne (ex. #discuss sur /contact) ne
 * fonctionne correctement au clavier/lecteur d'écran que dans certains cas :
 *
 * - Navigation directe par URL (#discuss déjà présent au chargement) : le
 *   navigateur scrolle ET focus nativement l'élément ciblé (tabIndex={-1}
 *   requis pour qu'il soit focusable) — ce composant est alors redondant
 *   mais inoffensif (refocaliser un élément déjà focalisé ne fait rien).
 * - Navigation client-side (Link next-intl vers /autre-page#discuss) : le
 *   routeur Next.js scrolle bien jusqu'à la cible, mais NE déplace PAS le
 *   focus — ce n'est pas une vraie navigation de document du point de vue
 *   du navigateur, donc son comportement natif de focus sur fragment ne
 *   s'applique pas. C'est le cas que ce composant corrige.
 *
 * Monté une fois sur la page qui porte l'ancre cible (pas sur la page de
 * départ) : chaque montage réel de ce composant (donc chaque navigation,
 * client-side ou non, vers cette page) relit le hash courant.
 *
 * Le focus attend la fin réelle du scroll (événement scrollend) plutôt qu'un
 * délai fixe deviné — la page utilise scroll-behavior:smooth (globals.css),
 * qui peut prendre plusieurs centaines de ms selon la distance : focaliser
 * avant la fin du scroll déplacerait le focus sur un élément pas encore
 * visible. Repli par délai si scrollend ne se déclenche jamais (navigateur
 * sans support, ou élément déjà dans la zone visible sans scroll à faire).
 */
export function HashFocus() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;

    let done = false;
    function focusTarget() {
      if (done) return;
      done = true;
      // preventScroll : le scroll est déjà terminé à ce stade (scrollend) ou
      // inutile (repli), focus() ne doit pas en déclencher un second.
      target!.focus({ preventScroll: true });
    }

    window.addEventListener("scrollend", focusTarget, { once: true });
    const fallback = window.setTimeout(focusTarget, 600);

    return () => {
      window.removeEventListener("scrollend", focusTarget);
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
