"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { LocaleSwitcher } from "@/components/site/locale-switcher"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ArrowUpRight, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const { t } = useSiteI18n()

  const pathname = usePathname().replace(/\/$/, "") || "/"
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
        <Link
          prefetch={false}
          href="/"
          aria-label={t("site.easyuseuiHome")}
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-mono text-lg text-primary-foreground">
            e.
          </span>
          <span>
            Easyuse<span className="text-muted-foreground">UI</span>
          </span>
        </Link>
        <nav
          aria-label={t("site.mainNavigation")}
          className="order-3 flex w-full gap-4 overflow-x-auto text-sm whitespace-nowrap sm:order-0 sm:ml-8 sm:w-auto sm:gap-6"
        >
          {[
            { href: "/docs", label: t("site.documentation") },
            { href: "/dictionary", label: t("site.visualDictionary") },
            { href: "/style-workbench", label: t("site.styleWorkbench") },
            { href: "/workspace/canvas", label: t("site.workflowCanvas") },
            { href: "/components", label: t("site.components") },
            { href: "/examples", label: t("site.examples.navigation") },
            { href: "/blog", label: t("site.optimization.blog") },
            { href: "/docs/task-panel", label: t("site.blocks") },
            { href: "/scroll", label: t("site.scrollLab") },
            { href: "/workspace", label: t("site.workspace") },
          ].map(({ href, label }) => (
            <Link
              prefetch={false}
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "py-1 text-muted-foreground transition-colors hover:text-foreground",
                pathname === href && "text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
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
          <Link
            prefetch={false}
            href="/docs/installation"
            className="hidden items-center gap-1 text-sm font-medium sm:flex"
          >
            {t("site.getStarted")}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  )
}
