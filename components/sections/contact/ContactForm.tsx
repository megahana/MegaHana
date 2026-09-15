"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CONTACT_FORM_EMAIL } from "@/lib/site";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// Sujets de la demande (affichés au visiteur) — distincts du "subject" Web3Forms
// (objet de l'email reçu par Megahana, construit à partir du choix ci-dessous).
const SUBJECT_OPTIONS = ["website", "package", "other"] as const;
type SubjectOption = (typeof SUBJECT_OPTIONS)[number];

type Status = "idle" | "submitting" | "success" | "invalid" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const t = useTranslations("Contact.form");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  const isSubmitting = status === "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

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
    if (!name) nextErrors.name = t("errorName");
    if (!email || !EMAIL_PATTERN.test(email)) nextErrors.email = t("errorEmail");
    if (!message) nextErrors.message = t("errorMessage");

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
          subject: emailSubject,
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

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-text-primary mb-2">{t("successTitle")}</h3>
        <p className="text-text-secondary leading-relaxed">{t("successText")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot anti-spam : caché visuellement ET hors du parcours clavier
          (tabIndex={-1}, aria-hidden), en plus de la protection native
          Web3Forms (hCaptcha/reCAPTCHA v3 côté service). */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="botcheck">Ne pas remplir</label>
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
          defaultValue=""
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-xs text-text-muted leading-relaxed">
        {t("privacyNote")}{" "}
        <Link href="/privacy" className="underline hover:text-text-secondary">
          {t("privacyLink")}
        </Link>
      </p>
    </form>
  );
}
