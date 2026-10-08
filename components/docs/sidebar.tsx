"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import Link from "next/link"
import componentIndex from "@/lib/component-navigation.json"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "开始",
    links: [
      { href: "/docs", label: "介绍" },
      { href: "/dictionary", label: "视觉词典" },
      { href: "/blog", label: "优化日志" },
      { href: "/style-workbench", label: "样式工作台" },
      { href: "/workspace/canvas", label: "流程画布" },
      { href: "/docs/installation", label: "安装与主题" },
    ],
  },
  ...["基础组件", "组合模块"].map((category) => ({
    title: category,
    links: componentIndex
      .filter((entry) => entry.category === category)
      .map((entry) => ({
        href: entry.docPath.replace(/\/$/, ""),
        label: entry.name,
      })),
  })),
]

export function Sidebar() {
  const { t, localize } = useSiteI18n()

  const localizedSections = localize(sections)

  const pathname = usePathname().replace(/\/$/, "")
  return (
    <nav
      aria-label={t("site.documentationNavigation")}
      className="flex gap-6 overflow-x-auto pb-4 lg:sticky lg:top-26 lg:block lg:space-y-7 lg:overflow-visible lg:pb-0"
    >
      {localizedSections.map((section) => (
        <div key={section.links[0].href} className="shrink-0">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            {section.title}
          </p>
          <ul className="flex gap-1 lg:block lg:space-y-1">
            {section.links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  prefetch={false}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground",
                    pathname === href &&
                      "bg-primary/8 font-medium text-primary",
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
