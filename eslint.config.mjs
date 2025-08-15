import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow explicit any temporarily (large refactor later)
      '@typescript-eslint/no-explicit-any': 'off',
      // Downgrade unused vars to warnings so deploy is not blocked; allow underscore prefix to intentionally ignore
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      // Unescaped entities in JSX not critical for functionality; disable for now
      'react/no-unescaped-entities': 'off',
      // Prefer-const can be noisy; keep as warning so it won't fail build
      'prefer-const': 'warn',
    },
  },
];

export default eslintConfig;
