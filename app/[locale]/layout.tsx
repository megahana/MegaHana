import type { Metadata } from "next";
import { Fraunces, Inter, Inter_Tight } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-label",
  display: "swap",
});

// Anti-flash : applique le thème (défaut light) avant le premier paint.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark'){d.classList.add('dark')}else{d.classList.remove('dark')}}catch(e){}})();`;
import { SITE_URL, LINKEDIN_STUDIO_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBanner } from "@/components/layout/MobileCtaBanner";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Megahana · Création de sites vitrines",
    template: "%s | Megahana",
  },
  authors: [{ name: "Megahana" }],
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // JSON-LD Organization (données structurées, identiques sur tout le site).
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Megahana",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/opengraph-image.png`,
    description:
      "Création de sites vitrines modernes, rapides et responsive pour les indépendants et les petites entreprises.",
    sameAs: [LINKEDIN_STUDIO_URL],
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${interTight.variable} scroll-smooth`}
    >
      <body className="bg-background text-text-primary antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <MobileCtaBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
