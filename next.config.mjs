import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Anciennes URLs non préfixées → version française (308 permanent).
  // Exécuté avant le middleware next-intl, donc toujours vers /fr (pas de boucle).
  async redirects() {
    return [
      { source: "/services", destination: "/fr/services", permanent: true },
      { source: "/portfolio", destination: "/fr/portfolio", permanent: true },
      { source: "/about", destination: "/fr/about", permanent: true },
      { source: "/contact", destination: "/fr/contact", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.megareco.com",
      },
      {
        protocol: "https",
        hostname: "mega-taste.vercel.app",
      },
    ],
    // Next 16 restreint qualities par défaut à [75] — le repo utilise
    // explicitement 90/95/100 (ProjectGallery.tsx, ProjectCaseStudy.tsx),
    // qui seraient sinon arrondis à 75 (perte de qualité silencieuse).
    qualities: [75, 90, 95, 100],
  },
};

export default withNextIntl(nextConfig);
