import { Check, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { directOffers, tierIds } from "@/lib/services-offers";

const FEATURE_KEYS = ["design", "content", "performance", "sources", "social"] as const;

export function PackageCards() {
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

      <div className="grid gap-6 md:grid-cols-3 mt-10">
        {tierIds.map((tier, i) => {
          const offer = directOffers[tier];
          return (
            <AnimateIn key={tier} delay={i * 0.1}>
              <div className="card-border rounded-2xl p-px h-full">
                <div className="bg-surface rounded-2xl h-full p-6 sm:p-8 flex flex-col">
                  <h3 className="text-xl font-semibold text-text-primary">{t(`${tier}.name`)}</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    {t(`${tier}.description`)}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold gradient-text">{offer.price}</span>
                    <span className="text-sm text-text-muted">€</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary">
                      {t(`${tier}.pages`)}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary">
                      {t(`${tier}.languages`)}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2.5 flex-1">
                    <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span>{t(`${tier}.responsive`)}</span>
                    </li>
                    {FEATURE_KEYS.map((key) => (
                      <li
                        key={key}
                        className="flex items-start gap-2.5 text-sm text-text-secondary"
                      >
                        <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>{t(`features.${key}`)}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-xs text-text-muted">{t("schedule")}</p>

                  <Button
                    href="/contact#discuss"
                    variant="primary"
                    className="mt-6 w-full"
                    ariaLabel={t("ctaLabel", { tier: t(`${tier}.name`) })}
                  >
                    {tc("discussProject")}
                  </Button>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      <AnimateIn>
        <div className="max-w-2xl mx-auto mt-10 space-y-2.5">
          <p className="flex items-start gap-2.5 text-sm text-text-secondary">
            <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span>{t("commonNote")}</span>
          </p>
          <p className="flex items-start gap-2.5 text-sm text-text-muted">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t("externalNote")}</span>
          </p>
        </div>
      </AnimateIn>
    </section>
  );
}
