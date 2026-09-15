import Image from "next/image";
import {
  ExternalLink,
  Github,
  Search,
  User,
  MessageSquare,
  Trophy,
  Lock,
  LayoutDashboard,
  Smartphone,
  ArrowRight,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectGallery } from "@/components/sections/portfolio/ProjectGallery";
import { ProjectDetailsDrawer } from "@/components/sections/portfolio/ProjectDetailsDrawer";
import { MEGARECO_DARK_BG } from "@/components/sections/portfolio/megareco-theme";
import { cn } from "@/lib/utils";
import type { GalleryImage, Project } from "@/types";

/* Palette MegaReco par défaut — surchargeable via accent */
const DEFAULT_ACCENT = {
  primary: "#f4a261",
  dim: "#b88e6f",
  soft: "#9c7b5f",
  bg: MEGARECO_DARK_BG,
  inner: "#0e0f14",
};

/* Texte — contrastes renforcés pour la lisibilité sur fond sombre */
const TEXT = {
  strong: "#f0f0f0",
  body: "#d4d2cf",
  soft: "#a8a6a2",
  label: "#9a988f",
};

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Search,
  User,
  MessageSquare,
  Trophy,
  Lock,
  LayoutDashboard,
  Smartphone,
};

interface Props {
  project: Project;
  accent?: typeof DEFAULT_ACCENT;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold tracking-widest uppercase mb-4"
      style={{ color: TEXT.label }}
    >
      {children}
    </p>
  );
}

/* Sous-titre à l'intérieur d'une partie du tiroir — un cran moins marqué que
   SectionLabel, qui porte désormais les 3 parties du tiroir (besoin,
   réalisation, choix techniques). */
function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium mb-4" style={{ color: TEXT.soft }}>
      {children}
    </p>
  );
}

