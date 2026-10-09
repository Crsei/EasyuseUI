"use client"

import {
  useState,
  createElement,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { createTranslator, type MessageValues } from "@/lib/i18n-core"
import { useI18n } from "@/lib/i18n-provider"
import { siteMessages } from "@/lib/site-i18n-runtime"

export type SiteMessageKey = keyof (typeof siteMessages)["zh-CN"]
const sourceKeys = new Map<string, keyof (typeof siteMessages)["zh-CN"]>(
  Object.entries(siteMessages["zh-CN"]).map(([key, source]) => [
    source,
    key as SiteMessageKey,
  ]),
)

export function useSiteI18n() {
  const context = useI18n()
  const t = createTranslator(context.locale, siteMessages)
  /** Only known, site-owned presentation metadata. Never pass user documents or service content. */
  function text(source: string) {
    const key = sourceKeys.get(source.replace(/\s+/g, " ").trim())
    return key ? t(key) : source
  }
  function localize<T>(data: T): T {
    if (typeof data === "string") return text(data) as T
    if (Array.isArray(data)) return data.map(localize) as T
    if (data && typeof data === "object" && !("$$typeof" in data))
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, localize(value)]),
      ) as T
    return data
  }
  return { ...context, t, text, localize }
}

/** Small client boundary keeps filesystem reads and highlighted source on the server. */
export function SiteText({
  messageKey,
  values,
  text: source,
}: {
  messageKey?: SiteMessageKey
  values?: MessageValues
  text?: string
}) {
  const { t, text } = useSiteI18n()
  return messageKey ? t(messageKey, values) : text(source ?? "")
}

export function SiteElement({
  as,
  textProps,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as:
    | "section"
    | "nav"
    | "main"
    | "div"
    | "span"
    | "aside"
    | "a"
    | "button"
    | "label"
  textProps: Record<string, { key: SiteMessageKey; values?: MessageValues }>
  children?: ReactNode
}) {
  const { t } = useSiteI18n()
  return createElement(
    as,
    {
      ...props,
      ...Object.fromEntries(
        Object.entries(textProps).map(([name, value]) => [
          name,
          t(value.key, value.values),
        ]),
      ),
    },
    children,
  )
}

export function useSiteFeedback(initial = "") {
  const [value, setValue] = useState<
    string | { key: SiteMessageKey; values?: MessageValues }
  >(initial)
  const { t } = useSiteI18n()
  return [
    typeof value === "string" ? value : t(value.key, value.values),
    setValue,
  ] as const
}
export function siteMessage(key: SiteMessageKey, values?: MessageValues) {
  return { key, values }
}
