/**
 * Server Component — aucun hook, aucun event, rendu 100% statique (audit
 * "use client" de cette session : la directive n'a jamais été nécessaire ici,
 * juste bloquée tant que son seul appelant, Galerie.tsx, était lui-même
 * client. Débloqué depuis que Galerie.tsx est redevenu Server Component.
 *
 * Transposition de docs/prototypes/cadres-secteurs.html (secteur Restaurant,
 * T8.5) : chaque lettre dans son propre <span>, légère rotation alternée
 * (3 valeurs qui se répètent tous les 3 caractères) façon écriture à la main.
 * Mécanique CSS reprise à l'identique, portée avec le préfixe .mh-chalk-letter
 * — vérifié sans collision avec le reste du codebase avant écriture (seul
 * ".mh-frame-petal-shape--chalk" s'en approche dans Frame.tsx, nom distinct).
 *
 * Le conteneur englobant reçoit `className` (ex. "sector") : les propriétés
 * héritables (police, taille, couleur) du style ciblant cette classe
 * s'appliquent normalement aux lettres, sans qu'on ait besoin de les redéfinir
 * ici — ChalkText n'ajoute qu'un display + une rotation par lettre.
 *
 * Un espace normal entre deux <span> inline-block peut être ignoré au rendu
 * — remplacé ici par une espace insécable (constante NBSP) pour que les mots
 * restent visuellement séparés.
 *
 * Le CSS (.mh-chalk-letter) vit dans app/globals.css, pas dans un <style jsx>
 * local : styled-jsx importe "client-only" en interne et casserait le build
 * maintenant que ce composant est un Server Component (même raison que
 * Galerie.tsx). Contenu identique, juste déplacé.
 */

const NBSP = String.fromCharCode(160);

type ChalkTextProps = { text: string; className?: string };

export function ChalkText({ text, className }: ChalkTextProps) {
  return (
    <span className={className}>
      {[...text].map((char, i) => (
        <span className="mh-chalk-letter" key={i}>
          {char === " " ? NBSP : char}
        </span>
      ))}
    </span>
  );
}
