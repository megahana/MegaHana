import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { PackageCards } from "@/components/sections/services/PackageCards";
import { LaunchOption } from "@/components/sections/services/LaunchOption";
import { UpworkAlternative } from "@/components/sections/services/UpworkAlternative";
import { ProjectProcess } from "@/components/sections/services/ProjectProcess";
import { QualitySection } from "@/components/sections/services/QualitySection";
import { FaqAccordion } from "@/components/sections/services/FaqAccordion";
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
      {/* ── 1. Hero ── */}
      <section className="pt-8 pb-10 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <AnimateIn>
          <SectionHeader
            as="h1"
            eyebrow={t("hero.eyebrow")}
            title={t("hero.titleLead")}
            titleHighlight={t("hero.titleHighlight")}
            description={t("hero.description")}
          />
        </AnimateIn>
      </section>

      {/* ── 2. Présentation courte ── */}
      <section className="pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimateIn>
          <p className="max-w-2xl mx-auto text-center text-text-secondary leading-relaxed">
            {t("intro")}
          </p>
        </AnimateIn>
      </section>

      {/* ── 3. Les trois formules (EUR, canal direct) ── */}
      <PackageCards />

      {/* ── 4. Option mise en ligne ── */}
      <LaunchOption />

      {/* ── 5. Alternative Upwork (bloc compact) ── */}
      <UpworkAlternative />

      {/* ── 6. Déroulement du projet (canal direct) ── */}
      <ProjectProcess />

      {/* ── 7. Qualité et livraison ── */}
      <QualitySection />

      {/* ── 8. FAQ ── */}
      <FaqAccordion />

      {/* ── 9. CTA final ── */}
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
