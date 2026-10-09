import compact from "./site-i18n-compact.json"

type SiteMessages = typeof import("./site-i18n-messages").siteMessages

// Both locales stay synchronous. Only repeated protocol keys are removed from
// the transferred representation; check:manifest verifies this generated data.
function decode(values: readonly unknown[]) {
  return Object.fromEntries(
    compact.keys.map((key, index) => [key, values[index]]),
  )
}

export const siteMessages = {
  "zh-CN": decode(compact.values["zh-CN"]),
  en: decode(compact.values.en),
} as SiteMessages
