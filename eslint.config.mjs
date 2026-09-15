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
