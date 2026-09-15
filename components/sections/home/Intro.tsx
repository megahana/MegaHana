"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/**
 * Transposition de docs/prototypes/intro-animation.html, piste D (chorégraphie
 * validée le 03/09) : ouverture glow plein sur les 5 pétales → vague
 * séquentielle glow→aplat, pétale par pétale → recul dans le header (mesure de
 * position réelle via getBoundingClientRect contre #mh-header-logo, cf.
 * Header.tsx). Même grammaire visuelle qu'à l'origine.
 *
 * Timing retravaillé pour laisser un vrai temps de lecture (~1s, logo+texte
 * bien lisibles) avant que quoi que ce soit ne bouge — contrairement à
 * l'itération précédente qui visait la vitesse pure (~1,3s total). Total visé
 * ici : ~2,35s. Voir le bloc de constantes plus bas pour le détail des
 * fenêtres.
 *
 * Le recul lui-même reste un translate()/scale() calculé une seule fois
 * (getBoundingClientRect contre le logo header, dont le layout est déjà stable
 * à ce stade — Header est monté dès le premier paint, cf. layout.tsx) : aucune
 * mesure en boucle, aucun rayon de flou animé en continu pour le glow (couche
 * radialGradient précalculée, seule l'opacité varie). Ce qui atterrit dans le
 * header à la fin du recul est visuellement déjà la couche "aplat" (glow à
 * opacité 0 depuis la fin de la vague) : pas de séparateur "pixel vs aplat" à
 * gérer ici, et le vrai logo du header (/icon.png, toujours monté en dessous,
 * jamais cette texture) n'apparaît que quand l'overlay disparaît par-dessus.
 *
 * Séquencement recul → fondu → masquage basé sur transitionend (pas des
 * délais fixes) : chaque étape écoute la fin de la transition CSS dont elle
 * dépend réellement, avec un setTimeout de secours (durée CSS + marge) au cas
 * où la transition serait annulée ou ne se déclencherait jamais (onglet
 * backgrounded, élément retiré du DOM, etc.) — cf. afterTransition().
 *
 * Le CSS (.mh-intro-*) vit dans app/globals.css, pas dans un <style jsx>
 * local : un bloc styled-jsx s'injecte après l'hydratation, ce qui provoquait
 * un flash non stylé (FOUC) au premier paint et brièvement après la fin de
 * l'intro (le temps que React réhydrate). Contenu identique, juste déplacé —
 * même raison que Galerie.tsx/ChalkText.tsx cette session.
 */

const SESSION_KEY = "introPlayed";
const HEADER_LOGO_ID = "mh-header-logo";

/** Coordonnées exactes des 5 pétales (clipPath ip0..ip4 + ellipses glow du prototype) — ne rien recalculer. */
const PETALS = [
  { cx: 0, cy: -52, rx: 25, ry: 50, rotate: -8, hue: "sakura" as const },
  { cx: 4, cy: -40, rx: 19, ry: 36, rotate: 65, hue: "gold" as const },
  { cx: -2, cy: -54, rx: 21, ry: 50, rotate: 155, hue: "sakura" as const },
  { cx: 3, cy: -32, rx: 15, ry: 30, rotate: 218, hue: "gold" as const },
  { cx: -3, cy: -44, rx: 18, ry: 40, rotate: 292, hue: "sakura" as const },
];

/* ── Timing (ms) ──────────────────────────────────────────────────────────
   t=0                          : mount, glow plein déjà visible, logo+texte+
                                   bouton lisibles — rien ne bouge encore.
   t=SESSION_MARK_DELAY (50)    : session marquée jouée (déféré pour survivre
                                   au double-montage StrictMode en dev — cf.
                                   commentaire plus bas, la valeur exacte
                                   importe peu tant qu'elle est > 0).
   t=+WAVE_DELAY (1000 absolu)  : la vague démarre (classe --wave). Termine à
                                   1000 + 4×70ms (décalage/pétale, CSS) +
                                   220ms (durée/pétale, CSS) = 1500ms.
   t=+MOVE_DELAY (1400 absolu)  : le recul démarre — 100ms AVANT la fin de la
                                   vague (1500ms), léger chevauchement
                                   volontaire. Durée de la transition
                                   transform (CSS, MOVE_DURATION_MS) : 650ms.
   transitionend(transform)     : ~2050ms — déclenche le fondu du fond
                                   (durée CSS FADE_DURATION_MS : 300ms).
   transitionend(background)    : ~2350ms — déclenche finish() (overlay
                                   masqué + focus rendu). Total ≈ 2,35s.
   Secours : chaque étape a aussi un setTimeout (durée CSS + ~100ms) au cas
   où transitionend ne se déclencherait jamais (cf. afterTransition()). */
const SESSION_MARK_DELAY = 50;
const WAVE_DELAY = 950;
const MOVE_DELAY = 1350;
const MOVE_DURATION_MS = 650;
const FADE_DURATION_MS = 300;

// useLayoutEffect ne fait rien côté serveur (React émet un warning dev sinon) :
// alias isomorphe standard, pour rester sur useEffect pendant le SSR.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Intro() {
  const t = useTranslations("Common");
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  useIsomorphicLayoutEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const svg = svgRef.current;
    const skipButton = skipButtonRef.current;
    if (!overlay || !logo || !svg || !skipButton) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };

    // Séquence une étape sur la fin réelle de sa transition CSS plutôt que
    // sur un délai fixe : écoute transitionend (filtré sur la bonne
    // propriété), avec un setTimeout de secours (durée CSS + marge) nettoyé
    // dès que l'événement réel arrive en premier — au cas où la transition
    // serait annulée ou ne se déclencherait jamais.
    function afterTransition(
      el: HTMLElement,
      propertyName: string,
      cssDurationMs: number,
      onDone: () => void
    ) {
      let done = false;
      function finishOnce() {
        if (done) return;
        done = true;
        el.removeEventListener("transitionend", onTransitionEnd);
        onDone();
      }
      function onTransitionEnd(e: TransitionEvent) {
        if (e.propertyName !== propertyName) return;
        finishOnce();
      }
      el.addEventListener("transitionend", onTransitionEnd);
      after(cssDurationMs + 100, finishOnce);
    }

    // Nettoyage partagé par la fin naturelle de l'intro ET par le skip :
    // masque l'overlay et rend le focus à un élément sensé (le logo header,
    // toujours monté — cf. layout.tsx). Ne touche pas au scroll : rien ne le
    // verrouille dans ce composant (overlay fixed, mais jamais de
    // `overflow:hidden` posé sur body), donc rien à libérer non plus.
    function finish() {
      overlay?.classList.add("mh-intro-overlay--hidden");
      document.getElementById(HEADER_LOGO_ID)?.closest("a")?.focus();
      // Hero.tsx écoute cet événement pour déclencher son dégradé animé
      // (une seule fois, jamais sur un délai deviné) — émis ici (fin
      // naturelle ou skip, finish() gère les deux) et aux deux autres
      // sorties de l'Intro ci-dessous (session déjà jouée, reduced-motion).
      window.dispatchEvent(new Event("mh:intro-done"));
    }

    function skip() {
      timers.forEach(clearTimeout);
      finish();
    }
    overlay.addEventListener("click", skip);
    function onSkipButtonClick(e: MouseEvent) {
      e.stopPropagation();
      skip();
    }
    skipButton.addEventListener("click", onSkipButtonClick);

    // Garde anti-double-appel : moveToHeader est déclenché par un seul
    // timer, mais reste défensif si jamais appelé deux fois (ex. futur appel
    // manuel en plus du timer).
    let moved = false;
    function moveToHeader() {
      if (moved) return;
      moved = true;

      const headerLogo = document.getElementById(HEADER_LOGO_ID);
      if (!headerLogo || !svg || !logo) {
        // Anomalie réelle (pas un DEBUG temporaire) : ce garde-fou n'est
        // jamais censé se déclencher en usage normal (Header monté dès le
        // premier paint, cf. layout.tsx) — signal à garder en prod.
        console.warn("[intro] moveToHeader: repli anticipé, élément manquant", {
          hasHeaderLogo: !!headerLogo,
          hasSvg: !!svg,
          hasLogo: !!logo,
        });
        finish();
        return;
      }
      const headerRect = headerLogo.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const scale = headerRect.height / svgRect.height;

      // Échec propre plutôt qu'un rendu cassé : layout pas encore stable,
      // header pas encore à sa taille finale, ou dimensions nulles/négatives.
      if (
        !Number.isFinite(scale) ||
        scale <= 0 ||
        scale >= 1 ||
        svgRect.width <= 0 ||
        headerRect.width <= 0
      ) {
        // Même logique que ci-dessus : anomalie réelle à tracer, pas un log
        // de développement à retirer.
        console.warn("[intro] moveToHeader: repli anticipé, mesures incohérentes", {
          scale,
          svgWidth: svgRect.width,
          svgHeight: svgRect.height,
          headerWidth: headerRect.width,
          headerHeight: headerRect.height,
        });
        finish();
        return;
      }

      const dx = headerRect.left + headerRect.width / 2 - (svgRect.left + svgRect.width / 2);
      const dy = headerRect.top + headerRect.height / 2 - (svgRect.top + svgRect.height / 2);

      // Origine de la transformation sur le centre du SVG (pas du groupe
      // logo+texte, dont le centre est décalé par le wordmark en dessous) :
      // sinon le scale s'ancre au mauvais point et le recul dérive visuellement.
      logo.style.transformOrigin = `${svgRect.left + svgRect.width / 2 - logoRect.left}px ${
        svgRect.top + svgRect.height / 2 - logoRect.top
      }px`;
      logo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      logo.classList.add("mh-intro-logo--wordmark-out");

      afterTransition(logo, "transform", MOVE_DURATION_MS, () => {
        // overlay est garanti non-null par le early-return en tête d'effet,
        // mais TS ne propage pas cette narrowing jusque dans une closure
        // aussi profondément imbriquée — re-vérifié ici pour le typer.
        if (!overlay) return;
        overlay.classList.add("mh-intro-overlay--fading");
        // Transition sur le raccourci "background", mais seule sa couleur
        // change ici : le navigateur rapporte transitionend sur la
        // sous-propriété longhand réellement animée, "background-color".
        afterTransition(overlay, "background-color", FADE_DURATION_MS, finish);
      });
    }

    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      played = false;
    }
    if (played) {
      overlay.classList.add("mh-intro-overlay--hidden");
      // Déféré d'un tick (pas dispatché synchronement ici) : cette branche
      // tourne dans le useLayoutEffect de Intro, qui s'exécute pour TOUT
      // l'arbre avant le useEffect de Hero (celui qui pose l'écouteur
      // "mh:intro-done") — un dispatch synchrone ici partirait dans le vide,
      // avant que Hero n'écoute. Vérifié en pratique : sans ce report, le
      // dégradé ne se déclenchait jamais sur une session déjà jouée.
      after(0, () => window.dispatchEvent(new Event("mh:intro-done")));
      return () => {
        timers.forEach(clearTimeout);
        overlay.removeEventListener("click", skip);
        skipButton.removeEventListener("click", onSkipButtonClick);
      };
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      overlay.classList.add("mh-intro-overlay--hidden");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* sessionStorage indisponible (navigation privée…) — tant pis, l'intro rejouera. */
      }
      // Même report qu'à la branche "played" ci-dessus, même raison.
      after(0, () => window.dispatchEvent(new Event("mh:intro-done")));
      return () => {
        timers.forEach(clearTimeout);
        overlay.removeEventListener("click", skip);
        skipButton.removeEventListener("click", onSkipButtonClick);
      };
    }

    // L'overlay est plein écran et bloque visuellement tout le reste (header
    // compris) : focus immédiat sur le skip, sinon un utilisateur clavier
    // devrait d'abord traverser tous les liens du header caché derrière avant
    // de l'atteindre. Pattern modal standard (focus sur le seul contrôle
    // actionnable pendant qu'un overlay bloque la page).
    skipButton.focus({ preventScroll: true });

    // Le marquage sessionStorage se fait DANS le premier timer (pas avant de le
    // programmer) : en dev, StrictMode invoque cet effet deux fois (mount →
    // cleanup → mount), et son cleanup annule les timers du premier passage
    // avant qu'ils ne se déclenchent — donc seul le passage qui "survit"
    // exécute réellement ce setItem. L'écrire de façon synchrone avant
    // after(WAVE_DELAY, ...) marquait la session comme jouée dès le premier
    // passage (jetable), avant même que son cleanup n'ait annulé quoi que ce
    // soit : le second passage (le vrai) se retrouvait alors avec
    // sessionStorage déjà à "1" et se masquait instantanément, sans jamais
    // jouer l'animation. La valeur de SESSION_MARK_DELAY elle-même n'a pas
    // besoin d'être grande pour que ça marche : le double-montage StrictMode
    // est synchrone, bien avant qu'aucun timer (même à 0ms) ne se déclenche.
    after(SESSION_MARK_DELAY, () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* sessionStorage indisponible — pas bloquant, juste pas de garde inter-pages. */
      }
      // Temps 1 : tient le glow plein (rien à faire, état initial = glow visible).
      // Temps 2 : vague séquentielle glow → aplat (délais gérés en CSS par pétale).
      // Temps 3 : le recul démarre avant la fin de la vague (chevauchement).
      after(WAVE_DELAY, () => {
        overlay.classList.add("mh-intro-overlay--wave");
      });
      after(MOVE_DELAY, moveToHeader);
    });

    return () => {
      timers.forEach(clearTimeout);
      overlay.removeEventListener("click", skip);
      skipButton.removeEventListener("click", onSkipButtonClick);
    };
  }, []);

  return (
    <div ref={overlayRef} className="mh-intro-overlay">
      <div ref={logoRef} className="mh-intro-logo" aria-hidden="true">
        <svg ref={svgRef} className="mh-intro-svg" width={260} height={260} viewBox="0 0 200 200">
          <defs>
            {/* Fond plein derrière le carré arrondi, même teinte : sans lui, l'interstice
                entre tuiles (9x9, carré 7.5x7.5) reste transparent → effet "carrelage". */}
            <pattern id="mh-intro-pattern-sakura" width="9" height="9" patternUnits="userSpaceOnUse">
              <rect width="9" height="9" fill="rgb(var(--sakura))" />
              <rect width="7.5" height="7.5" rx="2" fill="rgb(var(--sakura))" />
            </pattern>
            <pattern id="mh-intro-pattern-gold" width="9" height="9" patternUnits="userSpaceOnUse">
              <rect width="9" height="9" fill="rgb(var(--gold))" />
              <rect width="7.5" height="7.5" rx="2" fill="rgb(var(--gold))" />
            </pattern>
            {/* Centres quasi-blancs volontairement en dur (teintes d'accent, pas de thème). */}
            <radialGradient id="mh-intro-glow-sakura" cx="50%" cy="78%" r="85%">
              <stop offset="0%" stopColor="#fff2f4" stopOpacity={1} />
              <stop offset="55%" stopColor="#f4b8c1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="rgb(var(--sakura))" stopOpacity={0.04} />
            </radialGradient>
            <radialGradient id="mh-intro-glow-gold" cx="50%" cy="78%" r="85%">
              <stop offset="0%" stopColor="#fdf6e8" stopOpacity={1} />
              <stop offset="55%" stopColor="#e0c48f" stopOpacity={0.9} />
              <stop offset="100%" stopColor="rgb(var(--gold))" stopOpacity={0.04} />
            </radialGradient>
            {PETALS.map((p, i) => (
              <clipPath id={`mh-intro-clip-${i}`} key={`clip-${i}`}>
                <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} transform={`rotate(${p.rotate})`} />
              </clipPath>
            ))}
          </defs>
          <g transform="translate(100,106)">
            {/* Couche aplat — toujours présente, en dessous. Le rect est juste
                la source de remplissage du pattern ; chaque pétale garde sa
                forme exacte via son propre clipPath (ellipse rotate(angle)).
                Doit donc couvrir TOUTE position atteignable après rotation
                autour de l'origine — la rotation reloge le centre (cx,cy) de
                chaque pétale, pas seulement la forme sur place : rotate(155°)
                et rotate(218°) (pétales 2 et 3) déplacent leur centre en y
                positif (~+48 et ~+23). Un rect asymétrique x:[-70,70]
                y:[-140,0] (couvrant seulement y négatif) les laissait donc
                sans remplissage — glow qui s'estompe sur du vide. Rect
                recentré et agrandi (x/y:[-100,100]) pour couvrir les 5. */}
            {PETALS.map((p, i) => (
              <g key={`flat-${i}`} clipPath={`url(#mh-intro-clip-${i})`}>
                <rect x={-100} y={-100} width={200} height={200} fill={`url(#mh-intro-pattern-${p.hue})`} />
              </g>
            ))}
            {/* Couche glow — au-dessus, s'estompe pétale par pétale. Ellipse remplie
                directement (même géométrie que les clipPath), pas de rect+clip séparé :
                le fill et la forme partagent le même transform, donc le même repère. */}
            {PETALS.map((p, i) => (
              <ellipse
                key={`glow-${i}`}
                className="mh-intro-petal-glow"
                data-i={i}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                transform={`rotate(${p.rotate})`}
                fill={`url(#mh-intro-glow-${p.hue})`}
              />
            ))}
            <g fill="none" stroke="rgb(var(--bg))" strokeWidth={3}>
              {PETALS.map((p, i) => (
                <ellipse key={`sep-${i}`} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} transform={`rotate(${p.rotate})`} />
              ))}
            </g>
            <circle cx={5} cy={1} r={14} fill="rgb(var(--bg))" />
          </g>
        </svg>
        <span className="mh-intro-wordmark">megahana</span>
      </div>

      <button ref={skipButtonRef} type="button" className="mh-intro-skip">
        {t("skipIntro")}
      </button>
    </div>
  );
}
