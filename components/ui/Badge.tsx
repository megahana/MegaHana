import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "sakura" | "gold";
  className?: string;
}

const variants = {
  default: "bg-surface-2 text-text-secondary border-border",
  primary: "bg-primary/10 text-primary-light border-primary/20",
  sakura: "bg-sakura/10 text-sakura border-sakura/20",
  gold: "bg-gold/10 text-gold border-gold/20",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
