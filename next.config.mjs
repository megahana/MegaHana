import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * En-têtes de sécurité HTTP (securityheaders.com / MDN Observatory, 26/09).
 * Posés ici via headers(), sans nonce : approche officielle Next.js "sans
 * nonce", documentée comme nécessitant 'unsafe-inline' sur
 * script-src/style-src.
 *
 * Rendu des pages (mis à jour le 01/10) : contrairement à ce qu'indiquait
 * ce commentaire à l'origine, les pages [locale] ne sont PAS statiques —
 * toutes sont rendues à la demande (ƒ au build), parce que le layout lit le
 * cookie du thème avec cookies() (et l'accueil appelle aussi connection()
 * pour la saison du hero). Next leur envoie donc
 * Cache-Control: private, no-cache, no-store. Conséquence pour la CSP : un
 * nonce par requête ne coûterait aucune génération statique — étude et
 * essai en Report-Only dans proxy.ts (CSP_REPORT_ONLY_TRIAL=1, désactivé
 * par défaut), activation réelle non décidée.
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
 * - @vercel/analytics est installé et chargé (<Analytics />, layout, en
 *   production uniquement) : script servi par le site lui-même
 *   (/_vercel/insights/script.js) et mesures envoyées au même domaine —
 *   couverts par 'self', aucun domaine à ajouter. Le script externe
 *   va.vercel-scripts.com n'est utilisé qu'en développement, où le composant
 *   n'est pas rendu. Pas de @vercel/speed-insights.
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
