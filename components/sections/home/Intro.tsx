"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, motionValue, type AnimationPlaybackControls } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  LOGO_CENTER,
  LOGO_ORIGIN,
  LOGO_VIEWBOX,
  PETALS,
  PETAL_FILL_CLASS,
  SEPARATOR_WIDTH,
} from "@/lib/logo-geometry";
import { INTRO_SESSION_KEY } from "@/lib/intro";
import { BLOOM_TOTAL_MS, bloomState } from "@/lib/logo-bloom";

/**
 * Intro d'accueil — chorégraphie "Éclosion contenue" (piste B, choisie le
 * 23/09 après comparaison de 4 pistes dans un labo interne, depuis retiré) :
 * chaque pétale s'ouvre depuis le point d'attache jusqu'à sa forme exacte,
 * l'un après l'autre dans le sens horaire, puis la fleur complète est tenue
 * un court instant et tout l'overlay (fond + fleur + mot « megahana »)
 * s'efface d'un bloc. Plus de recul vers le logo du header. Total ≈ 1,28s
 * depuis le montage (détail dans le bloc "Chorégraphie" plus bas).
 *
 * Logo : SVG fidèle à app/icon.png (géométrie partagée : lib/logo-geometry.ts ;
 * chorégraphie d'éclosion partagée avec le formulaire de contact : lib/logo-bloom.ts). Séparations et
 * cœur réellement transparents via un <mask> — et non plus peints en couleur
 * de fond, ce qui ne tenait que sur un fond opaque.
 *
 * Animation des pétales : un MotionValue `time` (ms) animé par framer-motion,
 * dont chaque valeur est traduite en attributs SVG `transform`/`opacity`
 * écrits directement sur les groupes de pétales (aucun re-rendu React par
 * frame). L'attribut SVG — et non le transform CSS que framer-motion pose sur
 * les éléments SVG avec transform-box: fill-box — garantit que les échelles
 * sont ancrées sur le point d'attache commun, pas au centre de chaque ellipse.
 *
 * Sortie séquencée sur transitionend (pas un délai fixe) : le fondu CSS de
 * l'overlay déclenche finish() à sa fin réelle, avec un setTimeout de secours
 * (durée CSS + marge) au cas où la transition serait annulée ou ne se
 * déclencherait jamais (onglet en arrière-plan, élément retiré…) — cf.
 * afterTransition().
 *
 * Le CSS (.mh-intro-*) vit dans app/globals.css, pas dans un <style jsx>
 * local : un bloc styled-jsx s'injecte après l'hydratation, ce qui provoquait
 * un flash non stylé (FOUC) au premier paint et brièvement après la fin de
 * l'intro (le temps que React réhydrate).
 */

const HEADER_LOGO_ID = "mh-header-logo";

/* ── Chorégraphie (ms) ─────────────────────────────────────────────────────
   t=0                         : mount — overlay plein, mot « megahana »
                                  visible, pétales refermés et invisibles.
   t=SESSION_MARK_DELAY (50)   : session marquée jouée (déféré pour survivre
                                  au double-montage StrictMode en dev — cf.
                                  commentaire plus bas), l'éclosion démarre.
   +MOTION_MS (850)            : 5 pétales × 650ms, décalés de 50ms.
   +HOLD_MS (100)              : fleur complète tenue.
   +FADE_DURATION_MS (280)     : fondu de tout l'overlay (CSS), puis
                                  finish() sur transitionend. Total ≈ 1,28s
                                  depuis le montage.
   Secours : setTimeout (durée CSS + marge) si transitionend ne vient jamais. */
const SESSION_MARK_DELAY = 50;
const MOTION_MS = BLOOM_TOTAL_MS;
const HOLD_MS = 100;
/** Dupliqué dans app/globals.css (.mh-intro-overlay--fading). */
const FADE_DURATION_MS = 280;

