import { existsSync } from "node:fs"
for (const file of [
  ".env.production.local",
  ".env.local",
  ".env.production",
  ".env",
]) {
  if (existsSync(file)) process.loadEnvFile(file)
}
const configured = process.env.NEXT_PUBLIC_SITE_URL
if (!configured)
  throw new Error(
    "Set NEXT_PUBLIC_SITE_URL explicitly before a production build. See .env.example. Local tests may set EASYUSEUI_LOCAL_BUILD=1 with their isolated origin.",
  )
const origin = new URL(configured)
if (
  !["https:", "http:"].includes(origin.protocol) ||
  origin.username ||
  origin.password ||
  origin.search ||
  origin.hash
)
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be a credential-free HTTP(S) site URL",
  )
if (
  ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname) &&
  process.env.EASYUSEUI_LOCAL_BUILD !== "1"
)
  throw new Error(
    "Public builds must not publish a localhost Registry. Use the deployed site URL, or explicitly enable EASYUSEUI_LOCAL_BUILD=1 for local validation.",
  )
console.log("Site URL configuration checked")
