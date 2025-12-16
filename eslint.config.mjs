import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    ignores: ["**/*.test.js", "src/Applications/security/**", "src/Domains/**"],
    languageOptions: { globals: globals.node },
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    rules: {
      "no-console": "warn",
    },
  },
]);
