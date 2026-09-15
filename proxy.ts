// Import next-intl/middleware inchangé malgré le renommage de fichier
// middleware.ts -> proxy.ts (Next.js 16) : confirmé sur la doc next-intl,
// seul le nom du fichier/de la convention change, pas ce module.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Applique le proxy à toutes les routes sauf API, fichiers Next internes,
  // et les fichiers statiques racine (sitemap, robots, icônes, images, og…).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
