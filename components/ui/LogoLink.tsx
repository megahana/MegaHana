"use client";

import { Link } from "@/i18n/navigation";
import { LogoFlower } from "@/components/ui/LogoFlower";
import { OPEN_PETAL_STATE } from "@/lib/logo-bloom";
import { cn } from "@/lib/utils";

/**
 * Logo cliquable du header (48px) et du footer (36px) — lien vers l'accueil.
 *
 * SVG vectoriel (LogoFlower, géométrie lib/logo-geometry.ts) plutôt que le
 * PNG app/icon.png : couleurs pleines --sakura/--gold, sans opacité, donc un
 * rendu identique quel que soit le fond (l'ancien PNG était rendu à des
 * opacités inverses dans le header et le footer — un logo s'éclaircissait au
 * survol pendant que l'autre s'assombrissait).
 *
 * Survol / focus clavier : "entrouverture discrète" (choisie au labo
 * interne, piste B) — CSS pur (.mh-logo-link dans app/globals.css), posé sur
 * les pétales ET leurs séparations via petalWrapperClassName. Aucun état
 * React ni écouteur : plusieurs instances ne coûtent rien au repos.
 *
 * Nom accessible : aria-label (le SVG est aria-hidden).
 *
 * "use client" obligatoire : Footer est un Server Component, et LogoFlower
 * (client) reçoit une fonction (state) — une fonction ne peut pas traverser
 * la frontière serveur → client (erreur React #441, page en 500).
 */
export function LogoLink({
  size,
  label = "Megahana",
  className,
}: {
  size: 48 | 36;
  label?: string;
  className?: string;
}) {
  return (
    <Link href="/" aria-label={label} className={cn("mh-logo-link", className)}>
      <LogoFlower
        size={size}
        state={() => OPEN_PETAL_STATE}
        petalWrapperClassName="mh-logo-link-petal"
      />
    </Link>
  );
}
