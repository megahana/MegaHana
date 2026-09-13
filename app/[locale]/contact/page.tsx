import type { Metadata } from "next";
import { Linkedin, ExternalLink } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { localizedMetadata, LINKEDIN_STUDIO_URL } from "@/lib/site";
import { UPWORK_PRODUCT_URL } from "@/lib/upwork";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact.meta" });
  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/contact"),
  };
}

function ContactContent() {
  const t = useTranslations("Contact");
  const tc = useTranslations("Common");

  return (
    <div className="pt-20">
      <section className="pt-8 pb-10 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <AnimateIn>
          <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-4">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight mb-4">
            {t("titleLead")}{" "}
            <span className="gradient-text">{t("titleHighlight")}</span>
          </h1>
          <p className="text-text-secondary leading-relaxed mb-8">{t("description")}</p>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <a
            href={UPWORK_PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("upworkCta")} ${tc("newTab")}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-accent-contrast px-8 py-4 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
          >
            {t("upworkCta")}
            <ExternalLink className="w-4 h-4" />
          </a>
        </AnimateIn>

        {/* Contact général */}
        <AnimateIn delay={0.2}>
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-text-secondary mb-5">{t("generalLabel")}</p>
            <a
              href={LINKEDIN_STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              {t("linkedin")}
            </a>
          </div>
        </AnimateIn>
      </section>
    </div>
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}
