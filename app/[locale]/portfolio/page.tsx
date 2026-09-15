import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { ProjectCaseStudy } from "@/components/sections/portfolio/ProjectCaseStudy";
import { PortfolioTeaser } from "@/components/sections/portfolio/PortfolioTeaser";
import { ShowcaseGrid } from "@/components/sections/portfolio/ShowcaseGrid";
import { projects } from "@/lib/data";
import { localizedMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Portfolio.meta" });
  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/portfolio"),
  };
}

function PortfolioContent() {
  const t = useTranslations("Portfolio");
  const caseStudyProject = projects.find((p) => p.caseStudy) ?? projects[0];
  const showcaseProjects = projects.filter((p) => !p.caseStudy);
  const sectorCount = new Set(
    showcaseProjects.map((p) => p.sector).filter((s): s is NonNullable<typeof s> => s !== null),
  ).size;

  return (
    <div className="pt-20">
      {/* ── Premier écran : titre + teaser seulement (demande Ahmed 14/09 soir) ──
          Rien d'autre ne doit "dépasser" au chargement — l'Étude de cas et la
          grille Sites vitrines ne s'atteignent qu'en scrollant, la flèche des
          cartes du teaser sert d'invite (petite animation de rebond). */}
      <section className="min-h-[calc(100svh-5rem)] flex flex-col items-center justify-center gap-10 sm:gap-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center py-8">
        <AnimateIn>
          <SectionHeader
            as="h1"
            eyebrow={t("header.eyebrow")}
            title={t("header.titleLead")}
            titleHighlight={t("header.titleHighlight")}
            description={t("header.description")}
          />
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <PortfolioTeaser showcaseCount={showcaseProjects.length} sectorCount={sectorCount} />
        </AnimateIn>
      </section>

      {/* ── Étude de cas ── */}
      {/* Correction V1 9.3.D : MegaReco (seule vraie référence client) était
          noyée tout en bas de la page, après démos et projets en préparation.
          Remontée juste après le header pour qu'un prospect distingue tout de
          suite une expérience réelle des démos — voir aussi le badge "Client
          project"/"Projet client" ajouté dans Portfolio.caseStudy.badges. */}
      <section
        id="case-study"
        tabIndex={-1}
        aria-labelledby="case-study-heading"
        className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 md:scroll-mt-24"
      >
        <AnimateIn>
          <h2
            id="case-study-heading"
            className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-6"
          >
            {t("caseStudyHeading")}
          </h2>
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <ProjectCaseStudy project={caseStudyProject} />
        </AnimateIn>
      </section>

      {/* ── Sites vitrines ── */}
      <section
        id="showcase"
        tabIndex={-1}
        aria-labelledby="showcase-heading"
        className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 md:scroll-mt-24"
      >
        <AnimateIn>
          <h2
            id="showcase-heading"
            className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-6"
          >
            {t("showcaseHeading")}
          </h2>
        </AnimateIn>
        <ShowcaseGrid projects={showcaseProjects} />
      </section>

      {/* Correction portfolio 09/2026 : la section "Projets en préparation"
          (MegaBuild / MegaCoach) a été retirée — elle n'apportait rien à un
          visiteur qui cherche à commander ou contacter, et allongeait la page
          sans raison pour cette étape (V1). Le placeholder "Prochain projet"
          dans la grille "Sites vitrines" ci-dessus, plus discret, est
          conservé pour l'instant — à revoir si besoin. */}

      <CtaBanner />
    </div>
  );
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortfolioContent />;
}
