import { routing } from "@/i18n/routing";

/**
 * Mémorisation "intro déjà jouée" dans la session — partagée entre l'intro
 * (components/sections/home/Intro.tsx, qui l'écrit et la lit) et le script
 * inline du layout (app/[locale]/layout.tsx), qui la lit AVANT le premier
 * paint.
 */
export const INTRO_SESSION_KEY = "introPlayed";

/**
 * État de l'intro, posé sur <html> :
 * - absent : l'intro ne joue pas (défaut, page utilisable — aussi sans JS) ;
 * - "play" : l'intro couvre la page (seul état où l'overlay est affiché,
 *   cf. .mh-intro-overlay dans app/globals.css) ;
 * - "skip" : session déjà vue ou mouvement réduit (posé avant le premier
 *   paint ; déclenche aussi la courte apparition CSS du hero) ;
 * - "done" : intro terminée, passée, ou abandonnée par un garde-fou.
 */
export const INTRO_ATTRIBUTE = "data-intro";
/** Posé par Intro.tsx quand son code prend la main (animation prête à jouer). */
export const INTRO_READY_ATTRIBUTE = "data-intro-ready";

/** Délai max pour que le code de l'intro prenne la main (JS lent ou en échec). */
const READY_TIMEOUT_MS = 5000;
/** Durée max d'une intro démarrée (normale : ≈1,3s) avant de rendre la page. */
const RUN_TIMEOUT_MS = 4000;

/** Accueil uniquement (/fr, /en…) : l'overlay n'existe nulle part ailleurs. */
const HOME_PATH_PATTERN = `^/(${routing.locales.join("|")})/?$`;

/**
 * Script inline exécuté avant le premier paint (même mécanisme que le script
 * anti-flash du thème). Amélioration progressive : l'overlay est masqué par
 * défaut en CSS ; ce script ne le fait apparaître ("play") que sur l'accueil,
 * en première visite, sans mouvement réduit — donc jamais sans JavaScript.
 *
 * Garde-fous, parce qu'un overlay affiché dont le code ne vient jamais
 * bloquerait toute la page :
 * 1. le code de l'intro n'a pas pris la main (data-intro-ready) après
 *    READY_TIMEOUT_MS → la page est rendue ("done") ;
 * 2. l'intro a démarré mais ne s'est pas terminée RUN_TIMEOUT_MS plus tard →
 *    la page est rendue ;
 * 3. avant que le code ne prenne la main, un clic sur l'overlay ou Échap
 *    rend la page immédiatement.
 * "mh:intro-done" est émis dans ces cas aussi (dégradé du titre, Hero.tsx).
 */
export const introSkipScript = `(function(){try{
  var d=document.documentElement,A=${JSON.stringify(INTRO_ATTRIBUTE)},R=${JSON.stringify(INTRO_READY_ATTRIBUTE)};
  var played=false;
  try{played=sessionStorage.getItem(${JSON.stringify(INTRO_SESSION_KEY)})==="1";}catch(e){}
  var reduced=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if(played||reduced){d.setAttribute(A,"skip");return;}
  if(!new RegExp(${JSON.stringify(HOME_PATH_PATTERN)}).test(location.pathname))return;
  d.setAttribute(A,"play");
  function release(){
    if(d.getAttribute(A)!=="play")return;
    d.setAttribute(A,"done");
    try{window.dispatchEvent(new Event("mh:intro-done"));}catch(e){}
  }
  setTimeout(function(){if(!d.hasAttribute(R))release();},${READY_TIMEOUT_MS});
  new MutationObserver(function(m,o){
    if(d.hasAttribute(R)){o.disconnect();setTimeout(release,${RUN_TIMEOUT_MS});}
  }).observe(d,{attributes:true,attributeFilter:[R]});
  document.addEventListener("click",function(e){
    var t=e.target;
    if(!d.hasAttribute(R)&&t&&t.closest&&t.closest(".mh-intro-overlay"))release();
  },true);
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&!d.hasAttribute(R))release();
  });
}catch(e){}})();`;
