import "./globals.css";

// 404 global (hors contexte de locale) : doit être autonome car il n'existe
// pas de root layout — c'est app/[locale]/layout.tsx qui porte <html>/<body>.
export default function NotFound() {
  return (
    <html lang="fr" className="scroll-smooth">
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
            <a
              href="/fr"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-accent-contrast px-6 py-3 text-sm font-semibold"
            >
              Retour à l&apos;accueil / Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