export function ProjectCaseStudy({ project, accent = DEFAULT_ACCENT }: Props) {
  const cs = project.caseStudy;
  const t = useTranslations("Portfolio.caseStudy");
  if (!cs) return null;

  const { images, techStack, tags, gallerySrc, url, githubUrl, title } = project;
  const border = "1px solid rgba(255,255,255,0.08)";
  const accBorder = `${accent.primary}30`;

  const badges = t.raw("badges") as string[];
  const highlights = t.raw("highlights") as string[];
  const meta = t.raw("meta") as { label: string; value: string }[];
  const mobileBullets = t.raw("mobileBullets") as string[];
  const captions = t.raw("galleryCaptions") as { label: string; description: string }[];
  const featureGroups = t.raw("featureGroups") as { title: string; items: string[] }[];
  const challenges = t.raw("challenges") as {
    title: string;
    problem: string;
    solution: string;
    result: string;
  }[];
  const architecture = t.raw("architecture") as { flow: string[]; deployment?: string };

  // Construit la galerie en associant chemins (data) et légendes (catalogue).
  const galleryImages: GalleryImage[] = (gallerySrc ?? []).map((src, i) => ({
    src,
    label: captions[i]?.label ?? "",
    description: captions[i]?.description,
  }));
  const coverImage = galleryImages[0];

  return (
    <div className="relative">
      {/* Glow */}
      <div
        className="absolute -inset-px rounded-3xl blur opacity-30 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accent.primary}55, ${accent.soft}33)` }}
      />
      <div
        className="mh-case-study relative rounded-3xl overflow-hidden"
        style={{ background: accent.bg, border }}
      >
        {/* ── Top bar ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-10 py-5"
          style={{ borderBottom: border }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {badges.map((label, i) => (
              <span
                key={label}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                style={{
                  color: i === 0 ? accent.primary : accent.dim,
                  background: i === 0 ? `${accent.primary}18` : `${accent.primary}10`,
                  borderColor: i === 0 ? `${accent.primary}40` : `${accent.primary}25`,
                }}
              >
                {i === 0 ? `✦ ${label}` : label}
              </span>
            ))}
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors group/ext shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                color: accent.primary,
                ["--tw-ring-color" as string]: accent.primary,
                ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
              }}
            >
              {url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              <ExternalLink className="w-4 h-4 group-hover/ext:translate-x-0.5 group-hover/ext:-translate-y-0.5 transition-transform" />
            </a>
          )}
        </div>

        <div className="px-5 sm:px-6 md:px-10 py-8 md:py-10 space-y-8">
          {/* ── Synthèse (toujours visible) ──
              Correction portfolio 09/2026 : MegaReco est désormais résumé en
              quelques éléments (accroche, capture représentative, repères
              rôle/statut/compatibilité, actions) pour un visiteur qui scrolle
              sans intention précise. Le détail complet (besoin, réalisation,
              choix techniques) est déporté dans le tiroir ci-dessous. */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              {images?.logo && (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: accent.inner, border }}
                >
                  <Image
                    src={images.logo}
                    alt={`${title} logo`}
                    width={40}
                    height={40}
                    className="object-contain w-9 h-9"
                  />
                </div>
              )}
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: TEXT.strong }}>
                {title}
              </h2>
            </div>
            <p className="text-base sm:text-lg leading-relaxed mb-5" style={{ color: TEXT.body }}>
              {t("tagline")}
            </p>

            {/* Highlights qualitatifs */}
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      color: accent.dim,
                      background: `${accent.primary}0d`,
                      borderColor: accBorder,
                    }}
                  >
                    <Check
                      className="w-3 h-3"
                      style={{ color: accent.primary } as React.CSSProperties}
                    />
                    {h}
                  </span>
                ))}
              </div>
            )}

            {/* Capture représentative — une seule image, la galerie complète
                vit dans le tiroir "Réalisation". */}
            {coverImage && (
              <div className="mb-6 rounded-2xl overflow-hidden" style={{ border }}>
                <div className="relative w-full aspect-[16/9]" style={{ background: accent.inner }}>
                  <Image
                    src={coverImage.src}
                    alt={coverImage.label || title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 700px"
                  />
                </div>
              </div>
            )}

            {/* Repères rapides : rôle, statut, compatibilité */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {meta.map((m) => (
                <div
                  key={m.label}
                  className="p-4 rounded-xl"
                  style={{ background: accent.inner, border }}
                >
                  <p
                    className="text-[11px] font-semibold tracking-widest uppercase mb-1"
                    style={{ color: accent.dim }}
                  >
                    {m.label}
                  </p>
                  <p className="text-sm" style={{ color: TEXT.body }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: `linear-gradient(135deg, ${accent.primary}, ${accent.soft})`,
                    color: accent.inner,
                    boxShadow: `0 4px 24px ${accent.primary}33`,
                    ["--tw-ring-color" as string]: accent.primary,
                    ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
                  }}
                >
                  {t("labels.viewOnline", { name: title })}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    color: TEXT.body,
                    borderColor: accBorder,
                    ["--tw-ring-color" as string]: accent.primary,
                    ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
                  }}
                >
                  <Github className="w-4 h-4" />
                  {t("labels.sourceCode")}
                </a>
              )}
            </div>
          </div>

          {/* ── Tiroir : besoin, réalisation, choix techniques ── */}
          <div className="pt-2" style={{ borderTop: border }}>
            <ProjectDetailsDrawer
              toggleLabel={t("labels.discoverDetails")}
              closeLabel={t("labels.hideDetails")}
              accentColor={accent.primary}
              textColor={TEXT.body}
              borderColor={accBorder}
            >
              {/* 1. Besoin & contexte */}
              <div>
                <SectionLabel>{t("labels.needSection")}</SectionLabel>
                <div className="max-w-3xl space-y-3">
                  <p className="text-sm leading-relaxed" style={{ color: TEXT.body }}>
                    {t("intro")}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT.soft }}>
                    {t("role")}
                  </p>
                </div>
              </div>

              {/* 2. Réalisation : aperçu visuel complet + fonctionnalités */}
              <div>
                <SectionLabel>{t("labels.executionSection")}</SectionLabel>

                {galleryImages.length > 0 && (
                  <div className="mb-10">
                    <SubLabel>
                      {t("labels.visualOverview", { count: galleryImages.length })}
                    </SubLabel>
                    <ProjectGallery images={galleryImages} accentColor={accent.primary} />

                    {/* Mockup mobile */}
                    {cs.mobileImage && (
                      <div className="mt-10">
                        <SubLabel>{t("labels.mobileVersion")}</SubLabel>
                        <div
                          className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-5 sm:p-6 md:p-8 rounded-2xl"
                          style={{ background: accent.inner, border }}
                        >
                          <div
                            className="relative w-[170px] sm:w-[190px] shrink-0 aspect-[9/19] rounded-[1.75rem] overflow-hidden border-2 shadow-2xl"
                            style={{
                              borderColor: accBorder,
                              boxShadow: `0 12px 40px ${accent.primary}22`,
                            }}
                          >
                            <Image
                              src={cs.mobileImage}
                              alt={`${title} (mobile)`}
                              fill
                              quality={95}
                              className="object-cover object-top"
                              sizes="190px"
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <div className="inline-flex items-center gap-2 mb-3">
                              <Smartphone
                                className="w-4 h-4"
                                style={{ color: accent.primary } as React.CSSProperties}
                              />
                              <span
                                className="text-base font-semibold"
                                style={{ color: TEXT.strong }}
                              >
                                {t("labels.mobileTitle")}
                              </span>
                            </div>
                            <p
                              className="text-sm leading-relaxed mb-5"
                              style={{ color: TEXT.soft }}
                            >
                              {t("responsiveNote")}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto sm:mx-0">
                              {mobileBullets.map((item) => (
                                <div
                                  key={item}
                                  className="flex items-center gap-2 text-xs"
                                  style={{ color: TEXT.body }}
                                >
                                  <Check
                                    className="w-3.5 h-3.5 shrink-0"
                                    style={{ color: accent.primary } as React.CSSProperties}
                                  />
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {featureGroups.length > 0 && (
                  <div>
                    <SubLabel>{t("labels.features")}</SubLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {featureGroups.map((group, gi) => {
                        const Icon = iconMap[cs.featureIcons?.[gi] ?? ""];
                        return (
                          <div
                            key={group.title}
                            className="p-5 rounded-2xl"
                            style={{ background: accent.inner, border }}
                          >
                            <div className="flex items-center gap-2.5 mb-3">
                              {Icon && (
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: `${accent.primary}18` }}
                                >
                                  <Icon
                                    className="w-3.5 h-3.5"
                                    style={{ color: accent.primary } as React.CSSProperties}
                                  />
                                </div>
                              )}
                              <h3 className="font-semibold text-sm" style={{ color: TEXT.strong }}>
                                {group.title}
                              </h3>
                            </div>
                            <ul className="flex flex-wrap gap-1.5">
                              {group.items.map((item) => (
                                <li
                                  key={item}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs border"
                                  style={{
                                    color: TEXT.soft,
                                    background: `${accent.primary}08`,
                                    borderColor: "rgba(255,255,255,0.07)",
                                  }}
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Choix techniques : défis + architecture */}
              <div>
                <SectionLabel>{t("labels.technicalSection")}</SectionLabel>

                {challenges.length > 0 && (
                  <div className="mb-10">
                    <SubLabel>{t("labels.challenges")}</SubLabel>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {challenges.map((c, ci) => {
                        const Icon = iconMap[cs.challengeIcons?.[ci] ?? ""];
                        return (
                          <div
                            key={c.title}
                            className="p-5 rounded-2xl flex flex-col gap-4"
                            style={{ background: accent.inner, border }}
                          >
                            <div className="flex items-center gap-2.5">
                              {Icon && (
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: `${accent.primary}18` }}
                                >
                                  <Icon
                                    className="w-4 h-4"
                                    style={{ color: accent.primary } as React.CSSProperties}
                                  />
                                </div>
                              )}
                              <h3 className="font-semibold text-sm" style={{ color: TEXT.strong }}>
                                {c.title}
                              </h3>
                            </div>
                            <div className="space-y-3">
                              {[
                                {
                                  tag: t("labels.problem"),
                                  text: c.problem,
                                  className: "text-case-problem",
                                },
                                {
                                  tag: t("labels.solution"),
                                  text: c.solution,
                                  color: accent.primary,
                                },
                                {
                                  tag: t("labels.result"),
                                  text: c.result,
                                  className: "text-case-result",
                                },
                              ].map((row) => (
                                <div key={row.tag}>
                                  <p
                                    className={cn(
                                      "text-[10px] font-bold tracking-widest uppercase mb-1",
                                      row.className,
                                    )}
                                    style={row.color ? { color: row.color } : undefined}
                                  >
                                    {row.tag}
                                  </p>
                                  <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: TEXT.body }}
                                  >
                                    {row.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <SubLabel>{t("labels.architecture")}</SubLabel>

                  {/* Mini-schéma */}
                  <div
                    className="mb-6 p-5 rounded-2xl"
                    style={{ background: accent.inner, border }}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
                      {architecture.flow.map((step, i) => (
                        <div
                          key={step}
                          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2"
                        >
                          <span
                            className="px-4 py-2 rounded-lg text-xs font-medium text-center"
                            style={{
                              background: `${accent.primary}12`,
                              color: TEXT.body,
                              border: `1px solid ${accBorder}`,
                            }}
                          >
                            {step}
                          </span>
                          {i < architecture.flow.length - 1 && (
                            <ArrowRight
                              className="w-4 h-4 rotate-90 sm:rotate-0 shrink-0"
                              style={{ color: accent.dim } as React.CSSProperties}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {architecture.deployment && (
                      <p
                        className="text-xs leading-relaxed text-center mt-4"
                        style={{ color: TEXT.soft }}
                      >
                        {architecture.deployment}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {techStack && techStack.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-3" style={{ color: TEXT.soft }}>
                          {t("labels.techMain")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {techStack.map((tech) => (
                            <span
                              key={tech.name}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                              style={{
                                color: accent.dim,
                                background: `${accent.primary}10`,
                                borderColor: `${accent.primary}25`,
                              }}
                            >
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tags && tags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-3" style={{ color: TEXT.soft }}>
                          {t("labels.skills")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                              style={{
                                color: accent.soft,
                                background: `${accent.primary}08`,
                                borderColor: "rgba(255,255,255,0.07)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ProjectDetailsDrawer>
          </div>

          {/* ── CTA final (toujours visible) ── */}
          {url && (
            <div
              className="rounded-2xl px-6 py-8 text-center"
              style={{
                background: `linear-gradient(135deg, ${accent.primary}14, ${accent.soft}0a)`,
                border: `1px solid ${accBorder}`,
              }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: TEXT.strong }}>
                {t("labels.finalTitle", { name: title })}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-md mx-auto mb-6"
                style={{ color: TEXT.soft }}
              >
                {t("labels.finalText")}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: `linear-gradient(135deg, ${accent.primary}, ${accent.soft})`,
                    color: accent.inner,
                    boxShadow: `0 4px 24px ${accent.primary}33`,
                    ["--tw-ring-color" as string]: accent.primary,
                    ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
                  }}
                >
                  {t("labels.viewOnline", { name: title })}
                  <ExternalLink className="w-4 h-4" />
                </a>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      color: TEXT.body,
                      borderColor: accBorder,
                      ["--tw-ring-color" as string]: accent.primary,
                      ["--tw-ring-offset-color" as string]: MEGARECO_DARK_BG,
                    }}
                  >
                    <Github className="w-4 h-4" />
                    {t("labels.finalSource")}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
