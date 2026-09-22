import type { Metadata } from "next";
import { Linkedin, ExternalLink, Mail } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { HashFocus } from "@/components/ui/HashFocus";
import { ContactForm, type SubjectOption } from "@/components/sections/contact/ContactForm";
import { localizedMetadata, LINKEDIN_STUDIO_URL, CONTACT_FORM_EMAIL } from "@/lib/site";
import { UPWORK_PRODUCT_URL } from "@/lib/upwork";
import { directOffers, launchOption, tierIds, type TierId } from "@/lib/services-offers";

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

function ContactContent({
  initialSubjectOption,
  initialMessage,
}: {
  initialSubjectOption?: SubjectOption;
  initialMessage?: string;
}) {
  const t = useTranslations("Contact");
  const tc = useTranslations("Common");

  return (
    <div className="pt-20">
      {/* Focus clavier sur #discuss après un clic /services → /contact#discuss
          (transition client-side) — le scroll fonctionnait déjà, pas le
          focus. Voir HashFocus.tsx. Fonctionne aussi quand l'URL porte en plus
          des query params (?tier=...&launch=...) : HashFocus ne lit que le
          hash, les query params sont traités indépendamment ci-dessous. */}
      <HashFocus />

      <section className="pt-8 pb-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center">
        <AnimateIn>
          <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-4">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight mb-4">
            {t("titleLead")} <span className="gradient-text">{t("titleHighlight")}</span>
          </h1>
          <p className="text-text-secondary leading-relaxed">{t("description")}</p>
        </AnimateIn>
      </section>

      <section
        id="discuss"
        tabIndex={-1}
        className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid md:grid-cols-3 gap-8 md:gap-12 scroll-mt-20 md:scroll-mt-24"
      >
        {/* Colonne principale (~2/3) : formulaire + repli email */}
        <div className="md:col-span-2">
          <AnimateIn>
            <h2 className="text-xl font-bold text-text-primary mb-6">{t("form.heading")}</h2>
            <ContactForm
              initialSubjectOption={initialSubjectOption}
              initialMessage={initialMessage}
            />
          </AnimateIn>

          <AnimateIn delay={0.1}>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-text-secondary mb-2">{t("emailAltLabel")}</p>
              {/* Recette V1 (17/09) : py-2 agrandit la zone cliquable
                  (~20px -> ~36px), sous le seuil WCAG 2.5.8 sinon. */}
              <a
                href={`mailto:${CONTACT_FORM_EMAIL}`}
                className="inline-flex items-center gap-2 py-2 text-sm font-medium text-text-primary hover:text-primary-light transition-colors"
              >
                <Mail className="w-4 h-4" />
                {CONTACT_FORM_EMAIL}
              </a>
            </div>
          </AnimateIn>
        </div>

        {/* Colonne secondaire (~1/3) : Upwork (action secondaire) + LinkedIn */}
        <div className="md:col-span-1 space-y-8">
          <AnimateIn delay={0.15}>
            <div className="rounded-2xl border border-border bg-surface-2 p-6">
              <h2 className="font-bold text-text-primary mb-2">{t("upwork.title")}</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-5">{t("upwork.text")}</p>
              <a
                href={UPWORK_PRODUCT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("upwork.cta")} ${tc("newTab")}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/50 text-primary px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:border-primary"
              >
                {t("upwork.cta")}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </AnimateIn>

          <AnimateIn delay={0.2}>
            <div>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {t("linkedinText")}
              </p>
              <a
                href={LINKEDIN_STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                {t("linkedin")}
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>
    </div>
  );
}

function isValidTier(value: string | undefined): value is TierId {
  return !!value && (tierIds as readonly string[]).includes(value);
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tier?: string; launch?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const tier = isValidTier(sp.tier) ? sp.tier : null;
  const launchEnabled = sp.launch === "1";

  let initialSubjectOption: SubjectOption | undefined;
  let initialMessage: string | undefined;

  if (tier) {
    const [tPrefill, tPackages] = await Promise.all([
      getTranslations({ locale, namespace: "Contact.form.prefill" }),
      getTranslations({ locale, namespace: "Services.packages" }),
    ]);
    const tierName = tPackages(`${tier}.name`);
    const price = directOffers[tier].price;

    initialSubjectOption = "package";
    initialMessage = launchEnabled
      ? tPrefill("withLaunch", { tier: tierName, price, launchPrice: launchOption.price })
      : tPrefill("withoutLaunch", { tier: tierName, price });
  }

  return (
    <ContactContent initialSubjectOption={initialSubjectOption} initialMessage={initialMessage} />
  );
}
