import { Smartphone, Gauge, Search, FileCode2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ITEMS = [
  { id: "responsive", Icon: Smartphone },
  { id: "performance", Icon: Gauge },
  { id: "seo", Icon: Search },
  { id: "sources", Icon: FileCode2 },
] as const;

export function QualitySection() {
  const t = useTranslations("Services.quality");

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-10">
        {ITEMS.map(({ id, Icon }, i) => (
          <AnimateIn key={id} delay={i * 0.1}>
            <div className="card-border rounded-2xl p-px h-full">
              <div className="bg-surface rounded-2xl h-full p-6 flex flex-col">
                <Icon className="w-6 h-6 text-gold" />
                <h3 className="mt-4 text-base font-semibold text-text-primary">
                  {t(`items.${id}.title`)}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {t(`items.${id}.description`)}
                </p>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>

      <AnimateIn>
        <p className="mt-10 text-center text-sm text-text-muted">{t("techNote")}</p>
      </AnimateIn>

      <AnimateIn>
        <div className="card-border rounded-2xl p-px mt-6 max-w-2xl mx-auto">
          <div className="bg-surface rounded-2xl p-6 text-center">
            <h3 className="text-base font-semibold text-text-primary">{t("extrasTitle")}</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {t("extrasDescription")}
            </p>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
