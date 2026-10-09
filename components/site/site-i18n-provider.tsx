"use client"

import {
  useCallback,
  useEffect,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import { I18nProvider } from "@/lib/i18n-provider"
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n-core"
import rootMessages from "@/lib/site-root-messages.json"
import {
  PageMetadataContext,
  type PageMetadataSnapshot,
} from "./site-page-metadata"

export const localeStorageKey = "easyuseui-locale"
const localeEvent = "easyuseui:locale"
function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(localeStorageKey)
    return isLocale(stored) ? stored : defaultLocale
  } catch {
    return defaultLocale
  }
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === localeStorageKey || event.key === null) {
      memoryLocale = undefined
      listener()
    }
  }
  window.addEventListener("storage", storage)
  window.addEventListener(localeEvent, listener)
  return () => {
    window.removeEventListener("storage", storage)
    window.removeEventListener(localeEvent, listener)
  }
}
// The in-memory value also works when browser storage is unavailable.
let memoryLocale: Locale | undefined
function getSnapshot() {
  return memoryLocale ?? readLocale()
}
function subscribeLocale(listener: () => void) {
  return subscribe(listener)
}
export function SiteI18nProvider({ children }: { children: ReactNode }) {
  const [pageMetadata, setPageMetadata] = useState<PageMetadataSnapshot | null>(
    null,
  )
  const locale = useSyncExternalStore(
    subscribeLocale,
    getSnapshot,
    () => defaultLocale,
  )
  const pathname = usePathname().replace(/\/$/, "") || "/"
  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return
    memoryLocale = next
    try {
      localStorage.setItem(localeStorageKey, next)
    } catch {
      /* Memory preference remains usable. */
    }
    window.dispatchEvent(new Event(localeEvent))
    // Storage denial must not replace the in-memory preference.
    memoryLocale = next
  }, [])
  useEffect(() => {
    document.documentElement.lang = locale
    const resources = rootMessages[locale] as {
      titles: Record<string, string>
      descriptions: Record<string, string>
    }
    const current =
      pageMetadata?.pathname === pathname ? pageMetadata : undefined
    // Object pages keep server metadata until their matching snapshot arrives.
    if (
      !current &&
      !resources.titles[pathname] &&
      (pathname.startsWith("/docs/") ||
        pathname.startsWith("/blog/") ||
        pathname === "/examples/sales-crm")
    )
      return
    const localize = (value: PageMetadataSnapshot["title"]) =>
      typeof value === "string" ? value : (value[locale] ?? value["zh-CN"])
    const title = current ? localize(current.title) : resources.titles[pathname]
    const localizedTitle = title
      ? `${title} · EasyuseUI`
      : locale === "en"
        ? "EasyuseUI — Make usability the default"
        : "EasyuseUI — 让好用，成为默认"
    const localizedDescription = current
      ? localize(current.description)
      : (resources.descriptions[pathname] ?? resources.descriptions["/"])
    const syncMetadata = () => {
      if (document.title !== localizedTitle) document.title = localizedTitle
      // Streamed route metadata can coexist with the inherited description.
      // Synchronize each managed tag without removing React-owned nodes.
      for (const description of document.querySelectorAll<HTMLMetaElement>(
        'head meta[name="description"]',
      )) {
        if (description.content !== localizedDescription)
          description.content = localizedDescription
      }
    }
    // Route metadata may arrive after the locale effect during client navigation.
    const observer = new MutationObserver(syncMetadata)
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content"],
    })
    syncMetadata()
    return () => observer.disconnect()
  }, [locale, pathname, pageMetadata])
  return (
    <I18nProvider locale={locale} onLocaleChange={setLocale}>
      <PageMetadataContext.Provider value={setPageMetadata}>
        {children}
      </PageMetadataContext.Provider>
    </I18nProvider>
  )
}
