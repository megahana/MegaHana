/**
 * Saison du fond du hero de l'accueil (components/sections/home/HeroSilhouette.tsx) :
 * le remplissage « automne » (arches or) remplace « degrade » pendant
 * l'automne météorologique, du 1er septembre au 30 novembre inclus ; le
 * reste de l'année, rien ne change. Calendrier France : la date est lue dans
 * le fuseau Europe/Paris, quel que soit le fuseau du serveur (UTC sur
 * l'hébergeur) ou du visiteur — décision assumée, pas de tri par hémisphère.
 *
 * À appeler CÔTÉ SERVEUR uniquement (app/[locale]/page.tsx), puis passer le
 * résultat en prop : le client ne recalcule jamais la date, le rendu HTML et
 * l'hydratation portent donc toujours la même saison (aucun flash).
 */

const SEASON_TIME_ZONE = "Europe/Paris";
/** Mois (1–12) de l'automne météorologique. */
const AUTUMN_MONTHS: readonly number[] = [9, 10, 11];

export function isHeroAutumn(date: Date = new Date()): boolean {
  const month = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: SEASON_TIME_ZONE, month: "numeric" }).format(date),
  );
  return AUTUMN_MONTHS.includes(month);
}
