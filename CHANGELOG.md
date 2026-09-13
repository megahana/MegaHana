# Changelog

Toutes les versions notables du site MegaMind Studio sont documentées ici.

La version suit le schéma `MAJEUR.MINEUR.CORRECTIF` :

- **CORRECTIF** (`1.0.1`) — correction mineure : bug fix, texte, SEO, metadata, petite retouche.
- **MINEUR** (`1.1.0`) — ajout visible : nouvelle section ou fonctionnalité importante.
- **MAJEUR** (`2.0.0`) — refonte majeure : architecture ou design.

La version n'est mise à jour qu'à chaque **release / livraison**, pas à chaque commit.
La source de vérité est [`lib/site-version.ts`](lib/site-version.ts).

## 1.1.0 — 2026-07-22

- Migration Fiverr → Upwork (formules, CGV, mentions légales, confidentialité, home).
- Refonte graphique : nouvelle palette (dark premium + accent terracotta), design system en variables CSS.
- Ajout du dark/light mode (toggle header, persistance localStorage, anti-flash) + polices Space Grotesk / Inter.
- Fond animé « fils de lumière » global, visible pendant le scroll (respecte prefers-reduced-motion).
- Page Services alignée sur les tiers Upwork : comparatif fidèle (délai / révisions / pages), section add-ons, FAQ mise à jour, logique de langues (1 / 1 / jusqu'à 2).
- Logo servi en local (`icon.png`) : dépendance Cloudinary retirée.

## 1.0.0 — 2026-06-21

- Première version publique du site MegaMind Studio (Next.js + Tailwind, bilingue FR/EN).
- Ajout des pages principales : Accueil, Services, Portfolio, À propos, Contact.
- Ajout des services et formules (packs Fiverr Starter / Professional / Premium).
- Ajout de l'option de gestion technique mensuelle.
- Ajout des pages légales : mentions légales, politique de confidentialité, conditions de vente.
- Ajout du SEO de base (metadata, sitemap, hreflang, `metadataBase`).
- Ajout du workflow CI GitHub Actions (lint, typecheck, build).
- Ajout de Dependabot.
- Ajout du versioning du site et de ce changelog.
