"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { BloomingLogoFlower } from "@/components/ui/LogoFlower";
import { PetalDispersion } from "@/components/sections/contact/PetalDispersion";
import { ButtonPetals } from "@/components/sections/contact/ButtonPetals";
import { useRequiredFieldsProgress } from "@/components/sections/contact/useRequiredFieldsProgress";
import { cn } from "@/lib/utils";
import { CONTACT_FORM_EMAIL } from "@/lib/site";
import { BLOOM_EASE } from "@/lib/logo-bloom";
import { isContactFieldValid } from "@/lib/contact-validation";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// Sujets de la demande (affichés au visiteur) — distincts du "subject" Web3Forms
// (objet de l'email reçu par Megahana, construit à partir du choix ci-dessous).
const SUBJECT_OPTIONS = ["website", "package", "other"] as const;
export type SubjectOption = (typeof SUBJECT_OPTIONS)[number];

type Status = "idle" | "submitting" | "success" | "invalid" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

/* Progression (choisie au labo interne : « pétales derrière le bouton ») :
   pendant la saisie, 1 pétale sakura sort de sous le bouton d'envoi par champ
   obligatoire valide, autour de 2 pétales or fixes (ButtonPetals.tsx,
   décoratif). À l'envoi, les pétales rentrent sous le bouton ; échec :
   retour instantané.
   Animation d'envoi (choisie au labo interne : « éclosion + dispersion
   contenue »). Attente : le bouton affiche seulement « Envoi en cours… »
   (état loading : inactif, pleine opacité, aria-busy), sans icône.
   Confirmation : le formulaire s'efface (FORM_EXIT_MS), puis le bloc de succès
   entre (SUCCESS_ENTER_MS, léger glissé) avec une fleur qui éclot
   (lib/logo-bloom.ts, comme l'intro) et 5 pétales qui se dispersent derrière
   lui (PetalDispersion). L'annonce part à la confirmation ; le focus suit
   quand le bloc apparaît (≈FORM_EXIT_MS plus tard — décalage accepté).
   Mouvement réduit : pétales de progression instantanés (et laissés sortis
   pendant l'envoi), pas de dispersion, fleur ouverte, bascule instantanée.
   Chemin d'erreur : aucune animation. */
const FORM_EXIT_MS = 200;
const SUCCESS_ENTER_MS = 300;
const SUCCESS_ENTER_OFFSET_PX = 8;
const SUCCESS_FLOWER_SIZE_PX = 40;

interface ContactFormProps {
  /** Pré-sélection du sujet (ex. venant du configurateur /services). */
  initialSubjectOption?: SubjectOption;
  /** Texte initial du message (ex. récapitulatif du configurateur /services).
   *  Formulaire non contrôlé : valeur initiale uniquement (defaultValue),
   *  jamais resynchronisée après le premier rendu. */
  initialMessage?: string;
}

