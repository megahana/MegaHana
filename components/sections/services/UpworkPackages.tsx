import { Check, ExternalLink, Globe, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { upworkOffer } from "@/lib/upwork";

export function UpworkPackages() {
  const t = useTranslations("Services.packages");
  const tc = useTranslations("Common");

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

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {upworkOffer.packages.map((pkg, i) => {
          const id = pkg.name.toLowerCase();
          const features = t.raw(`items.${id}.features`) as string[];
          return (
            <AnimateIn key={pkg.name} delay={i * 0.08}>
              <div
                className={`card-border rounded-2xl p-px h-full ${
                  pkg.highlight ? "ring-1 ring-primary/30" : ""
                }`}
              >
                <div className="bg-surface rounded-2xl p-5 sm:p-6 h-full flex flex-col relative overflow-hidden">
                  {pkg.highlight && (
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  )}

                  <div className="relative flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold text-text-primary">{pkg.name}</h3>
                      {pkg.bilingual && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5">
                          <Globe className="w-3 h-3" />
                          {t("bilingualBadge")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-4">{pkg.label}</p>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-3xl font-bold gradient-text">{pkg.price}</span>
                      <span className="text-text-muted text-sm ml-1.5">{pkg.currency}</span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 mb-5 text-xs text-text-secondary">
                      <span className="bg-surface-2 border border-border rounded-full px-2.5 py-1">
                        {t(`items.${id}.pages`)}
                      </span>
                      <span className="bg-surface-2 border border-border rounded-full px-2.5 py-1">
                        {t("deliveryDays", { count: pkg.delivery })}
                      </span>
                      <span className="bg-surface-2 border border-border rounded-full px-2.5 py-1">
                        {t("revisions", { count: pkg.revisions })}
                      </span>
                      <span className="bg-surface-2 border border-border rounded-full px-2.5 py-1">
                        {t(`items.${id}.language`)}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-text-secondary"
                        >
                          <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Upwork — par carte */}
                    <a
                      href={pkg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t("orderCta")} ${tc("newTab")}`}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent-accessible text-accent-contrast px-4 py-3 text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
                    >
                      {t("orderCta")}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      {/* Notice + devise */}
      <AnimateIn delay={0.2} className="mt-8 max-w-3xl mx-auto space-y-3">
        <div className="flex items-start gap-2.5 text-sm text-text-secondary bg-surface-2 border border-border rounded-xl p-4">
          <Info className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
          <span>{t("notice")}</span>
        </div>
        <p className="text-xs text-text-muted text-center">{t("currencyNote")}</p>
      </AnimateIn>
    </section>
  );
}
