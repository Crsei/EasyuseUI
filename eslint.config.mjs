import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    ".local/**",
    "out/**",
    "public/r/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
])
