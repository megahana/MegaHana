import { MessageSquare, Layout, Code2, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Ordre des icônes aligné sur les étapes du catalogue (Home.howItWorks.steps).
const stepIcons = [Layout, MessageSquare, Code2, Rocket];

export function HowItWorks() {
  const t = useTranslations("Home.howItWorks");
  const steps = t.raw("steps") as { title: string; description: string }[];

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

      <div className="relative mt-10 sm:mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <AnimateIn key={step.title} delay={i * 0.15}>
                <div className="relative text-center md:text-left group">
                  {/* Number badge */}
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-card border border-primary/20 mb-4 sm:mb-6 relative">
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-accessible text-accent-contrast text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {Icon && (
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-light group-hover:text-gold transition-colors" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
