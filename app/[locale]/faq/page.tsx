import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FaqList } from "@/components/sections/faq/FaqList";
import { localizedMetadata } from "@/lib/site";
import { launchOption, megahanaHosting } from "@/lib/services-offers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq.meta" });
  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/faq"),
  };
}

/**
 * FAQ — page dédiée, sortie de /services (devenue trop longue). Contenu
 * identique (catalogues i18n "Faq") ; en-tête et questions affichés
 * directement au chargement, sans apparition au scroll.
 */
export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Faq");
  const rawItems = t.raw("items") as { question: string; answer: string }[];
  // Items à valeurs interpolées (source unique : lib/services-offers.ts) :
  // - 3 ("Le nom de domaine et l'hébergement sont-ils inclus ?") : durée
  //   d'hébergement incluse et abonnement indicatif (hébergement Megahana) ;
  // - 4 ("La mise en ligne est-elle incluse ?") : prix de l'option.
  // Les autres items sont utilisés tels quels.
  const interpolated: Record<number, () => string> = {
    3: () =>
      t("items.3.answer", {
        months: megahanaHosting.includedMonths,
        price: megahanaHosting.monthlyPrice,
      }),
    4: () => t("items.4.answer", { amount: launchOption.price }),
  };
  const items = rawItems.map((item, i) =>
    interpolated[i] ? { question: item.question, answer: interpolated[i]() } : item,
  );

  return (
    <div className="pt-20">
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <SectionHeader
          as="h1"
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("description")}
        />
        <FaqList items={items} />
      </section>
    </div>
  );
}
