import type { Metadata } from "next";
import { connection } from "next/server";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { isHeroAutumn } from "@/lib/season";
import { localizedMetadata } from "@/lib/site";
import { Intro } from "@/components/sections/home/Intro";
import { Hero } from "@/components/sections/home/Hero";
import { Galerie } from "@/components/sections/home/Galerie";
import { ServicesPreview } from "@/components/sections/home/ServicesPreview";
import { HowItWorks } from "@/components/sections/home/HowItWorks";
import { CtaBanner } from "@/components/sections/home/CtaBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.meta" });
  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, ""),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Rendu à chaque requête, explicitement : la saison du hero dépend de la
  // date du jour. Déjà le cas via cookies() dans le layout (thème) ; ceci
  // évite qu'une future page statique fige la saison au dernier build.
  await connection();
  const autumn = isHeroAutumn();

  return (
    <>
      <Intro />
      <Hero autumn={autumn} />
      <Galerie />
      <ServicesPreview />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
