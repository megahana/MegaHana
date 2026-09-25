"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type FaqItem = { question: string; answer: string };

/**
 * Liste de la page /faq (déplacée de /services, où elle vivait sous le nom
 * FaqAccordionList). Toutes les questions sont rendues directement au
 * chargement — plus d'apparition au scroll (AnimateIn retiré) ; seules les
 * réponses se déplient au clic.
 *
 * Reçoit les items déjà traduits en props — aucun useTranslations ici.
 * Implémente le W3C ARIA Disclosure (Show/Hide) Pattern, même pattern que
 * ProjectDetailsDrawer.tsx (portfolio) : aria-expanded/aria-controls sur le
 * bouton, panneau repéré par role="region" + aria-labelledby.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="mt-12 space-y-3">
      {items.map((item, i) => {
        const buttonId = `${baseId}-button-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        const isOpen = open === i;
        return (
          <div key={i} className="card-border rounded-xl p-px">
            <div className="bg-surface rounded-xl overflow-hidden">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left gap-4 group"
              >
                <span
                  className={cn(
                    "font-medium text-sm md:text-base transition-colors",
                    isOpen ? "text-primary-light" : "text-text-primary",
                  )}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-text-muted shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 text-primary-light",
                  )}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border pt-4 whitespace-pre-line">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
