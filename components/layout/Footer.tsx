import Image from "next/image";
import { Linkedin, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LINKEDIN_STUDIO_URL, LOGO_URL, LOGO_WIDTH, LOGO_HEIGHT } from "@/lib/site";
import { UPWORK_PRODUCT_URL } from "@/lib/upwork";

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
            <Link href="/" className="inline-flex mb-4">
              {/* sizes obligatoire ici aussi — même cause que Header.tsx :
                  sans lui, next/image dimensionne le srcset sur width/height
                  (1254px, taille du fichier source) plutôt que sur la taille
                  CSS réellement affichée (36px). */}
              <Image
                src={LOGO_URL}
                alt="Megahana"
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                sizes="36px"
                className="h-9 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">{t("description")}</p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t("navHeading")}</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
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
            <ul className="space-y-2">
              <li>
                <a
                  href={UPWORK_PRODUCT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
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
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  {t("linkedin")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          {/* Liens légaux — discrets mais visibles */}
          <nav className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-xs">
            <Link
              href="/legal"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {t("legal.notice")}
            </Link>
            <Link
              href="/privacy"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {t("legal.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {t("legal.terms")}
            </Link>
          </nav>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-text-muted">
            <p>{t("rights", { year })}</p>
            <p>{t("madeWith")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
