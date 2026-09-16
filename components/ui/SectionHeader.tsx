import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  centered?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  centered = true,
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", "max-w-3xl", centered && "mx-auto", className)}>
      {eyebrow && (
        <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-3">
          {eyebrow}
        </p>
      )}
      <Heading className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
        {title} {titleHighlight && <span className="gradient-text">{titleHighlight}</span>}
      </Heading>
      {description && (
        <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
