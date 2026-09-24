"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type FocusEvent } from "react";
import {
  REQUIRED_CONTACT_FIELDS,
  isContactFieldValid,
  isRequiredContactField,
  type RequiredContactField,
} from "@/lib/contact-validation";

/**
 * Progression des champs OBLIGATOIRES du formulaire de contact (non
 * contrôlé), affichée par les pétales derrière le bouton d'envoi
 * (ButtonPetals.tsx). Purement visuelle : la validation réelle reste celle de
 * la soumission (ContactForm.tsx), avec les mêmes règles.
 *
 * - Aucune `value` sur les champs : on écoute le <form> (écouteurs délégués,
 *   les événements des champs remontent) et on ne stocke QUE le résultat
 *   valide/invalide par champ, jamais les valeurs.
 * - Règles = celles de la validation réelle (lib/contact-validation.ts).
 * - "Reward early, punish late" : un champ compte dès qu'il devient valide,
 *   même en cours de frappe (onInput, ajout seulement) ; il ne cesse de
 *   compter que lorsque l'utilisateur le quitte invalide (onBlur, état exact).
 *   NB : le onChange de React se déclenche à chaque frappe (≈ input) — il
 *   n'est donc PAS utilisé pour retirer un champ.
 * - Montage : lecture réelle des champs (pré-remplissage, auto-remplissage du
 *   navigateur fait avant l'hydratation, sans événement).
 * - `syncAll()` à la soumission : état exact, quoi qu'il arrive.
 */

type ValidMap = Record<RequiredContactField, boolean>;

function readAll(form: HTMLFormElement): ValidMap {
  const data = new FormData(form);
  return Object.fromEntries(
    REQUIRED_CONTACT_FIELDS.map((f) => [f, isContactFieldValid(f, String(data.get(f) ?? ""))]),
  ) as ValidMap;
}

function fieldOf(target: EventTarget): { name: RequiredContactField; value: string } | null {
  if (!(
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ))
    return null;
  return isRequiredContactField(target.name) ? { name: target.name, value: target.value } : null;
}

export function useRequiredFieldsProgress(initial: ValidMap) {
  const formRef = useRef<HTMLFormElement>(null);
  const [valid, setValid] = useState<ValidMap>(initial);

  const syncAll = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const next = readAll(form);
    setValid((prev) => (REQUIRED_CONTACT_FIELDS.every((f) => prev[f] === next[f]) ? prev : next));
  }, []);

  useEffect(() => {
    // Lecture de l'état réel au montage (pré-remplissage / auto-remplissage).
    syncAll();
  }, [syncAll]);

  const onInput = useCallback((event: FormEvent<HTMLFormElement>) => {
    const field = fieldOf(event.target);
    if (!field || !isContactFieldValid(field.name, field.value)) return; // punish late
    setValid((prev) => (prev[field.name] ? prev : { ...prev, [field.name]: true })); // reward early
  }, []);

  const onBlur = useCallback((event: FocusEvent<HTMLFormElement>) => {
    const field = fieldOf(event.target);
    if (!field) return;
    const ok = isContactFieldValid(field.name, field.value);
    setValid((prev) => (prev[field.name] === ok ? prev : { ...prev, [field.name]: ok }));
  }, []);

  const count = REQUIRED_CONTACT_FIELDS.filter((f) => valid[f]).length;
  return { formRef, valid, count, total: REQUIRED_CONTACT_FIELDS.length, onInput, onBlur, syncAll };
}
