import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Configurator } from "@/components/sections/services/Configurator";
import { ProjectProcess } from "@/components/sections/services/ProjectProcess";
import { QualitySection } from "@/components/sections/services/QualitySection";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { localizedMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Services.meta" });
  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/services"),
  };
}

function ServicesContent() {
  const t = useTranslations("Services");
  const tc = useTranslations("Common");

  return (
    <div className="pt-20">
      {/* ── 1/2. Hero + présentation courte ── */}
      {/* Retour Ahmed (25/09 puis 26/09, plus strict) : "LES FORMULES" ne
          doit plus du tout apparaître dans le premier écran sans scroll, à
          aucune résolution desktop courante — un simple padding réduit
          (tenté au 25/09) restait dépendant de la résolution. Repris ici la
          même technique déjà en prod sur /portfolio (app/[locale]/portfolio/
          page.tsx, section "premier écran" du 14/09) : min-height =
          viewport - hauteur réelle du header fixe (5rem = h-20/pt-20),
          contenu centré verticalement via flex. Home (Hero.tsx) utilise une
          variante plus simple (min-h-screen brut, sans soustraction du
          header) mais Home n'a pas de wrapper pt-20 comme /services et
          /portfolio — la version /portfolio est la bonne référence ici,
          structurellement identique à cette page. Pas de garde par
          breakpoint (contrairement à Hero.tsx qui limite min-h-screen à
          lg:) : /portfolio applique déjà ce calc sans condition sur mobile
          et rend correctement (vérifié) — même choix reconduit ici. */}
      <section className="min-h-[calc(100svh-5rem)] flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center py-8">
        <AnimateIn>
          <SectionHeader
            as="h1"
            eyebrow={t("hero.eyebrow")}
            title={t("hero.titleLead")}
            titleHighlight={t("hero.titleHighlight")}
            description={t("hero.description")}
          />
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <p className="max-w-2xl mx-auto text-text-secondary leading-relaxed">{t("intro")}</p>
        </AnimateIn>
      </section>

      {/* ── 3/4. Configurateur : formules, option mise en ligne, panneau
          "Votre sélection" (bascule direct/Upwork incluse — l'ancien bloc
          "Vous préférez passer par Upwork ?" est retiré, redondant) ── */}
      <Configurator />

      {/* ── 5. Déroulement du projet (canal direct) ── */}
      <ProjectProcess />

      {/* ── 6. Qualité et livraison ── */}
      <QualitySection />

      {/* FAQ : page dédiée /faq (app/[locale]/faq/page.tsx). */}

      {/* ── 7. CTA final ── */}
      {/* "View services" n'a pas de sens sur la page Services elle-même — on
          renvoie vers le formulaire de contact (id="discuss", déjà en place
          sur /contact) avec un libellé qui correspond au tunnel devis-first. */}
      <CtaBanner href="/contact#discuss" buttonLabel={tc("discussProject")} />
    </div>
  );
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicesContent />;
}
