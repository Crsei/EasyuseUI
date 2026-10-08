"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ArrowUpRight, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname().replace(/\/$/, "") || "/"
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
        <Link
          href="/"
          aria-label="EasyuseUI 首页"
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
          aria-label="主导航"
          className="order-3 flex w-full gap-4 overflow-x-auto text-sm whitespace-nowrap sm:order-0 sm:ml-8 sm:w-auto sm:gap-6"
        >
          {[
            { href: "/docs", label: "文档" },
            { href: "/dictionary", label: "视觉词典" },
            { href: "/style-workbench", label: "样式工作台" },
            { href: "/workspace/canvas", label: "流程画布" },
            { href: "/components", label: "组件" },
            { href: "/docs/task-panel", label: "组合模块" },
            { href: "/scroll", label: "滚动实验室" },
            { href: "/workspace", label: "工作台" },
          ].map(({ href, label }) => (
            <Link
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
          <Button
            variant="ghost"
            size="icon"
            aria-label="切换深浅主题"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </Button>
          <Link
            href="/docs/installation"
            className="hidden items-center gap-1 text-sm font-medium sm:flex"
          >
            开始使用
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  )
}
