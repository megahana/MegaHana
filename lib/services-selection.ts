import { tierIds, type OrderRoute, type TierId } from "@/lib/services-offers";

/**
 * Sélection du configurateur /services (formule, mise en ligne, parcours),
 * conservée dans l'onglet (QA-003) : elle survit à un changement de langue,
 * à un retour arrière du navigateur ou à un rechargement — même principe et
 * même portée que le brouillon de contact (lib/contact-draft.ts, clé
 * distincte, jamais dans l'URL). Sans sélection dans la session, rien n'est
 * restauré (aucune formule cochée, comme avant). Échecs du stockage
 * (navigation privée stricte, quota) ignorés en silence.
 */

const STORAGE_KEY = "megahana:services-selection";

export interface ServicesSelection {
  tier: TierId | null;
  launch: boolean;
  route: OrderRoute;
}

export function readServicesSelection(): ServicesSelection | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Record<string, unknown>;
    if (!d || typeof d !== "object") return null;
    return {
      tier:
        typeof d.tier === "string" && (tierIds as readonly string[]).includes(d.tier)
          ? (d.tier as TierId)
          : null,
      launch: d.launch === true,
      route: d.route === "upwork" ? "upwork" : "direct",
    };
  } catch {
    return null;
  }
}

export function writeServicesSelection(selection: ServicesSelection) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    /* stockage indisponible : sélection non conservée, sans conséquence */
  }
}
