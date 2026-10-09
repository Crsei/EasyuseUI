"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import { useI18n } from "@/lib/i18n-provider"
import messages from "@/lib/site-root-labels.json"

export function SiteRootText({
  messageKey,
}: {
  messageKey: keyof (typeof messages)["zh-CN"]
}) {
  const { locale } = useI18n()
  return messages[locale][messageKey]
}

// Keep the 404's Link inside this small client entry. A server-owned Link's
// shared client reference can otherwise pull in the examples page dictionary.
export function SiteRootLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} prefetch={false} />
}
