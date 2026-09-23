import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * En-têtes de sécurité HTTP (securityheaders.com / MDN Observatory, 26/09).
 * Posés ici via headers(), PAS via un middleware à base de nonce : ce site
 * est très majoritairement statique (build 100% de routes générées) et sans
 * zone connectée — un nonce forcerait un rendu dynamique partout (perte du
 * cache CDN/génération statique) pour un gain non justifié par le profil du
 * site. Approche officielle Next.js "sans nonce", documentée comme
 * nécessitant 'unsafe-inline' sur script-src/style-src.
 *
 * 'unsafe-inline' sur script-src : pas qu'une concession générique Next.js —
 * ce projet a un vrai script inline exécutable (anti-flash thème dark/light,
 * voir app/[locale]/layout.tsx `themeScript`, injecté via
 * InsertedScripts.tsx/useServerInsertedHTML) qui serait bloqué sans ça.
 *
 * Domaines externes réels utilisés par le site (audit du 26/09, pas deviné) :
 * - connect-src : api.web3forms.com (fetch() du formulaire de contact,
 *   ContactForm.tsx) — aucun autre appel réseau externe côté client.
 * - img-src : pas de domaine externe. www.megareco.com et
 *   mega-taste.vercel.app avaient été gardés ici par cohérence avec
 *   images.remotePatterns, mais re-vérification exhaustive du 27/09 (y
 *   compris lib/data.ts et tout contenu dynamique) : aucun <Image> du site
 *   ne les référence, ce sont uniquement des liens <a href> externes
 *   ("voir le site"). Retirés ici et de remotePatterns ci-dessous.
 * - Pas de @vercel/analytics / @vercel/speed-insights (absents de
 *   package.json) : aucun domaine Vercel Analytics à ajouter.
 * - Polices via next/font/google (Fraunces/Inter/Inter_Tight) : servies en
 *   local (/_next/static/media/*.woff2) au build, aucune requête vers
 *   fonts.googleapis.com/fonts.gstatic.com au runtime — font-src 'self' seul
 *   suffit.
 * - Aucun <iframe> nulle part sur le site → frame-ancestors 'none'.
 *
 * Assouplissement dev uniquement (27/09, retour Ahmed — erreur "eval() is
 * not supported" au lancement de `next dev` avec cette CSP) : React/Fast
 * Refresh utilisent eval() en développement pour reconstruire les
 * callstacks (message d'erreur React lui-même : "React will never use
 * eval() in production mode") ; le serveur de dev (HMR) ouvre aussi une
 * connexion WebSocket same-origin. 'unsafe-eval' et ws:/wss: ne sont donc
 * ajoutés qu'en développement (process.env.NODE_ENV !== "production") —
 * la CSP de production reste strictement celle vérifiée le 26/09.
 */
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' https://api.web3forms.com${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

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
  // securityheaders.com (note D) / MDN Observatory (C-, 45/100) du 26/09 —
  // HSTS déjà correct (géré par Vercel) est volontairement laissé tel quel
  // ici : includeSubDomains/preload sont un engagement quasi irréversible et
  // concernent le futur sous-domaine demos.megahana.com, pas encore
  // clarifié — à trancher séparément par Ahmed, pas dans ce correctif.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Filet pour les navigateurs qui ignorent frame-ancestors (CSP) —
          // corrige aussi directement le signal manquant sur securityheaders.com.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Le site n'utilise aucune de ces fonctionnalités : désactivation
          // par défaut plutôt qu'absence de politique.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  images: {
    // Next 16 restreint qualities par défaut à [75] — le repo utilise
    // explicitement 90/95/100 (ProjectGallery.tsx, ProjectCaseStudy.tsx),
    // qui seraient sinon arrondis à 75 (perte de qualité silencieuse).
    qualities: [75, 90, 95, 100],
  },
};

export default withNextIntl(nextConfig);
