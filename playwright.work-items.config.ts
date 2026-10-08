import { defineConfig } from "@playwright/test"
import base from "./playwright.config"
const port = Number(process.env.WORK_ITEMS_TEST_PORT || 33111)
export default defineConfig({
  ...base,
  use: { ...base.use, baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    ...base.webServer,
    command: "pnpm preview",
    env: { PORT: String(port) },
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
})
