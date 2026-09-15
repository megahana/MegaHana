// ⚠️ eslint est volontairement figé à 9.39.5 dans package.json (pas de caret) —
// NE PAS "corriger" vers la 10.x en pensant à un oubli. eslint-config-next@16
// (donc Next 16) tire eslint-plugin-react@7.37.5 (dernière version publiée),
// qui casse sous ESLint 10 pour deux raisons distinctes et confirmées par les
// sources primaires (pas une hypothèse) :
//   1. jsx-eslint/eslint-plugin-react#4018 — le mainteneur du plugin confirme
//      lui-même qu'il n'est "explicitly not yet compatible with eslint 10"
//      (correctif proposé, pas mergé) : https://github.com/jsx-eslint/eslint-plugin-react/issues/4018
//   2. vercel/next.js#89764 — second blocage indépendant : le parseur Babel
//      embarqué par eslint-config-next appelle scopeManager.addGlobals() (~1174
//      globals) pour laquelle Babel 7 n'implémente pas l'API attendue par
//      ESLint 10 (il faudrait Babel 8, pas encore prêt) :
//      https://github.com/vercel/next.js/issues/89764
// Un contournement ciblé (forcer settings.react.version + @typescript-eslint/parser
// pour éviter le chemin getFilename()) ne suffirait pas : le second blocage sur
// les globals resterait. À revoir quand eslint-config-next publie une version
// dont les dépendances (eslint-plugin-react notamment) déclarent un support
// ESLint 10 réel — pas de date fixe, vérifier périodiquement ou à la sortie
// d'une nouvelle version d'eslint-config-next.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import tailwindcss from "eslint-plugin-tailwindcss";

// Chemin ABSOLU requis ici : eslint-plugin-tailwindcss résout la config Tailwind
// dans un worker thread séparé (synckit) dont le cwd ne correspond pas forcément
// à celui du process ESLint principal — un chemin relatif ("./tailwind.config.ts")
// échoue silencieusement ("Could not resolve tailwindcss") une fois résolu contre
// le mauvais cwd. Confirmé en lisant node_modules/tailwind-api-utils/dist/index.cjs
// (loadConfigV3 → path.dirname(configPathOrContent) sur la chaîne fournie) — même
// contrainte que sous l'ancien format .eslintrc.cjs, reconduite ici en Flat Config.
const tailwindConfigPath = `${import.meta.dirname}/tailwind.config.ts`;

export default defineConfig([
  ...nextVitals,

  {
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      tailwindcss,
    },

    settings: {
      tailwindcss: {
        callees: ["cn", "clsx"],
        config: tailwindConfigPath,
      },
    },

    rules: {
      "no-debugger": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",

      "tailwindcss/no-contradicting-classname": "warn",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/classnames-order": "off",
    },
  },

  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "Literal[value=/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\\b/]",
          message: "Couleur hexadécimale détectée : utiliser un token du thème.",
        },
        {
          selector: "Literal[value=/(rgb|rgba|hsl|hsla)\\(\\s*[0-9.]/]",
          message: "Couleur numérique détectée : utiliser un token du thème.",
        },
      ],
    },
  },

  globalIgnores([".next/", "out/", "coverage/", "next-env.d.ts"]),
]);
