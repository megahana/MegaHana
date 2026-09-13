import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Frame } from "@/components/ui/Frame";
import { MarqueeControls } from "@/components/sections/home/MarqueeControls";
import { projects } from "@/lib/data";
import type { Project, Sector } from "@/types";

/**
 * Transposition de docs/prototypes/galerie-teaser.html (v4 — pétale-signature,
 * sans section "En détail" ni liens). Mécanique (défilement infini, pause au
 * survol par rangée, bascule grille statique en reduced-motion) inchangée —
 * le CSS correspondant (.marquee-*, .card, .label, .photo, .base-content,
 * .reveal…) vit dans app/globals.css (styled-jsx incompatible avec un Server
 * Component, cf. historique).
 *
 * v5 — "carte par projet" : chaque secteur affiche 0 (placeholder "en
 * travail"), 1 ou 2 cartes réelles selon le nombre de démos live pour ce
 * secteur (jamais de slot vide à côté d'une seule démo). Les cartes réelles
 * sont désormais de vrais liens (<a>) vers la démo Vercel, avec photo +
 * légende visibles AU REPOS (plus seulement au survol).
 *
 * Server Component : seule la pause/lecture (état + bouton) est interactive,
 * isolée dans MarqueeControls.tsx (client) qui reçoit les rangées déjà
 * rendues en children. renderCard/renderRow/sectorSlots sont des fonctions de
 * module (pas des closures de composant).
 *
 * Décor + pétale-signature + hover des cartes délégués à <Frame> (T8.1,
 * components/ui/Frame.tsx) — Galerie ne fournit que le contenu (children),
 * rendu dans .mh-frame-content.
 */

const ROW_1: Sector[] = ["restaurant", "artisans", "artistes", "startup"];
const ROW_2: Sector[] = ["architecte", "musicien", "mode", "bien-etre"];

type Translator = ReturnType<typeof useTranslations>;

// Nombre total de copies du groupe de secteurs dans .marquee-track : 1 réelle
// (copyIndex 0) + COPY_COUNT-1 dupliquées (aria-hidden). Doit rester en phase
// avec translateX(-1/COPY_COUNT * 100%) dans app/globals.css (@keyframes
// marquee-scroll) : la boucle translate toujours exactement 1 largeur de
// groupe, quel que soit COPY_COUNT — et quel que soit le nombre de cartes
// dans ce groupe (translate en %, pas en px : le passage à 1 ou 2 cartes par
// secteur ne change rien à ce calcul).
const COPY_COUNT = 4;

type Slot = { sector: Sector; project: Project | null };

// Un secteur affiche 0 (placeholder "en travail"), 1 ou 2 cartes réelles —
// jamais de second slot vide à côté d'une seule démo. MegaTaste (id
// "megataste") reste exclue ici : c'était un stand-in pour "restaurant" tant
// qu'aucune des 16 démos sectorielles n'était en ligne — elle reste un vrai
// projet du portfolio général (/portfolio, lib/data.ts), simplement plus
// affichée dans CETTE galerie maintenant que les vraies démos sectorielles
// existent.
function sectorSlots(sector: Sector): Slot[] {
  const demos = projects.filter(
    (p) => p.sector === sector && p.status === "demo-live" && p.id !== "megataste"
  );
  if (demos.length === 0) return [{ sector, project: null }];
  return demos.map((project) => ({ sector, project }));
}

function renderCard(
  slot: Slot,
  copyIndex: number,
  t: Translator,
  sectorNames: Record<string, string>,
  teasers: Record<string, string>
) {
  const { sector, project } = slot;
  const keyBase = project ? project.id : sector;
  const key = copyIndex === 0 ? keyBase : `${keyBase}-dup-${copyIndex}`;
  // Copie dupliquée (marquee) : jamais dans l'ordre de tabulation — et
  // jamais focusable du tout pour les vrais liens (cohérent avec
  // aria-hidden sur leur conteneur .marquee-dup). copyIndex 0 (l'unique
  // copie "réelle") garde le comportement natif de l'élément (<a> =
  // focusable, <div> = pas focusable).
  const tabIndexValue = copyIndex === 0 ? undefined : -1;

  if (project) {
    return (
      <a
        className="card card--real"
        key={key}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={tabIndexValue}
      >
        <Frame sector={sector}>
          <div className="photo">
            <Image
              src={project.images!.homepage!}
              alt={project.title}
              fill
              sizes="360px"
              className="object-cover"
              style={{ objectPosition: "50% 8%" }}
            />
          </div>
          <span className="real-hint">{t("real.hint")}</span>
          <div className="info-bottom">
            <p className="caption">
              <b>{project.title}</b>
              {project.descriptor ? ` · ${project.descriptor}` : ""}
            </p>
            {project.teaser ? <p className="teaser-line">{project.teaser}</p> : null}
          </div>
        </Frame>
      </a>
    );
  }

  return (
    <div className="card" key={key} tabIndex={tabIndexValue}>
      <Frame sector={sector} interactive={false}>
        <div className="base-content">
          <span className="sector">{sectorNames[sector]}</span>
          <span className="tag">{t("inProgress")}</span>
        </div>
        <div className="reveal">
          <p className="teaser-line">{teasers[sector]}</p>
          <span className="prov-tag">{t("placeholderTag")}</span>
        </div>
      </Frame>
    </div>
  );
}

function renderRow(
  sectors: Sector[],
  reverse: boolean,
  t: Translator,
  sectorNames: Record<string, string>,
  teasers: Record<string, string>
) {
  const slots = sectors.flatMap(sectorSlots);
  const dupCopies = Array.from({ length: COPY_COUNT - 1 }, (_, i) => i + 1);
  return (
    <div className="marquee-viewport">
      <div className={reverse ? "marquee-track reverse" : "marquee-track"}>
        {slots.map((slot) => renderCard(slot, 0, t, sectorNames, teasers))}
        <div className="marquee-dup" aria-hidden="true">
          {dupCopies.map((copyIndex) =>
            slots.map((slot) => renderCard(slot, copyIndex, t, sectorNames, teasers))
          )}
        </div>
      </div>
    </div>
  );
}

export function Galerie() {
  const t = useTranslations("Home.galerie");
  const sectorNames = t.raw("sectors") as Record<string, string>;
  const teasers = t.raw("teasers") as Record<string, string>;

  return (
    <section id="galerie" className="py-16 sm:py-20 lg:py-24 overflow-hidden scroll-mt-24">
      <AnimateIn>
        <div className="px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t("eyebrow")}
            title={t("titleLead")}
            titleHighlight={t("titleHighlight")}
            description={t("description")}
          />
        </div>
      </AnimateIn>

      <AnimateIn delay={0.15}>
        <MarqueeControls pauseLabel={t("pauseScroll")} resumeLabel={t("resumeScroll")}>
          {renderRow(ROW_1, false, t, sectorNames, teasers)}
          {renderRow(ROW_2, true, t, sectorNames, teasers)}
        </MarqueeControls>
      </AnimateIn>
    </section>
  );
}
