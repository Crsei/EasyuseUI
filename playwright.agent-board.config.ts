import config from "./playwright.config"
import { defineConfig } from "@playwright/test"
export default defineConfig({
  ...config,
  use: { ...config.use, baseURL: "http://127.0.0.1:3027" },
  webServer: {
    command: "PORT=3027 node scripts/preview.mjs",
    url: "http://127.0.0.1:3027",
    reuseExistingServer: false,
    timeout: 30000,
  },
})
