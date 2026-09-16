import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// Root layout "passthrough" requis par Next.js.
// Il NE rend PAS <html>/<body> : c'est app/[locale]/layout.tsx qui les porte
// (root layout localisé). Ce fichier permet uniquement au not-found global
// d'avoir un layout racine, sans dupliquer la structure HTML.
//
// metadataBase est défini ICI (racine) pour que les images basées fichier
// (opengraph-image.png, icon.png) se résolvent en URL absolue plutôt que
// sur http://localhost:3000.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