// useLayoutEffect ne fait rien côté serveur (React émet un warning dev sinon) :
// alias isomorphe standard, pour rester sur useEffect pendant le SSR.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Intro() {
  const t = useTranslations("Common");
  const overlayRef = useRef<HTMLDivElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  // Un groupe de remplissage et un contour découpé (dans le masque) par
  // pétale, animés ensemble : les séparations suivent leur pétale.
  const fillRefs = useRef<(SVGGElement | null)[]>([]);
  const cutRefs = useRef<(SVGGElement | null)[]>([]);

  useIsomorphicLayoutEffect(() => {
    const overlay = overlayRef.current;
    const skipButton = skipButtonRef.current;
    if (!overlay || !skipButton) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };
    let controls: AnimationPlaybackControls | null = null;

    // Séquence une étape sur la fin réelle de sa transition CSS plutôt que
    // sur un délai fixe : écoute transitionend (filtré sur la bonne
    // propriété), avec un setTimeout de secours (durée CSS + marge) nettoyé
    // dès que l'événement réel arrive en premier — au cas où la transition
    // serait annulée ou ne se déclencherait jamais.
    function afterTransition(
      el: HTMLElement,
      propertyName: string,
      cssDurationMs: number,
      onDone: () => void,
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
      controls?.stop();
      finish();
    }
    overlay.addEventListener("click", skip);
    function onSkipButtonClick(e: MouseEvent) {
      e.stopPropagation();
      skip();
    }
    skipButton.addEventListener("click", onSkipButtonClick);

    let played = false;
    try {
      played = sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
    } catch {
      played = false;
    }
    if (played) {
      overlay.classList.add("mh-intro-overlay--hidden");
      // Déféré d'un tick (pas dispatché synchronement ici) : cette branche
      // tourne dans le useLayoutEffect de Intro, qui s'exécute avant celui de
      // Hero (qui pose l'écouteur "mh:intro-done", frère suivant dans l'arbre)
      // — un dispatch synchrone ici partirait dans le vide, avant que Hero
      // n'écoute. Le setTimeout(0) part après toute la phase de layout ; Hero
      // doit donc poser son écouteur en useLayoutEffect, pas en useEffect
      // (cf. Hero.tsx : un useEffect peut s'exécuter après ce setTimeout).
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
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
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

    const time = motionValue(0);
    const unsubscribe = time.on("change", (now) => {
      PETALS.forEach((_, i) => {
        const state = bloomState(i, now);
        fillRefs.current[i]?.setAttribute("transform", state.transform);
        fillRefs.current[i]?.setAttribute("opacity", String(state.opacity));
        cutRefs.current[i]?.setAttribute("transform", state.transform);
        cutRefs.current[i]?.setAttribute("stroke-opacity", String(state.opacity));
      });
    });

    function fadeOut() {
      overlay?.classList.add("mh-intro-overlay--fading");
      if (overlay) afterTransition(overlay, "opacity", FADE_DURATION_MS, finish);
    }

    // Le marquage sessionStorage se fait DANS le premier timer (pas avant de le
    // programmer) : en dev, StrictMode invoque cet effet deux fois (mount →
    // cleanup → mount), et son cleanup annule les timers du premier passage
    // avant qu'ils ne se déclenchent — donc seul le passage qui "survit"
    // exécute réellement ce setItem. L'écrire de façon synchrone marquait la
    // session comme jouée dès le premier passage (jetable) : le second passage
    // (le vrai) se retrouvait alors avec sessionStorage déjà à "1" et se
    // masquait instantanément, sans jamais jouer l'animation.
    after(SESSION_MARK_DELAY, () => {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        /* sessionStorage indisponible — pas bloquant, juste pas de garde inter-pages. */
      }
      controls = animate(time, MOTION_MS, {
        duration: MOTION_MS / 1000,
        ease: "linear",
        onComplete: () => after(HOLD_MS, fadeOut),
      });
    });

    return () => {
      timers.forEach(clearTimeout);
      controls?.stop();
      unsubscribe();
      overlay.removeEventListener("click", skip);
      skipButton.removeEventListener("click", onSkipButtonClick);
    };
  }, []);

  // Premier rendu (serveur et client) : pétales dans leur état de départ.
  const initial = PETALS.map((_, i) => bloomState(i, 0));

  return (
    <div ref={overlayRef} className="mh-intro-overlay">
      <div className="mh-intro-logo" aria-hidden="true">
        <svg
          className="mh-intro-svg"
          width={260}
          height={260}
          viewBox={`0 0 ${LOGO_VIEWBOX} ${LOGO_VIEWBOX}`}
        >
          <defs>
            {/* Blanc = visible. Le contour de chaque pétale et le cœur sont
                découpés (noir) : séparations et centre transparents. */}
            <mask
              id="mh-intro-cut"
              maskUnits="userSpaceOnUse"
              x={-LOGO_VIEWBOX}
              y={-LOGO_VIEWBOX}
              width={LOGO_VIEWBOX * 2}
              height={LOGO_VIEWBOX * 2}
            >
              <rect
                x={-LOGO_VIEWBOX}
                y={-LOGO_VIEWBOX}
                width={LOGO_VIEWBOX * 2}
                height={LOGO_VIEWBOX * 2}
                fill="white"
              />
              {PETALS.map((p, i) => (
                <g key={i} transform={`rotate(${p.rotate})`}>
                  <g
                    ref={(el) => {
                      cutRefs.current[i] = el;
                    }}
                    transform={initial[i].transform}
                    strokeOpacity={initial[i].opacity}
                  >
                    <ellipse
                      cx={p.cx}
                      cy={p.cy}
                      rx={p.rx}
                      ry={p.ry}
                      fill="none"
                      stroke="black"
                      strokeWidth={SEPARATOR_WIDTH}
                    />
                  </g>
                </g>
              ))}
              <circle cx={LOGO_CENTER.cx} cy={LOGO_CENTER.cy} r={LOGO_CENTER.r} fill="black" />
            </mask>
          </defs>
          <g transform={`translate(${LOGO_ORIGIN.x} ${LOGO_ORIGIN.y})`}>
            <g mask="url(#mh-intro-cut)">
              {PETALS.map((p, i) => (
                <g key={i} transform={`rotate(${p.rotate})`}>
                  <g
                    ref={(el) => {
                      fillRefs.current[i] = el;
                    }}
                    transform={initial[i].transform}
                    opacity={initial[i].opacity}
                  >
                    <ellipse
                      cx={p.cx}
                      cy={p.cy}
                      rx={p.rx}
                      ry={p.ry}
                      className={PETAL_FILL_CLASS[p.hue]}
                    />
                  </g>
                </g>
              ))}
            </g>
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
