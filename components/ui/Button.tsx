"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  external?: boolean;
  /** Libellé accessible optionnel — utile quand plusieurs boutons de la même
   *  page partagent le même texte visible (ex. 3 CTA "Discuter de mon projet"
   *  sur les cartes de formules, à différencier au clavier/lecteur d'écran). */
  ariaLabel?: string;
}

const variants = {
  primary:
    "bg-gradient-accessible text-accent-contrast font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]",
  secondary:
    "bg-surface-2 text-text-primary border border-border-light hover:border-primary/50 hover:bg-surface",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-2",
  outline: "border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm font-medium",
  lg: "px-8 py-4 text-base font-semibold",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled,
  className,
  external,
  ariaLabel,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer select-none",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    // Liens externes (URL absolue, mailto, tel) → <a> standard.
    const isExternal = external || /^(https?:|mailto:|tel:)/.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          {...(external || href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    }
    // Liens internes → Link next-intl (préfixe la locale automatiquement).
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
    >
      {children}
    </motion.button>
  );
}
