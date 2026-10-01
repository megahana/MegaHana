import { tierIds, type TierId } from "@/lib/services-offers";

/**
 * Brouillon de demande de contact, partagé entre /services (sélection du
 * parcours direct) et /contact (formulaire), et conservé quand le visiteur
 * change de langue.
 *
 * sessionStorage, onglet courant uniquement (effacé à sa fermeture) et
 * JAMAIS dans l'URL : ni la sélection commerciale ni les coordonnées ou le
 * message ne passent en paramètres (historique, en-tête Referer, journaux
 * serveur). Effacé à l'envoi réussi du formulaire. Si le stockage est
 * indisponible (navigation privée stricte, quota), tout échoue en silence :
 * le formulaire reste simplement vide.
 *
 * `prefill` garde le texte pré-rempli tel qu'il a été inséré (dans la langue
 * de l'époque) : à l'arrivée dans l'autre langue, il est remplacé par sa
 * traduction si le message commence toujours par lui — ce que le visiteur a
 * écrit à la suite est conservé tel quel. S'il a retouché le texte
 * pré-rempli lui-même, le message est restitué sans modification.
 */

const STORAGE_KEY = "megahana:contact-draft";

export interface ContactDraft {
  /** Formule choisie sur /services (parcours direct). */
  tier?: TierId;
  /** Option mise en ligne cochée sur /services. */
  launch?: boolean;
  /** Sujet choisi dans le formulaire. */
  subjectOption?: string;
  /** Message en cours (pré-remplissage compris). */
  message?: string;
  /** Texte pré-rempli inséré dans `message`, dans la langue où il l'a été. */
  prefill?: string;
  name?: string;
  email?: string;
}

function isTier(value: unknown): value is TierId {
  return typeof value === "string" && (tierIds as readonly string[]).includes(value);
}

export function readContactDraft(): ContactDraft | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : undefined);
    return {
      tier: isTier(d.tier) ? d.tier : undefined,
      launch: d.launch === true,
      subjectOption: str(d.subjectOption),
      message: str(d.message),
      prefill: str(d.prefill),
      name: str(d.name),
      email: str(d.email),
    };
  } catch {
    return null;
  }
}

/** Fusionne `patch` dans le brouillon existant. */
export function writeContactDraft(patch: ContactDraft) {
  try {
    const next = { ...readContactDraft(), ...patch };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible : brouillon non conservé, sans conséquence */
  }
}

/**
 * Nouvelle demande de devis depuis /services : remplace la sélection et
 * repart d'un message vierge (il sera pré-rempli à l'arrivée sur /contact),
 * en gardant les coordonnées éventuellement déjà saisies dans l'onglet.
 */
export function startQuoteDraft(tier: TierId, launch: boolean) {
  const previous = readContactDraft();
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tier, launch, name: previous?.name, email: previous?.email }),
    );
  } catch {
    /* stockage indisponible : le formulaire s'ouvrira sans pré-remplissage */
  }
}

export function clearContactDraft() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* rien à effacer */
  }
}
