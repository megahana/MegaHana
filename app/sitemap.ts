import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";

// Pages publiques (sans préfixe de langue). Chaque page est déclinée FR + EN.
const paths = [
  "",
  "/services",
  "/portfolio",
  "/about",
  "/contact",
  "/faq",
  "/legal",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const home = ""; // l'accueil correspond à /{locale}

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path === home ? "" : path}`,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${path === home ? "" : path}`]),
        ),
      },
    })),
  );
}