export function ContactForm({ initialSubjectOption, initialMessage }: ContactFormProps = {}) {
  const t = useTranslations("Contact.form");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const isSubmitting = status === "submitting";

  // Mouvement réduit : garde-fou "mounted" (même pattern que ThemeToggle.tsx) —
  // useReducedMotion() vaut null côté serveur mais sa vraie valeur dès le
  // premier rendu client ; avant montage, on suppose "pas de préférence".
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const reduceMotion = mounted && !!prefersReducedMotion;

  // Champs obligatoires valides (pétales de progression) : écouteurs
  // délégués sur le <form>, champs non contrôlés, mêmes règles que la
  // validation ci-dessous. État relu au montage (pré-remplissage depuis
  // /services, auto-remplissage du navigateur). Visuel uniquement.
  const {
    formRef,
    count: validFieldCount,
    onInput: onProgressInput,
    onBlur: onProgressBlur,
    syncAll: syncProgress,
  } = useRequiredFieldsProgress({
    name: false,
    email: false,
    message: isContactFieldValid("message", initialMessage ?? ""),
  });

  // Le bouton d'envoi (qui avait le focus) disparaît avec le formulaire au
  // succès : sans ça, le focus retombait en haut de page. On le pose sur le
  // titre du bloc de succès dès que celui-ci est monté (il n'arrive qu'après
  // le fondu du formulaire) : il devient le point de départ du Tab suivant.
  const focusSuccessHeading = useCallback((heading: HTMLHeadingElement | null) => {
    heading?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    // Pétales recalés sur l'état exact (un champ en cours de correction peut
    // encore compter tant qu'il n'a pas été quitté). N'influence pas la
    // validation, qui relit les champs elle-même.
    syncProgress();

    // Honeypot : un humain ne remplit jamais ce champ (caché, hors parcours
    // clavier). S'il est rempli, on abandonne silencieusement sans appeler
    // Web3Forms ni afficher d'erreur — ne pas révéler la détection au bot.
    if (data.get("botcheck")) {
      return;
    }

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subjectOption = String(data.get("subjectOption") ?? "") as SubjectOption | "";

    const nextErrors: FieldErrors = {};
    // Règles partagées (lib/contact-validation.ts) : toute future indication
    // de progression utilise exactement les mêmes.
    if (!isContactFieldValid("name", name)) nextErrors.name = t("errorName");
    if (!isContactFieldValid("email", email)) nextErrors.email = t("errorEmail");
    if (!isContactFieldValid("message", message)) nextErrors.message = t("errorMessage");

    if (Object.keys(nextErrors).length > 0) {
      // Erreurs de validation locales, pas un échec du service : pas de
      // bandeau d'erreur générale ni de repli email, seulement les messages
      // associés aux champs concernés (aria-describedby ci-dessous).
      setErrors(nextErrors);
      setStatus("invalid");
      return;
    }

    setErrors({});
    setStatus("submitting");

    // Objet de l'email reçu par Megahana — construit à partir du sujet choisi
    // (donnée structurelle, pas besoin de traduction propre : l'email arrive
    // dans la boîe de Megahana, pas affiché au visiteur).
    const subjectLabels: Record<SubjectOption, string> = {
      website: "Website project",
      package: "Package enquiry",
      other: "Partnership or other enquiry",
    };
    const emailSubject = subjectOption
      ? `Megahana contact — ${subjectLabels[subjectOption]}`
      : "Megahana contact";

    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name,
          email,
          message,
          // "subject" pilote uniquement la ligne d'objet de l'email chez
          // Web3Forms (n'apparaît pas dans le corps). "enquiry_type" duplique
          // le même choix comme ligne visible du corps du message, pour trier
          // sans dépendre de l'objet.
          subject: emailSubject,
          ...(subjectOption ? { enquiry_type: subjectLabels[subjectOption] } : {}),
        }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      // Échec réseau : le contenu saisi reste dans le formulaire (pas de
      // form.reset()), l'erreur générale + le repli email s'affichent.
      setStatus("error");
    }
  }

  return (
    <div>
      {/* Zone d'annonce du succès, TOUJOURS montée et vide jusqu'à la
          confirmation : les lecteurs d'écran (NVDA/JAWS notamment)
          n'annoncent de façon fiable que le texte qui arrive dans une zone
          live déjà présente — pas une zone insérée avec son texte déjà dedans
          (ce que faisait l'ancien bloc de succès role="status"). Même élément
          au même emplacement quel que soit l'état : React ne la recrée
          jamais. Visuellement masquée, et indépendante de l'animation du
          bloc visible ci-dessous (qui n'arrive qu'après le fondu du
          formulaire) : l'annonce n'est jamais retardée. */}
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "success" ? `${t("successTitle")}. ${t("successText")}` : ""}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: SUCCESS_ENTER_OFFSET_PX }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : SUCCESS_ENTER_MS / 1000, ease: BLOOM_EASE }}
          >
            {/* isolate : la dispersion (z-0) reste sous la carte (z-10) sans
                passer sous le reste de la page. */}
            <div className="relative isolate">
              {!reduceMotion && <PetalDispersion />}
              <div className="relative z-10 rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <BloomingLogoFlower
                    size={SUCCESS_FLOWER_SIZE_PX}
                    reducedMotion={reduceMotion}
                    className="shrink-0"
                  />
                  <div>
                    {/* Cible du focus après confirmation (non interactif : pas dans
              l'ordre de tabulation, contour de focus neutralisé pour ne rien
              changer visuellement). scroll-mt : quand le focus ramène le
              titre à l'écran (formulaire long remplacé par ce bloc court), il
              s'arrête sous le header fixe au lieu de passer dessous — même
              marge que la section #discuss de la page. */}
                    <h3
                      ref={focusSuccessHeading}
                      tabIndex={-1}
                      className="text-lg font-bold text-text-primary mb-2 focus:outline-none scroll-mt-20 md:scroll-mt-24"
                    >
                      {t("successTitle")}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">{t("successText")}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : FORM_EXIT_MS / 1000, ease: "easeOut" }}
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              onInput={onProgressInput}
              onBlur={onProgressBlur}
              noValidate
              className="space-y-5"
            >
              {/* Honeypot anti-spam : caché visuellement ET hors du parcours clavier
          (tabIndex={-1}, aria-hidden), en plus de la protection native
          Web3Forms (hCaptcha/reCAPTCHA v3 côté service). */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="botcheck">{t("honeypotLabel")}</label>
                <input type="text" id="botcheck" name="botcheck" tabIndex={-1} autoComplete="off" />
              </div>

              <p className="text-sm text-text-muted">{t("requiredNote")}</p>

              {status === "error" && (
                <div role="alert" className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm text-text-primary">{t("errorGeneral")}</p>
                  <a
                    href={`mailto:${CONTACT_FORM_EMAIL}`}
                    className="inline-block mt-2 text-sm font-medium text-primary-light hover:underline"
                  >
                    {CONTACT_FORM_EMAIL}
                  </a>
                </div>
              )}

              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  {t("nameLabel")}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  aria-invalid={!!errors.name || undefined}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={cn(
                    "w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    errors.name ? "border-primary" : "border-border",
                  )}
                />
                {errors.name && (
                  <p id="contact-name-error" className="mt-1.5 text-xs text-primary-light">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  {t("emailLabel")}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className={cn(
                    "w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    errors.email ? "border-primary" : "border-border",
                  )}
                />
                {errors.email && (
                  <p id="contact-email-error" className="mt-1.5 text-xs text-primary-light">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  {t("subjectLabel")}
                </label>
                <select
                  id="contact-subject"
                  name="subjectOption"
                  defaultValue={initialSubjectOption ?? ""}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <option value="">{t("subjectPlaceholder")}</option>
                  {SUBJECT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t(`subjectOptions.${option}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  {t("messageLabel")}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  defaultValue={initialMessage}
                  placeholder={t("messagePlaceholder")}
                  aria-invalid={!!errors.message || undefined}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={cn(
                    "w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 resize-y",
                    errors.message ? "border-primary" : "border-border",
                  )}
                />
                {errors.message && (
                  <p id="contact-message-error" className="mt-1.5 text-xs text-primary-light">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* isolate : les pétales (z-0) restent sous le bouton (z-10, fond
                  opaque) sans passer sous le reste de la page — seule la partie
                  qui dépasse est visible, jamais devant le libellé. Marges
                  haute et basse : les pétales ne touchent ni le champ message
                  ni la mention de confidentialité (« ! » : sinon le space-y du
                  formulaire impose ses propres marges). */}
              <div className="relative isolate !my-7 w-full sm:w-fit">
                <ButtonPetals
                  count={validFieldCount}
                  sending={isSubmitting}
                  reducedMotion={reduceMotion}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="relative z-10 w-full"
                >
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {t("privacyNote")}{" "}
                <Link href="/privacy" className="underline hover:text-text-secondary">
                  {t("privacyLink")}
                </Link>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
