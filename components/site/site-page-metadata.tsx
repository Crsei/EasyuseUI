"use client"

import { createContext, useContext, useEffect } from "react"
import { usePathname } from "next/navigation"

export type PageMetadataSnapshot = {
  pathname: string
  title: string | { "zh-CN": string; en?: string }
  description: string | { "zh-CN": string; en?: string }
}
export const PageMetadataContext = createContext<
  (snapshot: PageMetadataSnapshot) => void
>(() => {})

/** A route sends only its own bilingual metadata; no whole-site page index. */
export function SitePageMetadata({
  title,
  description,
  pathname,
}: PageMetadataSnapshot) {
  const activePathname = usePathname().replace(/\/$/, "") || "/"
  const publish = useContext(PageMetadataContext)
  useEffect(() => {
    if (activePathname === pathname) publish({ pathname, title, description })
  }, [publish, activePathname, pathname, title, description])
  return null
}
