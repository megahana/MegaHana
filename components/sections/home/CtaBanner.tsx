import { ArrowRight, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Button } from "@/components/ui/Button";

interface CtaBannerProps {
  /** Destination du bouton — par défaut /services (usage générique Home/About/Portfolio). */
  href?: string;
  /** Libellé du bouton — par défaut la traduction générique "Home.cta.button".
   *  À surcharger quand la bannière est utilisée sur la page vers laquelle elle
   *  pointerait par défaut (ex. /services), où "View services" n'a pas de sens. */
  buttonLabel?: string;
}

export function CtaBanner({ href = "/services", buttonLabel }: CtaBannerProps = {}) {
  const t = useTranslations("Home.cta");

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AnimateIn>
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-sakura/10" />
          <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-primary/15 blur-3xl" />

          <div className="relative px-6 sm:px-8 md:px-16 py-12 sm:py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-5 sm:mb-6">
              <Zap className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-primary-light font-medium">{t("badge")}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-text-primary mb-4">
              {t("titleLead")} <span className="gradient-text">{t("titleHighlight")}</span>
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto mb-8">
              {t("subtitle")}
            </p>

            <div className="flex justify-center">
              <Button href={href} size="lg">
                {buttonLabel ?? t("button")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
