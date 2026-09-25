import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { upworkOffer } from "@/lib/upwork";

export function UpworkAlternative() {
  const t = useTranslations("Services.upwork");
  const tc = useTranslations("Common");

  return (
    <section className="pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AnimateIn>
        <div className="card-border rounded-2xl p-px max-w-4xl mx-auto">
          <div className="bg-surface rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">{t("title")}</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{t("description")}</p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              {upworkOffer.packages.map((pkg) => {
                const linkText = t("link", { tier: pkg.name });
                return (
                  <a
                    key={pkg.name}
                    href={pkg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${linkText} ${tc("newTab")}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary hover:border-primary/50 border border-border-light transition-colors"
                  >
                    {linkText}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
