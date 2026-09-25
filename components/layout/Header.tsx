"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LogoLink } from "@/components/ui/LogoLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
  { href: "/", key: "home" },
  { href: "/services", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
  { href: "/faq", key: "faq" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Ferme le menu mobile au changement de route — un vrai effet de bord
    // externe (la navigation), pas une valeur dérivable des props/state du
    // rendu en cours ; pas de restructuration en "key reset" pertinente ici.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  return (
    // Séparation au scroll : ombre douce seule, plus de border-b. L'ancienne
    // bordure n'existait qu'en état "scrolled" : au repos, sa couleur retombait
    // sur la valeur par défaut de Tailwind (gris très clair), et
    // transition-all l'animait vers le token sombre à chaque passage du seuil
    // — d'où une ligne presque blanche d'1px pendant ≈200ms en thème sombre.
    // Transition limitée au fond et à l'ombre (plus de transition-all).
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/20 dark:shadow-black/40"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo SVG (LogoLink, partagé avec le footer) : lien vers l'accueil,
              entrouverture discrète au survol / focus clavier. */}
          <LogoLink size={48} className="items-center" />

          {/* Desktop nav */}
          {/* Menu complet à partir de lg (1024px) : avec 6 liens (FAQ ajoutée),
              à 768px le libellé « À propos », le bouton CTA et le sélecteur de
              langue passaient sur deux lignes ou étaient rognés. Sous lg :
              menu burger. */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "text-text-primary bg-surface-2"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2/60",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* CTA + langue */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button href="/services" size="sm">
              {t("cta")}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-text-primary bg-surface-2"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2/60",
                  )}
                >
                  {t(item.key)}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-border flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
                <Button href="/services" className="flex-1 justify-center">
                  {t("cta")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
