import { existsSync } from "node:fs"
import { defineConfig } from "@playwright/test"

// Keep local readiness checks and API requests off any workstation HTTP proxy.
process.env.NO_PROXY = [
  process.env.NO_PROXY,
  process.env.no_proxy,
  "localhost",
  "127.0.0.1",
  "::1",
]
  .filter(Boolean)
  .join(",")
process.env.no_proxy = process.env.NO_PROXY

const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined)

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3011",
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    trace: "retain-on-failure",
    launchOptions: { executablePath, args: ["--disable-dev-shm-usage"] },
  },
  webServer: {
    command: "pnpm preview",
    url: "http://127.0.0.1:3011",
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
