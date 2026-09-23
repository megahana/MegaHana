import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /dev/ : labo interne (app/dev/, gitignoré, jamais déployé). Exclusion
      // permanente en défense en profondeur, au cas où il serait un jour
      // publié par erreur (noindex et absence du sitemap s'y ajoutent).
      disallow: ["/api/", "/dev/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
