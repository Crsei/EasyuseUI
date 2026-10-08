export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010"
).replace(/\/$/, "")
export const registryUrl = `${siteUrl}/r`
