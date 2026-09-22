"use client";

import { Check, Globe, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { launchOption } from "@/lib/services-offers";

const ITEM_KEYS = ["domain", "hosting", "deployment", "checks", "access"] as const;

interface LaunchOptionProps {
  enabled: boolean;
  onToggle: () => void;
}

export function LaunchOption({ enabled, onToggle }: LaunchOptionProps) {
  const t = useTranslations("Services.launch");

  return (
    <section
      id="launch-option"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <AnimateIn>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("description")}
        />
      </AnimateIn>

      <AnimateIn>
        <label className="launch-toggle card-border rounded-2xl p-px mt-10 max-w-4xl mx-auto block cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            aria-label={t("titleHighlight")}
            className="sr-only"
          />
          <div className="relative bg-surface rounded-2xl p-6 sm:p-8 grid gap-8 md:grid-cols-2">
            <CheckCircle2
              aria-hidden="true"
              className={cn(
                "absolute top-4 right-4 w-6 h-6",
                enabled ? "text-accent-accessible" : "text-text-muted",
              )}
            />
            <div className="flex flex-col">
              <Globe className="w-8 h-8 text-gold" />
              <p className="mt-4 text-sm font-medium text-text-muted">{t("priceLabel")}</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold gradient-text">{launchOption.price}</span>
                <span className="text-sm text-text-muted">€</span>
              </div>
              <p className="mt-2 text-xs text-text-muted">{t("priceNote")}</p>
            </div>

            <div className="flex flex-col">
              <ul className="space-y-2.5">
                {ITEM_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>{t(`items.${key}`)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-text-muted leading-relaxed italic">
                {t("exclusion")}
              </p>

              <div className="mt-6 space-y-3 text-xs text-text-muted leading-relaxed">
                <p>{t("ownership")}</p>
                <p>{t("externalFees")}</p>
                <p>{t("separation")}</p>
              </div>
            </div>
          </div>
        </label>
      </AnimateIn>
    </section>
  );
}
