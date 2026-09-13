import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Les deux langues sont toujours préfixées : /fr/... et /en/...
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
