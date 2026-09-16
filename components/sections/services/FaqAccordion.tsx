import { getTranslations } from "next-intl/server";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FaqAccordionList } from "@/components/sections/services/FaqAccordionList";
import { launchOption } from "@/lib/services-offers";

/**
 * Server Component : ne fait que récupérer les traductions (getTranslations,
 * côté serveur) et rendre l'en-tête + la liste. L'état accordéon et le toggle
 * vivent dans FaqAccordionList.tsx (client) — cf. audit "use client" de cette
 * session : SectionHeader + le texte statique n'ont aucune raison d'expédier
 * du JS au client.
 */
export async function FaqAccordion() {
  const t = await getTranslations("Services.faq");
  const rawItems = t.raw("items") as { question: string; answer: string }[];
  // Item d'index 4 ("La mise en ligne est-elle incluse ?") contient un prix à
  // interpoler (lib/services-offers.ts, source unique du prix de base de
  // l'option mise en ligne). Les autres items sont utilisés tels quels : on
  // garde le contrat "items = tableau" inchangé pour ne pas toucher
  // FaqAccordionList.tsx (composant client déjà en place).
  const faqItems = rawItems.map((item, i) =>
    i === 4
      ? { question: item.question, answer: t("items.4.answer", { amount: launchOption.price }) }
      : item,
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <AnimateIn>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("description")}
        />
      </AnimateIn>

      <FaqAccordionList items={faqItems} />
    </section>
  );
}
