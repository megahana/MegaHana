"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an
const THEME_STORAGE_KEY = "theme";

function persistTheme(value: "dark" | "light") {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    /* localStorage indisponible : on ignore */
  }
  try {
    document.cookie = `theme=${value}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    /* cookies indisponibles : on ignore, le localStorage suffit en solo-onglet */
  }
}

// Source de vérité : la classe "dark" réelle sur <html>, observée en direct
// (MutationObserver) plutôt que recopiée une seule fois dans un useState au
// montage. Avant ce correctif, isDark était un useState figé au montage : si
// le composant persistait à travers une navigation (au lieu d'être démonté
// et remonté) pendant que <html> changeait de classe pour une autre raison
// (rendu serveur du cookie, script anti-flash), ce bouton pouvait afficher
// une icône qui ne correspondait plus au thème réellement affiché, et son
// prochain clic bascule(ait) alors dans le mauvais sens. Avec
// useSyncExternalStore, ce composant ne peut plus se désynchroniser de l'état
// réel du DOM, quelle que soit la source du changement.
function subscribeToThemeClass(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
function getIsDarkSnapshot() {
  return document.documentElement.classList.contains("dark");
}
function getIsDarkServerSnapshot() {
  return false;
}

/**
 * Bascule dark/light.
 * Le thème est appliqué avant paint par le script anti-flash du layout ;
 * ici on lit l'état réel en continu (voir subscribeToThemeClass) et on le
 * bascule + persiste.
 *
 * Persisté à la fois en localStorage (lecture rapide côté client) ET en
 * cookie "theme" (lu côté serveur par app/[locale]/layout.tsx pour poser
 * la classe "dark" directement dans le HTML rendu). Le cookie est ce qui
 * corrige le bug de reset en blanc au changement de langue : sans lui, le
 * Server Component de layout ne connaît pas le thème choisi et regénère
 * un <html> sans la classe "dark" à chaque navigation qui refait tourner
 * ce composant serveur (dont le changement de langue, qui fait remonter
 * tout le segment [locale]) — React réconcilie alors l'élément <html> et
 * écrase la classe ajoutée manuellement par ce composant.
 *
 * Complément 15/09 — cause du reset intermittent identifiée : le Router
 * Cache de Next.js (App Router) met en cache le payload RSC de chaque
 * segment déjà visité pendant une fenêtre de temps, y compris le rendu de
 * ce layout (qui dépend du cookie "theme"). Basculer le thème puis
 * naviguer (ex. changer de langue) vers un segment DÉJÀ visité pendant
 * cette fenêtre pouvait donc resservir l'ancien <html> mis en cache —
 * calculé avec l'ancienne valeur du cookie — sans repasser par le
 * serveur. C'est ce qui rendait le bug intermittent (seulement quand le
 * segment cible avait déjà été visité récemment). Fix : router.refresh()
 * juste après avoir posé le nouveau cookie, qui invalide ce cache pour
 * que la prochaine navigation regénère le <html> à partir du cookie à
 * jour. L'ancien filet de sécurité (réapplication de localStorage à
 * chaque changement de route) est retiré : en plus de ne pas traiter la
 * cause réelle, il pouvait lui-même écraser un <html> correctement rendu
 * par le serveur avec une valeur de localStorage périmée si les deux
 * venaient à diverger.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Navigation");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isDark = useSyncExternalStore(
    subscribeToThemeClass,
    getIsDarkSnapshot,
    getIsDarkServerSnapshot,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    persistTheme(next ? "dark" : "light");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme")}
      className={cn(
        "p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2/60 transition-colors",
        className,
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
