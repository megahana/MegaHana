import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
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

  return (
    <>
      <Intro />
      <Hero />
      <Galerie />
      <ServicesPreview />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
