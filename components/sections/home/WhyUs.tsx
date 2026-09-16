import { UserCheck, Zap, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Ordre des icônes aligné sur Home.whyUs.items.
const itemIcons = [UserCheck, Zap, TrendingUp];

export function WhyUs() {
  const t = useTranslations("Home.whyUs");
  const items = t.raw("items") as { title: string; description: string }[];

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
        {items.map((item, i) => {
          const Icon = itemIcons[i];
          return (
            <AnimateIn key={item.title} delay={i * 0.08}>
              <div className="card-border rounded-2xl p-px h-full group">
                <div className="bg-surface rounded-2xl p-5 sm:p-6 h-full flex flex-col gap-3">
                  {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                      <Icon className="w-5 h-5 text-primary-light" />
                    </div>
                  )}
                  <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </section>
  );
}
