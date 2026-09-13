"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Bascule dark/light.
 * Le thème est appliqué avant paint par le script anti-flash du layout ;
 * ici on lit l'état réel au montage et on le bascule + persiste (localStorage).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Navigation");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* localStorage indisponible : on ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme")}
      className={cn(
        "p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2/60 transition-colors",
        className
      )}
    >
      {/* Avant montage : icône neutre (évite tout flash d'état) */}
      {mounted && !isDark ? (
        <Moon className="w-[18px] h-[18px]" />
      ) : (
        <Sun className="w-[18px] h-[18px]" />
      )}
    </button>
  );
}
