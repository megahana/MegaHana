import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Clock } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { ProjectCaseStudy } from "@/components/sections/portfolio/ProjectCaseStudy";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/data";
import { localizedMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Portfolio.meta" });
  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/portfolio"),
  };
}

// Palettes visuelles des projets en préparation (structurel) — pas de marque
// réelle à représenter, donc accents décoratifs de marque (sakura/or), pas de
// couleur hors charte.
const comingSoonPalettes: Record<string, { primary: string; accent: string; bg: string }> = {
  megabuild: { primary: "#E8A0A8", accent: "#E8A0A8", bg: "#1C1B18" },
  megacoach: { primary: "#C9A876", accent: "#C9A876", bg: "#211D16" },
};
const comingSoonIds = ["megabuild", "megacoach"] as const;

function PortfolioContent() {
  const t = useTranslations("Portfolio");
  const tc = useTranslations("Common");
  const caseStudyProject = projects.find((p) => p.caseStudy) ?? projects[0];
  const showcaseProjects = projects.filter((p) => !p.caseStudy);
  const comingSoonTags = t.raw("comingSoonTags") as string[];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="pt-8 pb-10 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <AnimateIn>
          <SectionHeader
            as="h1"
            eyebrow={t("header.eyebrow")}
            title={t("header.titleLead")}
            titleHighlight={t("header.titleHighlight")}
            description={t("header.description")}
          />
        </AnimateIn>
      </section>

      {/* ── Sites vitrines ── */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimateIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-6">
            {t("showcaseHeading")}
          </p>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {showcaseProjects.map((p, i) => {
            const accent = p.id === "megataste" ? "#D4A373" : undefined;
            const accentDim = p.id === "megataste" ? "#b8895a" : undefined;
            const accentBg = accent ? `${accent}15` : undefined;
            const accentBorder = accent ? `${accent}35` : undefined;
            const surfaceBg = p.id === "megataste" ? "#1a1612" : undefined;

            return (
              <AnimateIn key={p.id} delay={i * 0.08}>
                <div className="relative group h-full">
                  {accent && (
                    <div
                      className="absolute -inset-px rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${accent}55, ${accentDim}22)` }}
                    />
                  )}
                  <div
                    className={cn("relative rounded-2xl overflow-hidden h-full flex flex-col", !accent && "card-border")}
                    style={accent ? { background: surfaceBg, border: `1px solid ${accentBorder}` } : undefined}
                  >
                    <div
                      className="relative w-full aspect-[16/9] overflow-hidden bg-surface-2"
                      style={{ borderBottom: accent ? `1px solid ${accentBorder}` : undefined }}
                    >
                      {p.images?.homepage ? (
                        <Image
                          src={p.images.homepage}
                          alt={p.title}
                          fill
                          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-xs text-text-muted">{t("captureSoon")}</p>
                        </div>
                      )}
                      <div
                        className={cn("absolute inset-0", !accent && "bg-gradient-to-t from-surface-2 to-transparent")}
                        style={accent ? { background: `linear-gradient(to top, ${surfaceBg} 0%, transparent 50%)` } : undefined}
                      />
                    </div>

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: accent ? "#f5efe6" : undefined }}>
                            {p.title}
                          </h3>
                          <p className="text-sm mt-1 leading-relaxed" style={{ color: accent ? "#a89070" : undefined }}>
                            {t(`showcase.${p.id}.description`)}
                          </p>
                        </div>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium shrink-0 group/lnk mt-0.5 transition-colors hover:opacity-80"
                            style={{ color: accent ?? undefined }}
                          >
                            {tc("viewSite")}
                            <ExternalLink className="w-3.5 h-3.5 group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5 transition-transform" />
                          </a>
                        )}
                      </div>

                      {p.techStack && (
                        <div
                          className={cn("flex flex-wrap gap-1.5 mt-auto pt-3", !accent && "border-t border-border")}
                          style={accent ? { borderTop: `1px solid ${accentBorder}` } : undefined}
                        >
                          {p.techStack.map((tech) => (
                            <span
                              key={tech.name}
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border",
                                !accent && "text-text-secondary border-border"
                              )}
                              style={accent ? { color: accentDim, background: accentBg, borderColor: accentBorder } : undefined}
                            >
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AnimateIn>
            );
          })}

          {/* Placeholder futur projet */}
          <AnimateIn delay={0.1}>
            <div className="rounded-2xl border border-dashed border-border p-6 sm:p-8 flex flex-col items-center justify-center gap-2 aspect-[16/10] text-center">
              <Clock className="w-5 h-5 text-text-muted" />
              <p className="text-sm font-medium text-text-muted">{t("nextProjectTitle")}</p>
              <p className="text-xs text-text-muted/60">{t("nextProjectStatus")}</p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Projets en préparation */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimateIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-6">
            {t("comingSoonHeading")}
          </p>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {comingSoonIds.map((id, i) => {
            const { primary, accent, bg } = comingSoonPalettes[id];
            const borderColor = `${primary}40`;
            const badgeBg = `${primary}18`;
            const tagBg = `${primary}10`;
            const tagBorder = `${primary}30`;
            const title = id === "megabuild" ? "MegaBuild" : "MegaCoach";

            return (
              <AnimateIn key={id} delay={i * 0.08}>
                <div className="relative group h-full">
                  <div
                    className="absolute -inset-px rounded-2xl blur-sm opacity-30 group-hover:opacity-55 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${primary}55, ${primary}22)` }}
                  />
                  <div
                    className="relative rounded-2xl overflow-hidden h-full flex flex-col"
                    style={{ background: bg, border: `1px solid ${borderColor}` }}
                  >
                    <div
                      className="relative w-full aspect-[16/9] flex flex-col items-center justify-center gap-3"
                      style={{ background: `${primary}08`, borderBottom: `1px solid ${borderColor}` }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: badgeBg, border: `1px solid ${primary}30` }}
                      >
                        <Clock className="w-5 h-5" style={{ color: accent }} />
                      </div>
                      <span
                        className="text-xs font-medium px-3 py-1 rounded-full border"
                        style={{ color: accent, background: badgeBg, borderColor: `${primary}35` }}
                      >
                        {t("comingSoonBadge")}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg" style={{ color: accent }}>{title}</h3>
                        </div>
                        <p className="text-xs mb-1" style={{ color: `${accent}80` }}>
                          {t(`coming.${id}.tagline`)}
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: `${accent}99` }}>
                          {t(`coming.${id}.description`)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-auto pt-3" style={{ borderTop: `1px solid ${borderColor}` }}>
                        {comingSoonTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border"
                            style={{ color: `${accent}99`, background: tagBg, borderColor: tagBorder }}
                          >
                            {tag}
                          </span>
                        ))}
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border"
                          style={{ color: `${primary}80`, borderColor: tagBorder, background: tagBg }}
                        >
                          {t("comingSoonComing")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </section>

      {/* Étude de cas */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimateIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-6">
            {t("caseStudyHeading")}
          </p>
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <ProjectCaseStudy project={caseStudyProject} />
        </AnimateIn>
      </section>

      <CtaBanner />
    </div>
  );
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortfolioContent />;
}
