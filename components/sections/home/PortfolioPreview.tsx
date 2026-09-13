import Image from "next/image";
import { ExternalLink, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/data";

/* Palette de marque par projet — uniquement pour les projets qui ont une
   identité propre connue (ex. MegaReco). Tout autre projet "featured" passe
   par les tokens du site (branche "sinon" plus bas). */
const PROJECT_PALETTES: Record<string, { bg: string; surface: string; accent: string; accentHover: string; text: string; textSec: string; border: string }> = {
  megareco: {
    bg: "#0e0f14",
    surface: "#1c1d21",
    accent: "#f4a261",
    accentHover: "#b88e6f",
    text: "#f0f0f0",
    textSec: "#6e6e7a",
    border: "rgba(255,255,255,0.07)",
  },
};

export function PortfolioPreview() {
  const featured = projects.filter((p) => p.featured);
  const t = useTranslations("Home.portfolio");
  const tp = useTranslations("Projects");
  const tc = useTranslations("Common");

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AnimateIn>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("titleLead")}
          titleHighlight={t("titleHighlight")}
          description={t("description")}
        />
      </AnimateIn>

      {/* Carrousel léger : scroll horizontal natif, snap, pas d'auto-avance ni
          de JS d'animation — respecte prefers-reduced-motion par construction
          (il n'y a rien à débrancher) et reste navigable au clavier/tactile. */}
      <AnimateIn>
        <div
          className="mt-12 flex gap-5 overflow-x-auto snap-x snap-proximity scroll-px-4 sm:scroll-px-6 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6"
          role="region"
          aria-label={t("carouselRegion")}
        >
          {featured.map((project) => {
            const p = PROJECT_PALETTES[project.id];
            return (
              <div key={project.id} className="relative group shrink-0 snap-start w-[300px] sm:w-[340px]">
                {/* Glow (couleur de marque du projet si connue, sinon accent du site) */}
                <div
                  className={cn(
                    "absolute -inset-px rounded-2xl blur-sm opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none",
                    !p && "bg-gradient-to-br from-primary/35 to-primary/15"
                  )}
                  style={p ? { background: `linear-gradient(135deg, ${p.accent}55, ${p.accentHover}33)` } : undefined}
                />
                <div
                  className={cn("relative h-full flex flex-col rounded-2xl overflow-hidden", !p && "card-border")}
                  style={p ? { background: p.surface, border: `1px solid ${p.border}` } : undefined}
                >
                  {/* Screenshot */}
                  {project.images?.homepage && (
                    <div
                      className={cn("relative w-full h-40 overflow-hidden", !p && "border-b border-border")}
                      style={p ? { borderBottom: `1px solid ${p.border}` } : undefined}
                    >
                      <Image
                        src={project.images.homepage}
                        alt={t("imageAlt", { name: project.title })}
                        fill
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="340px"
                      />
                      <div
                        className={cn("absolute inset-0", !p && "bg-gradient-to-t from-surface to-transparent")}
                        style={p ? { background: `linear-gradient(to top, ${p.surface} 0%, transparent 50%)` } : undefined}
                      />
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2.5">
                      {/* Logo */}
                      {project.images?.logo ? (
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                            !p && "bg-surface-2 border border-border"
                          )}
                          style={p ? { background: p.bg, border: `1px solid ${p.border}` } : undefined}
                        >
                          <Image
                            src={project.images.logo}
                            alt={`${project.title} logo`}
                            width={32}
                            height={32}
                            className="object-contain w-7 h-7"
                          />
                        </div>
                      ) : (
                        <div
                          className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", !p && "bg-gradient-primary")}
                          style={p ? { background: p.accent } : undefined}
                        >
                          <span className="text-accent-contrast font-bold text-sm">M</span>
                        </div>
                      )}
                      <h3 className={cn("text-base font-bold min-w-0 truncate", !p && "text-text-primary")} style={p ? { color: p.text } : undefined}>
                        {project.title}
                      </h3>
                    </div>

                    <span
                      className={cn(
                        "self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                        !p && "text-primary-light bg-primary/10 border-primary/20"
                      )}
                      style={
                        p
                          ? { color: p.accent, background: `${p.accent}18`, borderColor: `${p.accent}40` }
                          : undefined
                      }
                    >
                      ✦ {t("badge")}
                    </span>

                    <p
                      className={cn("text-sm leading-relaxed line-clamp-2 flex-1", !p && "text-text-secondary")}
                      style={p ? { color: p.textSec } : undefined}
                    >
                      {tp(`${project.id}.shortDescription`)}
                    </p>

                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-2 text-sm font-medium shrink-0 transition-colors group/link mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded",
                          p
                            ? "[color:var(--link-color)] hover:[color:var(--link-color-hover)]"
                            : "text-accent-accessible hover:text-primary-dark"
                        )}
                        style={
                          p
                            ? ({ "--link-color": p.accent, "--link-color-hover": p.accentHover } as React.CSSProperties)
                            : undefined
                        }
                      >
                        {tc("viewSite")}
                        <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AnimateIn>

      <AnimateIn delay={0.2} className="mt-8 text-center">
        <Button href="/portfolio" variant="secondary">
          {t("viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </AnimateIn>
    </section>
  );
}
