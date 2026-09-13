import type { Metadata } from "next";
import { Check, Info } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { FaqAccordion } from "@/components/sections/services/FaqAccordion";
import { UpworkPackages } from "@/components/sections/services/UpworkPackages";
import { TechStack } from "@/components/sections/services/TechStack";
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

      {/* ── 3. Inclusions communes + frais externes non inclus ── */}
      <section className="pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimateIn>
          <div className="max-w-2xl mx-auto space-y-2.5">
            <p className="flex items-start gap-2.5 text-sm text-text-secondary">
              <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>{t("commonLine")}</span>
            </p>
            <p className="flex items-start gap-2.5 text-sm text-text-muted">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t("externalFeesLine")}</span>
            </p>
          </div>
        </AnimateIn>
      </section>

      {/* ── 4. Les trois formules Upwork ── */}
      <UpworkPackages />

      {/* ── 5. Technologies utilisées ── */}
      <TechStack />

      {/* ── 6. FAQ ── */}
      <FaqAccordion />

      {/* ── 7. CTA final ── */}
      <CtaBanner />
    </div>
  );
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicesContent />;
}
