import { ArrowRight, Layout, Briefcase, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

export function ServicesPreview() {
  const t = useTranslations("Home.offers");

  const formules = [
    { icon: Layout, name: "Landing Page", description: t("landingDescription") },
    { icon: Briefcase, name: "Business Website", description: t("businessDescription") },
    { icon: Languages, name: "Bilingual Business Website", description: t("bilingualDescription") },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AnimateIn>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("description")}
        />
      </AnimateIn>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {formules.map((f, i) => (
          <AnimateIn key={f.name} delay={i * 0.08}>
            <div className="card-border rounded-2xl p-px h-full">
              <div className="bg-surface rounded-2xl p-5 sm:p-6 h-full flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary-light" />
                </div>
                <h3 className="font-semibold text-text-primary">{f.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>

      <AnimateIn delay={0.3} className="mt-8 text-center">
        <Button href="/services">
          {t("cta")}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </AnimateIn>
    </section>
  );
}
