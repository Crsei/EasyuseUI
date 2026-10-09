import compact from "./site-i18n-compact.json"
import { componentMessages } from "./i18n-messages"

type SiteMessages = typeof import("./site-i18n-messages").siteMessages

// Both locales stay synchronous. Restore the shared protocol-key prefix from
// the generated representation; the public keys and caller text stay intact.
function decode(locale: "zh-CN" | "en") {
  const shared = compact.shared as Record<
    string,
    keyof (typeof componentMessages)["zh-CN"]
  >
  return Object.fromEntries(
    compact.keys.map((key, index) => [
      key.startsWith("!") ? key.slice(1) : compact.prefix + key,
      compact.values[locale][index] ?? componentMessages[locale][shared[index]],
    ]),
  )
}

export const siteMessages = {
  "zh-CN": decode("zh-CN"),
  en: decode("en"),
} as SiteMessages
