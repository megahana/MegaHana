/**
 * Mémorisation "intro déjà jouée" dans la session — partagée entre l'intro
 * (components/sections/home/Intro.tsx, qui l'écrit et la lit) et le script
 * anti-flash du layout (app/[locale]/layout.tsx), qui la lit AVANT le
 * premier paint pour masquer l'overlay d'emblée (cf. .mh-intro-overlay dans
 * app/globals.css).
 */
export const INTRO_SESSION_KEY = "introPlayed";

/** Attribut posé sur <html> quand l'intro ne jouera pas (session déjà vue ou mouvement réduit). */
export const INTRO_SKIP_ATTRIBUTE = "data-intro";
export const INTRO_SKIP_VALUE = "skip";

/**
 * Script inline exécuté avant le premier paint (même mécanisme que le script
 * anti-flash du thème). Sans lui, le HTML serveur peignait l'overlay
 * (« megahana » + « Passer l'intro ») jusqu'à l'hydratation, même quand
 * l'intro ne devait pas jouer — Intro.tsx ne le masque qu'après.
 */
export const introSkipScript = `(function(){try{
  var played=false;
  try{played=sessionStorage.getItem(${JSON.stringify(INTRO_SESSION_KEY)})==="1";}catch(e){}
  var reduced=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if(played||reduced){document.documentElement.setAttribute(${JSON.stringify(INTRO_SKIP_ATTRIBUTE)},${JSON.stringify(INTRO_SKIP_VALUE)});}
}catch(e){}})();`;
