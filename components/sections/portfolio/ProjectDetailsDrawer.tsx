"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MEGARECO_DARK_BG } from "@/components/sections/portfolio/megareco-theme";

interface Props {
  toggleLabel: string;
  closeLabel: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  children: React.ReactNode;
}

/**
 * Tiroir ("drawer") pour le détail complet d'une étude de cas — correction
 * portfolio 09/2026 : la synthèse visible au-dessus (ProjectCaseStudy) suffit
 * à un visiteur qui scrolle sans intention précise ; ce composant porte le
 * contenu long (besoin, réalisation, choix techniques) pour qui veut
 * approfondir, fermé par défaut.
 *
 * Implémente le W3C ARIA Disclosure (Show/Hide) Pattern
 * (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) : bouton unique
 * opérable au clavier, état exposé via aria-expanded/aria-controls, panneau
 * repéré par role="region" + aria-labelledby.
 *
 * Isolé en Client Component (useState) pour que ProjectCaseStudy.tsx reste un
 * Server Component — même principe que MarqueeControls.tsx pour la Galerie.
 */
export function ProjectDetailsDrawer({
  toggleLabel,
  closeLabel,
  accentColor,
  textColor,
  borderColor,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div>
      <button
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          color: textColor,
          borderColor,
          ["--tw-ring-color" as string]: accentColor,
          ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
        }}
      >
        {isOpen ? closeLabel : toggleLabel}
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-8 sm:pt-10 space-y-10 sm:space-y-12">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
