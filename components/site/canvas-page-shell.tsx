"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import type { ReactNode } from "react"
import { LocaleSwitcher } from "@/components/site/locale-switcher"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./canvas-page-shell.module.css"

const pages = [
  { href: "/workspace/canvas", label: "流程画布" },
  { href: "/workspace/canvas/project", label: "嵌套流程" },
  { href: "/workspace/canvas/services", label: "服务接口" },
  { href: "/workspace/canvas/stress", label: "压力图" },
]
export function CanvasPageShell({ children }: { children: ReactNode }) {
  const { t, localize } = useSiteI18n()

  const localizedPages = localize(pages)

  const pathname = usePathname().replace(/\/$/, "")
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={styles.page}
      data-canvas-page
    >
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.home}
          aria-label={t("site.easyuseuiHome")}
        >
          e.
        </Link>
        <h1 className="sr-only">
          {localizedPages.find((page) => page.href === pathname)?.label}
          {t("site.workspace")}
        </h1>
        <nav
          aria-label={t("site.canvasWorkspaceNavigation")}
          className={styles.navigation}
        >
          {localizedPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              aria-current={pathname === page.href ? "page" : undefined}
            >
              {page.label}
            </Link>
          ))}
        </nav>
        <LocaleSwitcher />
        <Button
          size="icon"
          variant="ghost"
          aria-label={t("site.toggleLightAndDarkTheme")}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  )
}
