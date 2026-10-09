const configured = process.env.NEXT_PUBLIC_SITE_URL
if (process.env.NODE_ENV === "production" && !configured)
  throw new Error("NEXT_PUBLIC_SITE_URL is required for production builds")
export const siteUrl = (configured || "http://localhost:3010").replace(
  /\/$/,
  "",
)
export const registryUrl = `${siteUrl}/r`
