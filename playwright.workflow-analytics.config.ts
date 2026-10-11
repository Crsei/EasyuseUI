import { defineConfig } from "@playwright/test"
import { existsSync } from "node:fs"
const port = Number(process.env.WORKFLOW_ANALYTICS_PORT ?? 3014)
process.env.NO_PROXY = [process.env.NO_PROXY, "localhost", "127.0.0.1"]
  .filter(Boolean)
  .join(",")
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/workflow-analytics*.spec.ts",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 60000,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    // 2560x1440 desktop at 150% scaling; allow 60 CSS px for browser chrome.
    viewport: { width: 1707, height: 900 },
    contextOptions: { screen: { width: 1707, height: 960 } },
    deviceScaleFactor: 1.5,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: existsSync("/usr/bin/google-chrome")
        ? "/usr/bin/google-chrome"
        : undefined,
      args: ["--disable-dev-shm-usage"],
    },
  },
  webServer: process.env.WORKFLOW_ANALYTICS_EXTERNAL
    ? undefined
    : {
        command: `PORT=${port} pnpm preview`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: false,
        timeout: 30000,
      },
})
