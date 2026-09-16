import { MessageSquare, FileText, Paintbrush, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

const STEPS = [
  { id: "project", Icon: MessageSquare },
  { id: "quote", Icon: FileText },
  { id: "creation", Icon: Paintbrush },
  { id: "delivery", Icon: PackageCheck },
] as const;

export function ProjectProcess() {
  const t = useTranslations("Services.process");

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
        {STEPS.map(({ id, Icon }, i) => (
          <AnimateIn key={id} delay={i * 0.1}>
            <div className="card-border rounded-2xl p-px h-full">
              <div className="bg-surface rounded-2xl h-full p-6 flex flex-col">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-gold" />
                  <span className="text-xs font-semibold text-text-muted">{i + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-text-primary">
                  {t(`steps.${id}.title`)}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {t(`steps.${id}.description`)}
                </p>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>

      <AnimateIn>
        <p className="mt-10 text-center text-sm text-text-muted">{t("payment")}</p>
      </AnimateIn>
    </section>
  );
}
