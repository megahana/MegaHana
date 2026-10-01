import { useTranslations } from "next-intl";
import { Linkedin, Github, Store } from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { LINKEDIN_STUDIO_URL } from "@/lib/site";
import { UPWORK_PRODUCT_URL } from "@/lib/upwork";

const LINKEDIN_PERSO_URL = "https://www.linkedin.com/in/ahmed-omerovic-20b646229/";
const GITHUB_URL = "https://github.com/megahana";

/**
 * Photos pré-optimisées (AVIF + WebP, 1x/2x), générées hors build depuis les
 * sources retouchées : portrait « doux » (ciel désaturé, légère chauffe,
 * ombres relevées), scène de travail « casquette » (rouges de la casquette
 * désaturés). Largeurs = 1x/2x des cartes à leur taille maximale
 * (270 et 370 px CSS, voir .mh-about-duo dans app/globals.css).
 */
const PHOTO_DIR = "/images/about";
const PORTRAIT = { name: "apropos-portrait-doux", widths: [270, 540], width: 540, height: 675 };
const WORK = { name: "apropos-travail-casquette", widths: [370, 740], width: 740, height: 555 };

type PhotoSpec = typeof PORTRAIT;

function AboutPhoto({
  photo,
  alt,
  priority = false,
}: {
  photo: PhotoSpec;
  alt: string;
  priority?: boolean;
}) {
  const srcSet = (ext: string) =>
    photo.widths.map((w, i) => `${PHOTO_DIR}/${photo.name}-${w}.${ext} ${i + 1}x`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} />
      <source type="image/webp" srcSet={srcSet("webp")} />
      <img
        src={`${PHOTO_DIR}/${photo.name}-${photo.widths[0]}.webp`}
        alt={alt}
        width={photo.width}
        height={photo.height}
        // Les deux cartes sont en haut de page : jamais de lazy.
        // fetchpriority="high" réservé à l'élément LCP (mesuré : la carte
        // arrière, plus grande surface rendue que le portrait).
        loading="eager"
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </picture>
  );
}

/**
 * Liens sociaux. Les deux LinkedIn disent à qui ils mènent : libellé visible
 * + nom accessible qui commence par ce libellé (WCAG 2.5.3).
 */
function SocialLinks() {
  const t = useTranslations("About");
  return (
    <div className="flex flex-wrap items-center gap-3 mt-3">
      <a
        href={LINKEDIN_PERSO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("linkedinPersoLabel")}
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
        aria-label={t("linkedinStudioLabel")}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-light transition-colors"
      >
        <Linkedin className="w-3.5 h-3.5" />
        {t("linkedinStudio")}
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
  );
}

/**
 * Intro de /about : nom en titre, deux photos superposées (portrait devant,
 * scène de travail derrière), présentation et liens. Disposition et seuils :
 * .mh-about-* dans app/globals.css.
 */
export function AboutIntro() {
  const t = useTranslations("About");
  const intro = t.raw("intro") as string[];
  return (
    <section className="pt-8 pb-10 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mh-about-intro">
        <AnimateIn className="mh-about-head">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary-light mb-4">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
            Ahmed Omerovic
          </h1>
          <p className="text-text-secondary mt-2">{t("role")}</p>
        </AnimateIn>

        <div className="mh-about-duo-cell">
          <div className="mh-about-duo">
            <div className="mh-about-photo mh-about-back">
              <AboutPhoto photo={WORK} alt={t("photoWorkAlt")} priority />
            </div>
            <div className="mh-about-photo mh-about-front">
              <AboutPhoto photo={PORTRAIT} alt={t("photoPortraitAlt")} />
            </div>
          </div>
        </div>

        <AnimateIn delay={0.1} className="mh-about-body">
          <div className="space-y-4 text-text-secondary leading-relaxed">
            {intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </AnimateIn>

        <AnimateIn delay={0.2} className="mh-about-links">
          <SocialLinks />
        </AnimateIn>
      </div>
    </section>
  );
}
