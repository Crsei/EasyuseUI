"use client"
import { useEffect, useSyncExternalStore, type ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { I18nProvider } from "@easyuse-ui/ui/lib/i18n-provider"
import {
  defaultLocale,
  isLocale,
  type Locale,
} from "@easyuse-ui/ui/lib/i18n-core"
const key = "easyuseui-locale"
const localeEvent = "agent-workspace:locale"
let memoryLocale: Locale | undefined
function readLocale() {
  if (memoryLocale) return memoryLocale
  try {
    const stored = localStorage.getItem(key)
    return isLocale(stored) ? stored : defaultLocale
  } catch {
    return defaultLocale
  }
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
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
function setLocale(locale: Locale) {
  memoryLocale = locale
  try {
    localStorage.setItem(key, locale)
  } catch {}
  window.dispatchEvent(new Event(localeEvent))
}
export function AppProviders({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    readLocale,
    () => defaultLocale,
  )
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return (
    <I18nProvider locale={locale} onLocaleChange={setLocale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </I18nProvider>
  )
}
