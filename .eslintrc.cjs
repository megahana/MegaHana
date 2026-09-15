const path = require("path");

// Chemin ABSOLU requis ici : eslint-plugin-tailwindcss résout la config Tailwind
// dans un worker thread séparé (synckit) dont le cwd ne correspond pas forcément
// à celui du process ESLint principal — un chemin relatif ("./tailwind.config.ts",
// pourtant l'exemple donné par claude/NORMES-CODE-MEGAHANA.md §5) échoue
// silencieusement ("Could not resolve tailwindcss") une fois résolu contre le
// mauvais cwd. Confirmé en lisant node_modules/tailwind-api-utils/dist/index.cjs
// (loadConfigV3 → path.dirname(configPathOrContent) sur la chaîne fournie).
module.exports = {
  root: true,
  extends: "next/core-web-vitals",
  plugins: ["@typescript-eslint", "tailwindcss"],
  ignorePatterns: [".next/", "out/", "coverage/", "next-env.d.ts"],

  settings: {
    tailwindcss: {
      callees: ["cn", "clsx"],
      config: path.resolve(__dirname, "tailwind.config.ts"),
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

  overrides: [
    {
      files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": [
          "warn",
          {
            selector: "Literal[value=/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\\b/]",
            message: "Couleur hexadécimale détectée : utiliser un token du thème.",
          },
          {
            selector: "Literal[value=/(rgb|rgba|hsl|hsla)\\(\\s*[0-9.]/]",
            message: "Couleur numérique détectée : utiliser un token du thème.",
          },
        ],
      },
    },
  ],
};
