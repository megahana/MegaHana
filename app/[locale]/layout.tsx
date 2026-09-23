import type { Metadata } from "next";
import { Fraunces, Inter, Inter_Tight } from "next/font/google";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
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

// Anti-flash : applique le thème avant le premier paint, à partir du cookie
// posé par ThemeToggle (source de vérité, lue aussi côté serveur ci-dessous)
// avec repli sur localStorage pour les visiteurs déjà réglés avant ce cookie.
const themeScript = `(function(){try{
  var d=document.documentElement;
  var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);
  var cookieVal=m?decodeURIComponent(m[1]):null;
  var stored=localStorage.getItem('theme');
  var theme=cookieVal||stored||'light';
  if(theme==='dark'){d.classList.add('dark')}else{d.classList.remove('dark')}
  if(!cookieVal&&stored){document.cookie='theme='+stored+'; path=/; max-age=31536000; samesite=lax';}
}catch(e){}})();`;
import { SITE_URL, LINKEDIN_STUDIO_URL } from "@/lib/site";
import { introSkipScript } from "@/lib/intro";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBanner } from "@/components/layout/MobileCtaBanner";
import { InsertedScripts } from "@/components/layout/InsertedScripts";
import { MotionConfigProvider } from "@/components/layout/MotionConfigProvider";

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

  // Correction bug 14/09 (regression post-migration Next 16 du 09/2026 :
  // ce correctif etait reste dans un stash git jamais restaure apres la
  // branche de migration, pas un probleme cause par Next 16 lui-meme) :
  // le thème (dark/light) passait uniquement par une classe "dark" ajoutée
  // côté client sur <html>. Or ce <html> est rendu par ce composant serveur,
  // et le changement de langue fait remonter tout le segment [locale] —
  // React réconcilie alors <html> avec le rendu serveur (qui ignorait le
  // thème) et efface la classe "dark" ajoutée manuellement, d'où le retour
  // au thème clair signalé par Ahmed au changement FR/EN. Fix : lire le
  // thème depuis un cookie côté serveur, pour que le <html> rendu ici
  // porte déjà la bonne classe, quelle que soit la navigation.
  const cookieStore = await cookies();
  const isDark = cookieStore.get("theme")?.value === "dark";

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
      // Next 16 ne gère plus lui-même le scroll-behavior pendant la
      // navigation SPA (avant : neutralisé temporairement pour un scroll
      // instantané, puis restauré) — cet attribut préserve ce comportement
      // pour scroll-smooth ci-dessous (défilement doux réservé aux ancres
      // in-page, pas aux changements de route).
      data-scroll-behavior="smooth"
      className={cn(
        inter.variable,
        fraunces.variable,
        interTight.variable,
        "scroll-smooth",
        isDark && "dark",
      )}
    >
      <body className="bg-background text-text-primary antialiased">
        <InsertedScripts
          themeScript={themeScript}
          introSkipScript={introSkipScript}
          jsonLd={JSON.stringify(organizationJsonLd)}
        />
        <NextIntlClientProvider>
          <MotionConfigProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <MobileCtaBanner />
          </MotionConfigProvider>
        </NextIntlClientProvider>
        {/* Vercel Web Analytics (sans cookie, statistiques agrégées). Rendu en
            production seulement : en dev, le composant charge un script de
            débogage depuis va.vercel-scripts.com, bloqué par la CSP
            (script-src 'self', next.config.mjs). En production, script et
            envois passent par /_vercel/insights (même origine). Monté une
            fois ici ; même si ce layout se remonte au changement de langue,
            inject() ne réinsère pas un script déjà présent dans <head>. */}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
