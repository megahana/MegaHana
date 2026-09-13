"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Sector } from "@/types";

/**
 * Transposition de docs/prototypes/cadres-secteurs.html (les 8 cadres
 * thématiques par secteur, T8). Frame ne gère QUE la décoration (fond par
 * secteur + pétale-signature + hover commun T8.10) — aucun texte en dur
 * (contrairement au prototype qui affichait le nom du secteur/la pastille
 * "Cadre secteur · T8.N") : tout contenu passe par `children`, rendu au-dessus
 * de la décoration (.mh-frame-content, z-index supérieur à tout le reste).
 *
 * Piège déjà rencontré sur Galerie.tsx : si les rendus par secteur étaient des
 * closures imbriquées dans Frame(), <style jsx> scoped n'étiquetterait pas
 * leurs éléments avec sa classe de scope. On part donc directement sur
 * <style jsx global> avec un préfixe dédié (.mh-frame-*) — vérifié sans
 * collision avec le reste du codebase avant d'écrire ce fichier.
 *
 * Exception non branchée sur le thème (comme le voile photo de Galerie.tsx) :
 * le fond ardoise du cadre Restaurant reste #1C1B18 en dur, volontairement —
 * ce n'est pas un choix de thème, c'est un décor fixe.
 */

export type FrameProps = {
  sector: Sector;
  children?: React.ReactNode;
  className?: string;
  /** Texte du repère éditorial coin haut-gauche, secteur "mode" uniquement (ignoré pour les 7 autres). */
  editorialTag?: string;
  /** false sur les cartes non cliquables (placeholders "en travail") : le
   *  tilt 3D au survol suggère une affordance de clic qui n'existe pas.
   *  Le box-shadow et l'éclaircissement du pétale au survol restent (CSS
   *  pur, micro-interactions décoratives, pas des affordances de clic). */
  interactive?: boolean;
};

const DEFAULT_EDITORIAL_TAG = "N° 08 — ÉDITION";

const VARIANT_CLASS: Record<Sector, string | null> = {
  "bien-etre": null,
  startup: "browser",
  architecte: "blueprint",
  musicien: "vinyl",
  mode: "editorial",
  artistes: "gallery",
  artisans: "wood",
  restaurant: "slate",
};

