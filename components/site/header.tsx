"use client"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Menu, Search, Github, Moon, Sun, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocaleSwitcher } from "./locale-switcher"
import { useSiteI18n } from "./site-i18n"
import {
  primaryNavigation,
  resourceNavigation,
  repositoryUrl,
  isNavigationActive,
} from "@/lib/site-navigation"
import styles from "./site.module.css"
const NavigationDrawer = dynamic(
  () => import("./navigation-drawer").then((module) => module.NavigationDrawer),
  { ssr: false },
)
const DocsSearch = dynamic(
  () =>
    import("@/components/docs/docs-search").then((module) => module.DocsSearch),
  { ssr: false },
)
const subscribeHydration = () => () => {}
const clientHydrated = () => true
const serverHydrated = () => false
export function Header() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    clientHydrated,
    serverHydrated,
  )
  const { t } = useSiteI18n(),
    pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [menuLoaded, setMenuLoaded] = useState(false),
    [menuOpen, setMenuOpen] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [searchLoaded, setSearchLoaded] = useState(false)
  const searchTrigger = useRef<HTMLButtonElement>(null)
  function openSearch() {
    setSearchLoaded(true)
    setSearchOpen(true)
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const element = event.target instanceof Element ? event.target : null
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        event.altKey ||
        event.shiftKey ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k" ||
        element?.closest(
          'input,textarea,select,[contenteditable="true"],.react-flow',
        )
      )
        return
      event.preventDefault()
      setSearchLoaded(true)
      setSearchOpen(true)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])
  return (
    <header className={styles.header} data-site-header>
      <div className={styles.headerInner}>
        <Link
          prefetch={false}
          href="/"
          aria-label={t("site.easyuseuiHome")}
          className={styles.brand}
        >
          <span className={styles.mark}>e.</span>
          <span className={styles.brandText}>EasyuseUI</span>
        </Link>
        <nav
          aria-label={t("site.mainNavigation")}
          className={styles.desktopNav}
        >
          {primaryNavigation.map((item) => (
            <Link
              prefetch={false}
              key={item.href}
              href={item.href}
              aria-current={
                isNavigationActive(pathname, item.href) ? "page" : undefined
              }
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className={styles.headerTools}>
          <details className={styles.resources}>
            <summary>
              {t("site.redesign.resources")}
              <ChevronDown size={14} />
            </summary>
            <nav aria-label={t("site.redesign.resources")}>
              {resourceNavigation.map((item) => (
                <Link
                  prefetch={false}
                  href={item.href}
                  key={item.href}
                  onClick={(event) => {
                    const details = event.currentTarget.closest("details")
                    if (details) details.open = false
                  }}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </details>
          <Button
            ref={searchTrigger}
            variant="ghost"
            size="icon"
            aria-label={t("site.redesign.search")}
            disabled={!hydrated}
            onClick={openSearch}
          >
            <Search size={16} />
          </Button>
          <LocaleSwitcher />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("site.toggleLightAndDarkTheme")}
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </Button>
          <a
            href={repositoryUrl}
            aria-label={t("site.redesign.repository")}
            className={styles.repository}
          >
            <Github size={18} />
          </a>
          <Button
            className={styles.mobileMenu}
            variant="ghost"
            size="icon"
            aria-label={t("site.redesign.menu")}
            onClick={() => {
              setMenuLoaded(true)
              setMenuOpen(true)
            }}
          >
            <Menu size={18} />
          </Button>
        </div>
      </div>
      {menuLoaded && (
        <NavigationDrawer
          open={menuOpen}
          onOpenChange={setMenuOpen}
          title="EasyuseUI"
          description={t("site.mainNavigation")}
        >
          <nav
            aria-label={t("site.mainNavigation")}
            className={styles.mobileNav}
          >
            {[...primaryNavigation, ...resourceNavigation].map((item) => (
              <Link
                prefetch={false}
                key={item.href}
                href={item.href}
                aria-current={
                  isNavigationActive(pathname, item.href) ? "page" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <a href={repositoryUrl}>{t("site.redesign.repository")}</a>
          </nav>
        </NavigationDrawer>
      )}
      {searchLoaded && (
        <DocsSearch
          open={searchOpen}
          onOpenChange={setSearchOpen}
          finalFocus={searchTrigger}
        />
      )}
    </header>
  )
}
