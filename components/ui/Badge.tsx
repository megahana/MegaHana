import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "sakura" | "gold";
  className?: string;
}

const variants = {
  default: "bg-surface-2 text-text-secondary border-border",
  // Texte : accent-strong en clair (4,95:1 sur ce fond ; accent-light n'y
  // faisait que 4,47:1, sous le seuil AA de 4,5:1), accent-light en sombre
  // (5,58:1, déjà conforme).
  primary: "bg-primary/10 text-primary-dark dark:text-primary-light border-primary/20",
  sakura: "bg-sakura/10 text-sakura border-sakura/20",
  gold: "bg-gold/10 text-gold border-gold/20",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