function renderDecoration(sector: Sector, editorialTag: string, petalSymbolId: string) {
  switch (sector) {
    case "bien-etre":
      // Le pétale LUI-MÊME est le blob organique : sa courbe (d) respire en
      // boucle, cf. @keyframes mh-frame-petal-breathe. Ne peut pas passer par
      // <use> (l'animation cible directement l'attribut `d` d'un <path>).
      return (
        <svg className="mh-frame-petal-blob" viewBox="0 0 120 170" aria-hidden="true">
          <path
            className="mh-frame-petal-shape"
            d="M 85,85 C 85,112.61 73.81,135 60,135 C 46.19,135 35,112.61 35,85 C 35,57.39 46.19,35 60,35 C 73.81,35 85,57.39 85,85 Z"
            transform="rotate(-8 60 85)"
          />
        </svg>
      );

    case "startup":
      return (
        <>
          <div className="mh-frame-browser-chrome">
            <div className="mh-frame-browser-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="mh-frame-browser-address" />
          </div>
          <svg className="mh-frame-petal-blob mh-frame-petal-blob--browser" viewBox="0 0 120 170" aria-hidden="true">
            <use href={`#${petalSymbolId}`} className="mh-frame-petal-shape mh-frame-petal-shape--or" />
          </svg>
        </>
      );

    case "architecte":
      return (
        <div className="mh-frame-cartouche">
          <svg className="mh-frame-petal-stamp" viewBox="0 0 120 170" aria-hidden="true">
            <use href={`#${petalSymbolId}`} className="mh-frame-petal-shape mh-frame-petal-shape--stamp" />
          </svg>
        </div>
      );

    case "musicien":
      return (
        <>
          <svg className="mh-frame-vinyl-disc" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="92" fill="rgb(var(--text) / 0.05)" />
            <circle cx="100" cy="100" r="82" fill="none" stroke="rgb(var(--text) / 0.12)" strokeWidth="0.6" />
            <circle cx="100" cy="100" r="68" fill="none" stroke="rgb(var(--text) / 0.12)" strokeWidth="0.6" />
            <circle cx="100" cy="100" r="54" fill="none" stroke="rgb(var(--text) / 0.12)" strokeWidth="0.6" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="rgb(var(--text) / 0.12)" strokeWidth="0.6" />
            <circle cx="100" cy="100" r="3" fill="rgb(var(--bg))" stroke="rgb(var(--text) / 0.25)" strokeWidth="1" />
          </svg>
          <div className="mh-frame-vinyl-label">
            <svg className="mh-frame-petal-stamp" viewBox="0 0 120 170" aria-hidden="true">
              <use href={`#${petalSymbolId}`} className="mh-frame-petal-shape mh-frame-petal-shape--label" />
            </svg>
          </div>
        </>
      );

    case "mode":
      // Décor éditorial fixe (chrome de magazine) — texte personnalisable via
      // la prop editorialTag, "N° 08 — ÉDITION" par défaut si non fournie.
      return (
        <>
          <div className="mh-frame-editorial-frame" />
          <span className="mh-frame-editorial-tag">{editorialTag}</span>
          <svg className="mh-frame-editorial-emblem" viewBox="0 0 120 170" aria-hidden="true">
            <use href={`#${petalSymbolId}`} className="mh-frame-petal-shape mh-frame-petal-shape--emblem" />
          </svg>
        </>
      );

    case "artistes":
      return (
        <>
          <div className="mh-frame-gallery-frame" />
          <div className="mh-frame-gallery-cartel">
            <svg className="mh-frame-petal-stamp" viewBox="0 0 120 170" aria-hidden="true">
              <use href={`#${petalSymbolId}`} className="mh-frame-petal-shape mh-frame-petal-shape--cartel" />
            </svg>
          </div>
        </>
      );

    case "artisans":
      return (
        <>
          <div className="mh-frame-wood-mark-halo" />
          <svg className="mh-frame-wood-mark" viewBox="0 0 120 170" aria-hidden="true">
            <use href={`#${petalSymbolId}`} className="mh-frame-petal-shape mh-frame-petal-shape--wood" />
          </svg>
        </>
      );

    case "restaurant":
      // Pétale en contour (stroke, pas fill) — même .mh-frame-petal-blob que
      // Bien-être, mais réutilisé via <use> (pas besoin d'animer son `d` ici).
      return (
        <svg className="mh-frame-petal-blob" viewBox="0 0 120 170" aria-hidden="true">
          <use href={`#${petalSymbolId}`} className="mh-frame-petal-shape mh-frame-petal-shape--chalk" />
        </svg>
      );
  }
}

