"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/**
 * Apparition du texte du hero : 100 % CSS (.mh-hero-item, app/globals.css),
 * texte visible par défaut dans le HTML — jamais caché en attendant React.
 * La révélation courte ne joue qu'au rechargement avec intro déjà vue
 * (html[data-intro="skip"], posé avant le premier paint) et au retour par
 * navigation interne (.mh-hero--reveal ci-dessous).
 */
const itemDelay = (ms: number) => ({ "--mh-hero-delay": `${ms}ms` }) as CSSProperties;

// Vrai après la première hydratation du hero dans cet onglet : un montage
// ultérieur (retour à l'accueil par navigation interne, sans rechargement)
// est un rendu 100 % client — le HTML serveur et l'anti-flash n'y
// interviennent pas — et reçoit alors la classe de révélation dès son premier
// rendu. À l'hydratation, la valeur est false comme au rendu serveur : pas de
// mismatch.
let heroHydratedOnce = false;

export function Hero() {
  const t = useTranslations("Home.hero");
  const perks = t.raw("perks") as string[];
  const [revealOnMount] = useState(() => heroHydratedOnce);
  useEffect(() => {
    heroHydratedOnce = true;
  }, []);

  // Ne joue le dégradé animé du H1 qu'une fois l'Intro RÉELLEMENT terminée
  // (événement "mh:intro-done" émis par Intro.tsx à ses 3 sorties : fin
  // naturelle, skip, ou jamais jouée — session déjà vue / reduced-motion).
  // Jamais un délai fixe deviné : l'Intro peut être sautée à tout moment ou
  // ne jamais s'afficher, et un délai basé sur sa durée jouerait l'effet
  // derrière l'overlay ou trop tôt/tard par rapport à sa vraie fin.
  //
  // Écouteur posé en useLayoutEffect, pas en useEffect : sur les sorties
  // "session déjà jouée" et "reduced-motion", Intro émet l'événement dans un
  // setTimeout(0) programmé depuis son propre useLayoutEffect. Après
  // l'hydratation, React 19 peut exécuter les effets passifs (useEffect)
  // APRÈS ce setTimeout(0) — mesuré sur build de prod : événement à ~266ms,
  // écouteur posé à ~267ms, dégradé jamais déclenché. Un useLayoutEffect
  // s'exécute dans la même phase de commit synchrone que celui d'Intro, donc
  // forcément avant que le moindre setTimeout(0) ne puisse partir.
  const [heroReady, setHeroReady] = useState(false);
  useLayoutEffect(() => {
    function onIntroDone() {
      setHeroReady(true);
    }
    window.addEventListener("mh:intro-done", onIntroDone);
    return () => window.removeEventListener("mh:intro-done", onIntroDone);
  }, []);

  return (
    <section
      className={cn(
        "relative min-h-0 lg:min-h-screen flex items-center pt-28 pb-12 sm:pt-24 lg:py-0 overflow-hidden",
        revealOnMount && "mh-hero--reveal",
      )}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="mh-hero-item mb-4 sm:mb-6" style={itemDelay(0)}>
            <Badge variant="primary">{t("badge")}</Badge>
          </div>

          {/* Headline */}
          <h1
            style={itemDelay(100)}
            className="mh-hero-item text-[1.9rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.12] sm:leading-[1.1] tracking-tight"
          >
            {t("titleLead")}{" "}
            <span
              className={cn("gradient-text", "hero-gradient", heroReady && "hero-gradient--play")}
            >
              {t("titleHighlight")}
            </span>
          </h1>

          {/* Subheadline */}
          <p
            style={itemDelay(200)}
            className="mh-hero-item mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            {t("subheadline")}
          </p>

          {/* Perks */}
          <div
            style={itemDelay(300)}
            className="mh-hero-item flex flex-wrap justify-center gap-4 mt-8"
          >
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                {perk}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            style={itemDelay(400)}
            className="mh-hero-item flex flex-col sm:flex-row gap-3 justify-center mt-10"
          >
            <Button href="/services" size="lg">
              {t("ctaPrimary")}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button href="/portfolio" size="lg" variant="secondary">
              {t("ctaSecondary")}
            </Button>
          </div>
        </div>
      </div>

      {/* Repère de scroll — desktop uniquement (cf. media query dans
          globals.css), lien réel vers #galerie (id posé sur Galerie.tsx). */}
      <a href="#galerie" className="hero-scroll-cue">
        <span>{t("scrollCue")}</span>
        {/* Icône vectorielle et non le caractère « ↓ » : Fraunces (sous-ensemble latin)
            n'a pas ce glyphe, le navigateur le dessinait dans une police système
            (Times New Roman sous Windows). */}
        <ArrowDown className="hero-scroll-cue-arrow" aria-hidden="true" strokeWidth={1.75} />
      </a>
    </section>
  );
}
