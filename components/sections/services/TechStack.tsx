import { Code2, Palette, Smartphone, ImageIcon, Search, FileCode2, Check, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { techCommonIcons, techPackageOrder, upworkOffer } from "@/lib/upwork";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Palette,
  Smartphone,
  ImageIcon,
  Search,
  FileCode2,
};

export function TechStack() {
  const t = useTranslations("Services.tech");
  const tp = useTranslations("Services.packages");
  const common = t.raw("common") as { name: string; description: string }[];
  const compareFeatures = t.raw("compare.features") as string[];
  const addons = t.raw("addons.items") as string[];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AnimateIn>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("subtitle")}
        />
      </AnimateIn>

      {/* Base technique (client-friendly) */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {common.map((tech, i) => {
          const Icon = iconMap[techCommonIcons[i]];
          return (
            <AnimateIn key={tech.name} delay={i * 0.06}>
              <div className="card-border rounded-2xl p-px h-full">
                <div className="bg-surface rounded-2xl p-5 h-full flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
                    {Icon && <Icon className="w-4 h-4 text-primary-light" />}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{tech.name}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{tech.description}</p>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      {/* Comparatif des formules (fidèle à Upwork) */}
      <AnimateIn delay={0.1}>
        <p className="mt-12 mb-4 text-xs font-semibold tracking-widest uppercase text-text-muted">
          {t("compare.heading")}
        </p>
      </AnimateIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {techPackageOrder.map((pkg, i) => {
          const id = pkg.name.toLowerCase();
          const upw = upworkOffer.packages.find((p) => p.name === pkg.name)!;
          const specs = [
            { label: t("compare.delivery"), value: tp("deliveryDays", { count: upw.delivery }) },
            { label: t("compare.revisions"), value: tp("revisions", { count: upw.revisions }) },
            { label: t("compare.pages"), value: tp(`items.${id}.pages`) },
          ];
          return (
            <AnimateIn key={pkg.name} delay={i * 0.08}>
              <div className="card-border rounded-2xl p-px h-full">
                <div className="bg-surface rounded-2xl p-5 h-full flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-text-primary">{pkg.name}</h3>

                  <div className="flex flex-col gap-2 pb-3 border-b border-border">
                    {specs.map((s) => (
                      <div key={s.label} className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">{s.label}</span>
                        <span className="font-semibold text-text-primary">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <ul className="flex flex-col gap-1.5 flex-1">
                    {compareFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                        <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      {/* Options supplémentaires (add-ons Upwork) */}
      <AnimateIn delay={0.2} className="mt-10 max-w-2xl mx-auto">
        <div className="card-border rounded-2xl p-px">
          <div className="bg-surface rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-3">
              {t("addons.heading")}
            </p>
            <ul className="flex flex-col gap-2">
              {addons.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Plus className="w-3.5 h-3.5 text-primary-light shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AnimateIn>

      {/* Note frais externes */}
      <AnimateIn delay={0.25} className="mt-6 max-w-3xl mx-auto">
        <p className="text-xs text-text-muted leading-relaxed text-center">{t("note")}</p>
      </AnimateIn>
    </section>
  );
}
