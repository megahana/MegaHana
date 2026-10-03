import Link from "next/link";
import { headers } from "next/headers";
import "./globals.css";

// 404 global (hors contexte de locale) : doit être autonome car il n'existe
// pas de root layout — c'est app/[locale]/layout.tsx qui porte <html>/<body>.
export default async function NotFound() {
  // Langue de l'URL demandée (QA-002) : posée par le middleware next-intl
  // (proxy.ts) dans l'en-tête de requête X-NEXT-INTL-LOCALE, y compris pour
  // une page inexistante (/en/...). Repli sur le français. Contenu et
  // habillage inchangés (page bilingue) : seuls lang et le lien suivent.
  const locale = (await headers()).get("x-next-intl-locale") === "en" ? "en" : "fr";
  return (
    <html lang={locale} data-scroll-behavior="smooth" className="scroll-smooth">
      <body className="bg-background text-text-primary antialiased">
        <div className="min-h-screen flex items-center justify-center px-4 text-center">
          <div>
            <p className="text-8xl font-bold gradient-text mb-4">404</p>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Page introuvable · Page not found
            </h1>
            <p className="text-text-secondary mb-8">
              Cette page n&apos;existe pas ou a été déplacée.
              <br />
              This page doesn&apos;t exist or has been moved.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-accent-contrast px-6 py-3 text-sm font-semibold"
            >
              Retour à l&apos;accueil / Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
