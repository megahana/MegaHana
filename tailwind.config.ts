import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — pilotés par variables CSS (light/dark). Voir globals.css.
        // Canaux RGB → les modificateurs d'opacité Tailwind (bg-primary/10…) fonctionnent.
        background: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-light": "rgb(var(--border-strong) / <alpha-value>)",
        // Terracotta — seule couleur "cliquable" (boutons, liens, CTA).
        primary: "rgb(var(--accent) / <alpha-value>)",
        "primary-dark": "rgb(var(--accent-strong) / <alpha-value>)",
        "primary-light": "rgb(var(--accent-light) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-accessible": "rgb(var(--accent-accessible) / <alpha-value>)",
        "accent-contrast": "rgb(var(--accent-contrast) / <alpha-value>)",
        // Accents de marque décoratifs — jamais en fond plein sur de grandes surfaces.
        sakura: "rgb(var(--sakura) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        // Alias locaux (pas des tokens de marque) : distinguent "problème"/"résultat"
        // dans l'étude de cas MegaReco sans introduire de teinte rouge/verte globale
        // type erreur/succès. Valeur réelle définie par .mh-case-study (voir globals.css),
        // scopée à ce composant à fond toujours sombre.
        "case-problem": "rgb(var(--case-problem) / <alpha-value>)",
        "case-result": "rgb(var(--case-result) / <alpha-value>)",
        "text-primary": "rgb(var(--text) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-2) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "serif"],
        label: ["var(--font-label)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 100%)",
        // Variante accessible du dégradé CTA — les deux arrêts passent AA sur
        // ivoire (accent-accessible ≈4.8:1, accent-strong ≈5.6:1), contrairement
        // à gradient-primary (accent-light seul ≈2.6:1). Réservé à Button.tsx.
        "gradient-accessible":
          "linear-gradient(135deg, rgb(var(--accent-accessible)) 0%, rgb(var(--accent-strong)) 100%)",
        "gradient-hero":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgb(var(--accent) / 0.16) 0%, transparent 70%)",
        "gradient-card":
          "linear-gradient(135deg, rgb(var(--accent) / 0.06) 0%, rgb(var(--border-strong) / 0.05) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
