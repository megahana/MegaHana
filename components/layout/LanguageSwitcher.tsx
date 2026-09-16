"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname(); // chemin SANS préfixe de langue
  const t = useTranslations("Navigation");

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border overflow-hidden",
        className,
      )}
      role="group"
      aria-label={t("switchToFr") + " / " + t("switchToEn")}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            aria-current={active ? "true" : undefined}
            aria-label={loc === "fr" ? t("switchToFr") : t("switchToEn")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "bg-surface-2 text-text-primary"
                : "text-text-muted hover:text-text-primary hover:bg-surface-2/60",
            )}
          >
            {loc}
          </Link>
        );
      })}
    </div>
  );
}
