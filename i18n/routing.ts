import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Les deux langues sont toujours préfixées : /fr/... et /en/...
  localePrefix: "always",
  // Pas d'en-tête HTTP Link hreflang automatique : il annonçait x-default
  // vers "/" (accueil) et "/services", "/portfolio"… (autres pages), des URL
  // qui redirigent (307 / 308) alors que hreflang doit viser des pages en
  // 200 — et contredisait le HTML (x-default → /fr…). Source unique :
  // localizedMetadata (lib/site.ts) dans le <head>, et app/sitemap.ts.
  alternateLinks: false,
  // SEC-004 : cookie NEXT_LOCALE en Secure (site servi uniquement en HTTPS,
  // HSTS). next-intl reprend ces attributs aux deux endroits où il l'écrit :
  // middleware (syncCookie) et navigateur au changement de langue
  // (syncLocaleCookie). Valeurs par défaut conservées (name, sameSite: lax).
  localeCookie: { secure: true },
});

export type Locale = (typeof routing.locales)[number];
