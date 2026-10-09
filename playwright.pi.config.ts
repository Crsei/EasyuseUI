import { defineConfig } from "@playwright/test"
import base from "./playwright.config"
export default defineConfig({
  ...base,
  testMatch: /pi-workspace(?:-real)?\.spec\.ts/,
  workers: 1,
  fullyParallel: false,
  outputDir:
    process.env.PI_REAL_PROVIDER === "1"
      ? ".local/pi-real-browser-tests"
      : ".local/pi-controlled-browser-tests",
  use: {
    ...base.use,
    baseURL: process.env.PI_BROWSER_BASE_URL ?? "http://127.0.0.1:3011",
  },
  webServer: process.env.PI_BROWSER_BASE_URL ? undefined : base.webServer,
})
