"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LOGO_URL, LOGO_WIDTH, LOGO_HEIGHT } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
  { href: "/", key: "home" },
  { href: "/services", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
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
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/20"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo — sizes obligatoire : sans lui, next/image traite un <Image>
              non-fill comme "taille fixe" et génère son srcset à partir de
              width/height (1254px, la taille réelle du fichier source), pas
              de la taille CSS affichée (48px) — d'où le srcset observé en
              prod (w=1920 / w=3840) malgré un rendu à 48×48. Avec sizes, le
              navigateur choisit la variante réellement adaptée. */}
          <Link href="/" className="flex items-center group">
            <Image
              id="mh-header-logo"
              src={LOGO_URL}
              alt="Megahana"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              sizes="48px"
              className="h-12 w-12 object-contain transition-opacity group-hover:opacity-80"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
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
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button href="/services" size="sm">
              {t("cta")}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
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
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
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
