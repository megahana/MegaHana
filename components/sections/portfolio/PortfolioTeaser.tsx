import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Deux cartes d'aperçu en haut du portfolio ("Étude de cas" / "Sites
 * vitrines"), chacune un lien d'ancrage vers sa section plus bas sur la
 * page. Server Component : ancres HTML pures (href="#..."), pas besoin de
 * JS — le défilement doux est géré par le CSS global (html { scroll-behavior
 * : smooth }) et le scroll-margin-top posé sur les sections cibles.
 *
 * Traitement visuel repris de CtaBanner.tsx (dégradé primary/background/
 * sakura, bordure teintée, halo flou) — demandé par Ahmed le 14/09 (soir)
 * pour que ces 2 cartes soient visuellement alignées avec le CTA de fin de
 * page plutôt que neutres. La flèche anime un léger rebond continu (invite
 * à scroller, la page n'affiche plus que le titre + ces 2 cartes au premier
 * écran, voir PortfolioPage) — coupé en `prefers-reduced-motion`.
 */
export function PortfolioTeaser({
  showcaseCount,
  sectorCount,
}: {
  showcaseCount: number;
  sectorCount: number;
}) {
  const t = useTranslations("Portfolio.teaser");

  return (
    <nav aria-label={t("ariaLabel")} className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <TeaserCard
        href="#case-study"
        title={t("caseStudy.title")}
        description={t("caseStudy.description")}
      />
      <TeaserCard
        href="#showcase"
        title={t("showcase.title")}
        description={t("showcase.description", { count: showcaseCount, sectorCount })}
      />
    </nav>
  );
}

function TeaserCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group relative flex items-center justify-between gap-4 rounded-2xl overflow-hidden p-5 sm:p-6 text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-sakura/10 transition-colors group-hover:from-primary/28" />
      <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-16 bg-primary/15 blur-3xl" />

      <div className="relative">
        <p className="font-bold text-lg">{title}</p>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
      <ArrowDown className="relative w-5 h-5 text-primary shrink-0 animate-bounce transition-transform group-hover:translate-y-1 motion-reduce:animate-none motion-reduce:transition-none" />
    </a>
  );
}
