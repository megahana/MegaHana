/**
 * Règles de validation des champs obligatoires du formulaire de contact —
 * source unique, utilisée par la validation réelle à la soumission
 * (components/sections/contact/ContactForm.tsx) ET par tout indicateur de
 * progression : les deux ne peuvent jamais diverger.
 *
 * Le sujet est facultatif : il n'a pas de règle ici.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REQUIRED_CONTACT_FIELDS = ["name", "email", "message"] as const;
export type RequiredContactField = (typeof REQUIRED_CONTACT_FIELDS)[number];

export function isRequiredContactField(name: string): name is RequiredContactField {
  return (REQUIRED_CONTACT_FIELDS as readonly string[]).includes(name);
}

/** Valeur (brute, telle que saisie) valide pour ce champ obligatoire ? */
export function isContactFieldValid(field: RequiredContactField, rawValue: string): boolean {
  const value = rawValue.trim();
  switch (field) {
    case "name":
    case "message":
      return value.length > 0;
    case "email":
      return EMAIL_PATTERN.test(value);
  }
}
