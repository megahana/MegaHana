import type { Metadata } from "next";
import Image from "next/image";
import { Linkedin, Github, Store, MessageCircle, Code2, Zap, TrendingUp } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Badge } from "@/components/ui/Badge";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { localizedMetadata, LINKEDIN_STUDIO_URL } from "@/lib/site";
import { UPWORK_PRODUCT_URL } from "@/lib/upwork";

const LINKEDIN_PERSO_URL = "https://www.linkedin.com/in/ahmed-omerovic-20b646229/";
const GITHUB_URL = "https://github.com/megahana";
const PHOTO_SRC = "/images/photo.png";

const whyMeIcons = [MessageCircle, Code2, Zap, TrendingUp];

const skills = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel", "Lighthouse", "Figma"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About.meta" });
  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/about"),
  };
}

function AboutContent() {
  const t = useTranslations("About");
  const intro = t.raw("intro") as string[];
  const whyMe = t.raw("whyMe.items") as { title: string; description: string }[];

  return (
    <div className="pt-20">
      {/* ── Hero ── */}
      <section className="pt-8 pb-10 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <AnimateIn>
            <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-6">
              {t("eyebrow")}
            </p>
          </AnimateIn>

          {/* Identité */}
          <AnimateIn delay={0.1}>
            <div className="flex items-center gap-5 mb-8">
              <div className="relative w-20 h-20 shrink-0">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-primary opacity-40 blur-sm" />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border">
                  <Image src={PHOTO_SRC} alt="Ahmed OMEROVIC" fill className="object-cover" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Ahmed OMEROVIC</h1>
                <p className="text-text-secondary text-sm mt-0.5">{t("role")}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <a
                    href={LINKEDIN_PERSO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-light transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    {t("linkedinPerso")}
                  </a>
                  <span className="text-border-light">·</span>
                  <a
                    href={LINKEDIN_STUDIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-light transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    Megahana
                  </a>
                  <span className="text-border-light">·</span>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                  <span className="text-border-light">·</span>
                  <a
                    href={UPWORK_PRODUCT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-light transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Upwork
                  </a>
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Introduction */}
          <AnimateIn delay={0.2}>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              {intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Pourquoi travailler avec moi ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimateIn>
          <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-3">
              {t("whyMe.eyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              {t("whyMe.titleLead")}{" "}
              <span className="gradient-text">{t("whyMe.titleHighlight")}</span>
            </h2>
          </div>
        </AnimateIn>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {whyMe.map((item, i) => {
            const Icon = whyMeIcons[i];
            return (
              <AnimateIn key={item.title} delay={i * 0.08}>
                <div className="card-border rounded-2xl p-px h-full">
                  <div className="bg-surface rounded-2xl p-5 h-full flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                      {Icon && <Icon className="w-4 h-4 text-primary-light" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm mb-1">{item.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </section>

      {/* ── Technologies ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <AnimateIn>
            <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-3">
              {t("tech.eyebrow")}
            </p>
            <h2 className="text-2xl font-bold text-text-primary mb-2">{t("tech.title")}</h2>
            <p className="text-sm text-text-secondary mb-6">{t("tech.subtitle")}</p>
          </AnimateIn>

          <AnimateIn delay={0.1} className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="primary" className="text-sm px-4 py-2">
                {skill}
              </Badge>
            ))}
          </AnimateIn>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}
