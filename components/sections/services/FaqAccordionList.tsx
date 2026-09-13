"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { cn } from "@/lib/utils";

type FaqItem = { question: string; answer: string };

/**
 * Logique interactive de la FAQ (état accordéon + toggle), extraite de
 * FaqAccordion.tsx pour que ce dernier redevienne un Server Component.
 * Reçoit les items déjà traduits en props — aucun useTranslations ici.
 */
export function FaqAccordionList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-12 space-y-3">
      {items.map((item, i) => (
        <AnimateIn key={i} delay={i * 0.05}>
          <div className="card-border rounded-xl p-px">
            <div className="bg-surface rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left gap-4 group"
              >
                <span
                  className={cn(
                    "font-medium text-sm md:text-base transition-colors",
                    open === i ? "text-primary-light" : "text-text-primary"
                  )}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-text-muted shrink-0 transition-transform duration-200",
                    open === i && "rotate-180 text-primary-light"
                  )}
                />
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
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
        </AnimateIn>
      ))}
    </div>
  );
}
