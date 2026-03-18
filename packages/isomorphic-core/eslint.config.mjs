import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  js.configs.recommended,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        JSX: "readonly",
        google: "readonly",
        WindowEventMap: "readonly",
        DocumentEventMap: "readonly",
        HTMLElementEventMap: "readonly",
        MediaQueryListEventMap: "readonly",
        AddEventListenerOptions: "readonly",
        RowData: "readonly",
        Row: "readonly",
        TableMeta: "readonly",
        ColumnMeta: "readonly",
        TData: "readonly",
        TValue: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      "@next/next": nextPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "off",
      "import/no-anonymous-default-export": "warn",
      "jsx-a11y/alt-text": [
        "warn",
        { elements: ["img"], img: ["Image"] },
      ],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      ...Object.fromEntries(
        Object.entries(nextPlugin.configs.recommended.rules).map(([key, value]) => [
          key,
          key === "@next/next/no-html-link-for-pages" || key === "@next/next/no-sync-scripts"
            ? "error"
            : value,
        ])
      ),
      "no-duplicate-imports": "warn",
      "react/no-unknown-property": "error",
      "no-unused-vars": [
        "error",
        {
          "args": "none",
          "varsIgnorePattern": "^(_|[A-Z][a-zA-Z0-9_]*)$",
          "caughtErrors": "none",
        },
      ],
      "no-redeclare": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.d.ts", "**/config/enums.ts"],
    rules: {
      "no-unused-vars": "off",
    },
  },
];

export default config;