export function Frame({
  sector,
  children,
  className,
  editorialTag = DEFAULT_EDITORIAL_TAG,
  interactive = true,
}: FrameProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Id unique par instance : PETAL_SYMBOL_ID était un id fixe partagé par
  // tous les <Frame>, invalide en HTML/SVG (id doit être unique document
  // entier) dès que plusieurs instances du même secteur coexistent (marquee
  // dupliqué, cf. Galerie.tsx COPY_COUNT) — <use href="#..."> résout alors
  // toujours vers le premier <symbol> du DOM, pas forcément celui du bon
  // <Frame>.
  const petalSymbolId = `mh-frame-petal-${useId()}`;
  const variant = VARIANT_CLASS[sector];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * 12;
    const rotateX = -y * 12;
    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (card) card.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      className={cn("mh-frame-card", variant && `mh-frame-card--${variant}`, className)}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
    >
      {/* Sprite caché : géométrie d'un seul pétale, identique au vrai logo
          (docs/megahana-v5-couleurs.html) — réutilisée via <use> par 7 des 8
          secteurs (Bien-être exclu : path animé dédié, cf. renderDecoration). */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id={petalSymbolId} viewBox="0 0 120 170">
          <ellipse cx="60" cy="85" rx="25" ry="50" transform="rotate(-8 60 85)" />
        </symbol>
      </svg>

      {renderDecoration(sector, editorialTag, petalSymbolId)}

      <div className="mh-frame-content">{children}</div>

      <style jsx global>{`
        .mh-frame-card {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3.2;
          overflow: hidden;
          border: 1px solid rgb(var(--text) / 0.14);
          border-radius: 8px;
          background: rgb(var(--bg));
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease-out, box-shadow 0.3s ease;
          will-change: transform;
        }
        .mh-frame-card:hover {
          box-shadow: 0 14px 30px rgb(var(--text) / 0.14);
        }

        .mh-frame-content {
          position: relative;
          z-index: 3;
        }

        /* ── Pétale — base (Bien-être) : le pétale respire, fill sakura,
           opacité 0.18. Réutilisé via .mh-frame-petal-shape--* pour les 7
           autres secteurs (fill/opacité propres, même mécanique). ── */
        .mh-frame-petal-blob {
          position: absolute;
          top: 50%;
          left: 50%;
          height: 74%;
          width: auto;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        }
        .mh-frame-petal-shape {
          fill: rgb(var(--sakura));
          opacity: 0.18;
          --petal-opacity: 0.18;
          transition: opacity 0.3s ease;
          animation: mh-frame-petal-breathe 5s ease-in-out infinite;
        }
        @keyframes mh-frame-petal-breathe {
          0%,
          100% {
            d: path("M 85,85 C 85,112.61 73.81,135 60,135 C 46.19,135 35,112.61 35,85 C 35,57.39 46.19,35 60,35 C 73.81,35 85,57.39 85,85 Z");
          }
          50% {
            d: path("M 88,83 C 88,114 72.5,132 61,132 C 49.5,132 33,112 33,88 C 33,64 42,32 58,32 C 74,32 88,52 88,83 Z");
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mh-frame-petal-shape {
            animation: none;
          }
        }
        /* Pétale plus visible au survol, commun aux 8 secteurs — règle CSS
           pure, active même sous prefers-reduced-motion (transition ponctuelle
           déclenchée par :hover/tactile, pas une animation continue). */
        .mh-frame-card:hover .mh-frame-petal-shape {
          opacity: min(1, calc(var(--petal-opacity) + 0.15));
        }

        /* ═══ Startup — fenêtre de navigateur minimaliste ═══ */
        .mh-frame-browser-chrome {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 15%;
          background: rgb(var(--text) / 0.03);
          border-bottom: 1px solid rgb(var(--text) / 0.1);
          display: flex;
          align-items: center;
          z-index: 2;
        }
        .mh-frame-browser-dots {
          display: flex;
          gap: 6px;
          margin-left: 14px;
        }
        .mh-frame-browser-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid rgb(var(--text) / 0.25);
          background: transparent;
        }
        .mh-frame-browser-address {
          width: 42%;
          height: 42%;
          border-radius: 999px;
          border: 1px solid rgb(var(--text) / 0.12);
          background: rgb(var(--surface) / 0.55);
          margin: 0 auto;
        }
        /* Pétale recentré dans les 85% sous .mh-frame-browser-chrome
           (15%→100%, centre à 57.5%) plutôt que sur la carte entière. */
        .mh-frame-petal-blob--browser {
          top: 57.5%;
          height: 64%;
        }
        .mh-frame-petal-shape--or {
          fill: rgb(var(--gold));
          opacity: 0.16;
          --petal-opacity: 0.16;
        }

        /* ═══ Architecte — grille technique + cartouche coin bas-droit ═══ */
        .mh-frame-card--blueprint {
          background-image: repeating-linear-gradient(0deg, rgb(var(--text) / 0.1) 0 1px, transparent 1px 96px),
            repeating-linear-gradient(90deg, rgb(var(--text) / 0.1) 0 1px, transparent 1px 96px),
            repeating-linear-gradient(0deg, rgb(var(--text) / 0.05) 0 1px, transparent 1px 24px),
            repeating-linear-gradient(90deg, rgb(var(--text) / 0.05) 0 1px, transparent 1px 24px);
        }
        .mh-frame-cartouche {
          position: absolute;
          right: 14px;
          bottom: 14px;
          z-index: 2;
          width: 88px;
          height: 60px;
          border: 1px solid rgb(var(--text) / 0.2);
          background: rgb(var(--bg) / 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mh-frame-cartouche .mh-frame-petal-stamp {
          height: 30px;
          width: auto;
        }
        .mh-frame-petal-shape--stamp {
          fill: rgb(var(--sakura));
          opacity: 0.4;
          --petal-opacity: 0.4;
        }

        /* ═══ Musicien — disque vinyle + étiquette centrale ═══ */
        .mh-frame-card--vinyl .mh-frame-vinyl-disc {
          position: absolute;
          top: 50%;
          left: 50%;
          height: 70%;
          width: auto;
          transform: translate(-50%, -50%);
          z-index: 1;
        }
        .mh-frame-vinyl-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgb(var(--bg));
          border: 1px solid rgb(var(--text) / 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mh-frame-vinyl-label .mh-frame-petal-stamp {
          height: 36px;
          width: auto;
        }
        .mh-frame-petal-shape--label {
          fill: rgb(var(--gold));
          opacity: 0.45;
          --petal-opacity: 0.45;
        }

        /* ═══ Mode — couverture de magazine ═══ */
        .mh-frame-editorial-frame {
          position: absolute;
          inset: 10px;
          border: 1px solid rgb(var(--text) / 0.15);
          pointer-events: none;
          z-index: 1;
        }
        .mh-frame-editorial-tag {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 2;
          font-family: var(--font-label), sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgb(var(--text-muted));
        }
        .mh-frame-editorial-emblem {
          position: absolute;
          top: 16px;
          right: 16px;
          height: 26px;
          width: auto;
          z-index: 2;
        }
        .mh-frame-petal-shape--emblem {
          fill: rgb(var(--sakura));
          opacity: 0.4;
          --petal-opacity: 0.4;
        }

        /* ═══ Artistes — cadre de tableau + cartel bas-centre ═══ */
        .mh-frame-gallery-frame {
          position: absolute;
          inset: 8px;
          border: 1px solid rgb(var(--text) / 0.18);
          pointer-events: none;
          z-index: 1;
        }
        .mh-frame-gallery-frame::after {
          content: "";
          position: absolute;
          inset: 5px;
          border: 1px solid rgb(var(--gold) / 0.35);
        }
        .mh-frame-gallery-cartel {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          padding: 8px 14px;
          border: 1px solid rgb(var(--text) / 0.15);
          background: rgb(var(--bg) / 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mh-frame-gallery-cartel .mh-frame-petal-stamp {
          height: 22px;
          width: auto;
        }
        .mh-frame-petal-shape--cartel {
          fill: rgb(var(--gold));
          opacity: 0.5;
          --petal-opacity: 0.5;
        }

        /* ═══ Artisans — texture bois + marque au fer bas-gauche ═══ */
        .mh-frame-card--wood {
          background-color: rgb(var(--bg));
          background-image: repeating-linear-gradient(90deg, rgb(var(--text) / 0.05) 0 1px, transparent 1px 140px),
            repeating-linear-gradient(0deg, rgb(var(--gold) / 0.1) 0 2px, transparent 2px 10px),
            repeating-linear-gradient(0deg, rgb(var(--border-strong) / 0.35) 0 3px, transparent 3px 7px);
        }
        .mh-frame-wood-mark-halo {
          position: absolute;
          bottom: 12px;
          left: 12px;
          z-index: 1;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: radial-gradient(circle, rgb(var(--text) / 0.08), transparent 70%);
        }
        .mh-frame-wood-mark {
          position: absolute;
          bottom: 14px;
          left: 20px;
          height: 26px;
          width: auto;
          z-index: 2;
        }
        .mh-frame-petal-shape--wood {
          fill: rgb(var(--sakura));
          opacity: 0.4;
          --petal-opacity: 0.4;
        }

        /* ═══ Restaurant — seul cadre à fond sombre, non réactif au thème
           (comme le voile photo de Galerie.tsx : c'est un décor fixe, pas un
           choix de thème). Pétale en contour (stroke), pas de remplissage. ═══ */
        .mh-frame-card--slate {
          background-color: #1c1b18;
          border-color: rgba(250, 247, 242, 0.15);
          background-image: radial-gradient(1px 1px at 20% 30%, rgba(250, 247, 242, 0.08), transparent),
            radial-gradient(1px 1px at 70% 65%, rgba(250, 247, 242, 0.06), transparent),
            radial-gradient(1.5px 1.5px at 45% 80%, rgba(250, 247, 242, 0.07), transparent),
            radial-gradient(1px 1px at 85% 20%, rgba(250, 247, 242, 0.05), transparent),
            radial-gradient(1px 1px at 10% 75%, rgba(250, 247, 242, 0.06), transparent);
        }
        .mh-frame-petal-shape--chalk {
          fill: none;
          stroke: rgb(var(--gold));
          stroke-width: 1.4;
          opacity: 0.55;
          --petal-opacity: 0.55;
        }
      `}</style>
    </div>
  );
}
