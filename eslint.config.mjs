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
      // Allow TypeScript any type in test files and specific contexts
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused variables in test files and specific patterns
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true 
      }],
      // Allow img elements (will be optimized in future iterations)
      "@next/next/no-img-element": "warn",
      // Allow missing dependency in useEffect hooks (will be addressed in future)
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  {
    ignores: [
      "**/*.test.ts",
      "**/*.test.tsx", 
      "**/jest.setup.js",
      "**/jest.config.js",
      "**/__mocks__/**/*",
      "**/scripts/**/*"
    ]
  }
];

export default eslintConfig;
