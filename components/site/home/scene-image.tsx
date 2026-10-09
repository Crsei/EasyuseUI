"use client"
import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { useSiteI18n } from "../site-i18n"
import type { SiteExample } from "@/lib/example-manifest"
import styles from "../site.module.css"
// Match the static light image during hydration, then apply the resolved theme.
// React does not repair a mismatched image attribute during initial hydration.
const subscribeHydration = () => () => {}
const clientHydrated = () => true
const serverHydrated = () => false
export function SceneImage({
  example,
  priority = false,
}: {
  example: SiteExample
  priority?: boolean
}) {
  const hydrated = useSyncExternalStore(
      subscribeHydration,
      clientHydrated,
      serverHydrated,
    ),
    { resolvedTheme } = useTheme(),
    { locale } = useSiteI18n(),
    dark = hydrated && resolvedTheme === "dark"
  return (
    <div className={styles.imageFrame}>
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={
            dark ? example.thumbnail.mobileDark : example.thumbnail.mobileLight
          }
        />
        <img
          src={dark ? example.thumbnail.dark : example.thumbnail.light}
          width={1440}
          height={900}
          alt={example.title[locale]}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </picture>
    </div>
  )
}
