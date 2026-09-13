import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Applique le middleware à toutes les routes sauf API, fichiers Next internes,
  // et les fichiers statiques racine (sitemap, robots, icônes, images, og…).
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
