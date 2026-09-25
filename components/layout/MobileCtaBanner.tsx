"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function MobileCtaBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("MobileCta");
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pas sur /services : le bouton y renverrait vers la page elle-même, et la
  // barre fixe du panneau "Votre sélection" occupe déjà le bas de l'écran
  // mobile (SelectionPanel.tsx) — les deux se superposeraient.
  if (pathname === "/services") return null;

  const sharedClass =
    "flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-accent-accessible text-accent-contrast font-semibold text-sm shadow-2xl shadow-primary/30";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
        >
          <Link href="/services" className={sharedClass}>
            {t("default")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
