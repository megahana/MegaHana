// Import next-intl/middleware inchangé malgré le renommage de fichier
// middleware.ts -> proxy.ts (Next.js 16) : confirmé sur la doc next-intl,
// seul le nom du fichier/de la convention change, pas ce module.
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/**
 * ESSAI CSP en Report-Only (étude du 01/10, désactivé par défaut) : avec
 * CSP_REPORT_ONLY_TRIAL=1, chaque page reçoit EN PLUS de la CSP appliquée
 * (next.config.mjs, inchangée) une politique resserrée en
 * Content-Security-Policy-Report-Only : script-src par nonce par requête +
 * 'strict-dynamic', sans 'unsafe-inline'. Rien n'est bloqué ; le
 * navigateur signale seulement ce qui le serait (console,
 * événement securitypolicyviolation).
 *
 * Le nonce est posé dans l'en-tête de REQUÊTE
 * content-security-policy-report-only : Next le lit
 * (app-render, getScriptNonceFromHeader) et l'applique à ses propres
 * scripts ; x-nonce le transmet au layout pour les scripts du site
 * (InsertedScripts). next-intl recopie les en-têtes de la requête dans la
 * suite du rendu (NextResponse.next/rewrite({ request: { headers } })).
 * Les pages sont déjà rendues dynamiquement (cookies() du layout) : le
 * nonce ne coûte aucune génération statique.
 */
const TRIAL = process.env.CSP_REPORT_ONLY_TRIAL === "1";
const isDev = process.env.NODE_ENV !== "production";

function reportOnlyPolicy(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'report-sample'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self' https://api.web3forms.com${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export default function proxy(request: NextRequest) {
  if (!TRIAL) return handleI18nRouting(request);
  const nonce = btoa(crypto.randomUUID());
  const policy = reportOnlyPolicy(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("content-security-policy-report-only", policy);
  const response = handleI18nRouting(request);
  response.headers.set("Content-Security-Policy-Report-Only", policy);
  return response;
}

export const config = {
  // Applique le proxy à toutes les routes sauf API, fichiers Next internes,
  // fichiers statiques racine (sitemap, robots, icônes, images, og…), et le
  // labo interne /dev et /dev/* (app/dev/, gitignoré, hors [locale] : jamais
  // préfixé par une langue). "dev(?:/|$)" et non "dev" : une future page
  // /devis ou /developpement doit garder son routage FR/EN ; et non plus
  // "dev/" seul, qui laissait /dev partir vers /fr/dev (404).
  matcher: ["/((?!api|_next|_vercel|dev(?:/|$)|.*\\..*).*)"],
};
