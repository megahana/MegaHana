import { Linkedin, Instagram, Facebook, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  LINKEDIN_STUDIO_URL,
  BEHANCE_STUDIO_URL,
  INSTAGRAM_STUDIO_URL,
  FACEBOOK_STUDIO_URL,
} from "@/lib/site";
import { UPWORK_PRODUCT_URL } from "@/lib/upwork";
import { LogoLink } from "@/components/ui/LogoLink";

const navItems = [
  { href: "/services", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Footer() {
  const t = useTranslations("Footer");
  const tn = useTranslations("Navigation");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface/85 dark:bg-surface/70 backdrop-blur-sm border-t border-border mt-24">
      {/* pb-28 sur mobile : dégage le bas du sticky CTA fixe (md:hidden) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            {/* Logo SVG (LogoLink, partagé avec le header) : même rendu et même
                survol qu'en haut de page. */}
            <LogoLink size={36} className="mb-4" />
            <p className="text-sm text-text-secondary leading-relaxed">{t("description")}</p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t("navHeading")}</h3>
            {/* Recette V1 (17/09) : liens ~16-20px de haut, sous le minimum
                WCAG 2.5.8 (24×24px) et serré au doigt sur mobile. py-2 sur
                chaque lien agrandit la zone cliquable (~36px) ET l'espace
                perçu entre les liens (au lieu de resserrer pour compenser). */}
            <ul>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {tn(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t("contactHeading")}</h3>
            <ul>
              <li>
                <a
                  href={UPWORK_PRODUCT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("upwork")}
                </a>
              </li>
              <li>
                <a
                  href={LINKEDIN_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  {t("linkedin")}
                </a>
              </li>
              {/* Behance : pas d'icône de marque dans lucide-react (vérifié,
                  version installée) — même repli que pour Upwork ci-dessus :
                  ExternalLink générique plutôt qu'un logo. */}
              <li>
                <a
                  href={BEHANCE_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("behance")}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  {t("instagram")}
                </a>
              </li>
              <li>
                <a
                  href={FACEBOOK_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  {t("facebook")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          {/* Liens légaux — discrets mais visibles. Même correctif de zone
              cliquable que ci-dessus (py-2, sans compenser par un gap plus
              petit). */}
          <nav className="flex flex-wrap justify-center sm:justify-start gap-x-5 text-xs">
            <Link
              href="/legal"
              className="inline-block py-2 text-text-muted hover:text-text-primary transition-colors"
            >
              {t("legal.notice")}
            </Link>
            <Link
              href="/privacy"
              className="inline-block py-2 text-text-muted hover:text-text-primary transition-colors"
            >
              {t("legal.privacy")}
            </Link>
            <Link
              href="/terms"
              className="inline-block py-2 text-text-muted hover:text-text-primary transition-colors"
            >
              {t("legal.terms")}
            </Link>
          </nav>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-text-muted">
            <p>{t("rights", { year })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
