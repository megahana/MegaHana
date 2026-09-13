import { useTranslations, useLocale } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { legalVersion } from "@/lib/site-version";
import { formatDate } from "@/lib/utils";

interface LegalSection {
  heading: string;
  body: string;
}

/**
 * Gabarit commun aux pages légales (mentions légales, confidentialité, CGV).
 *
 * Tout le contenu est traduisible et vit dans les catalogues sous le `namespace`
 * fourni (ex. "Legal.notice"). Le corps de chaque section accepte des sauts de
 * ligne (`\n`) et des puces "•", rendus via `whitespace-pre-line` — même
 * convention que la FAQ.
 */
export function LegalPage({ namespace }: { namespace: string }) {
  const t = useTranslations(namespace);
  const tc = useTranslations("Common");
  const locale = useLocale();
  const sections = t.raw("sections") as LegalSection[];

  return (
    <div className="pt-20">
      <section className="pt-8 pb-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <AnimateIn>
          <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-3">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            {tc("lastUpdated", {
              date: formatDate(legalVersion.lastUpdated, locale),
            })}
          </p>
        </AnimateIn>

        <div className="mt-10 space-y-8">
          {sections.map((section, i) => (
            <AnimateIn key={section.heading} delay={i * 0.04}>
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                  {section.heading}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>
    </div>
  );
}
