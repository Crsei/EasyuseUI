import compact from "./site-i18n-compact.json"

type SiteMessages = typeof import("./site-i18n-messages").siteMessages

// Both locales stay synchronous. Restore the shared protocol-key prefix from
// the generated representation; the public keys and caller text stay intact.
function decode(values: readonly unknown[]) {
  return Object.fromEntries(
    compact.keys.map((key, index) => [
      key.startsWith("!") ? key.slice(1) : compact.prefix + key,
      values[index],
    ]),
  )
}

export const siteMessages = {
  "zh-CN": decode(compact.values["zh-CN"]),
  en: decode(compact.values.en),
} as SiteMessages
