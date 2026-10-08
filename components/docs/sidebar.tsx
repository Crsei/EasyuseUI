"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "开始",
    links: [
      { href: "/docs", label: "介绍" },
      { href: "/dictionary", label: "视觉词典" },
      { href: "/style-workbench", label: "样式工作台" },
      { href: "/workspace/canvas", label: "流程画布" },
      { href: "/docs/installation", label: "安装与主题" },
    ],
  },
  {
    title: "基础组件",
    links: [
      { href: "/docs/i18n", label: "I18nProvider" },
      { href: "/docs/button", label: "Button" },
      { href: "/docs/input", label: "Input" },
      { href: "/docs/badge", label: "Badge" },
      { href: "/docs/tag", label: "Tag" },
      { href: "/docs/chip", label: "Chip" },
      { href: "/docs/dialog", label: "Dialog" },
      { href: "/docs/item", label: "Item" },
      { href: "/docs/runtime-status-badge", label: "RuntimeStatusBadge" },
      { href: "/docs/data-region", label: "DataRegion" },
      { href: "/docs/tree", label: "Tree" },
    ],
  },
  {
    title: "组合模块",
    links: [
      { href: "/docs/task-panel", label: "TaskPanel" },
      { href: "/docs/scroll-playground", label: "ScrollPlayground" },
      { href: "/docs/style-workbench", label: "StyleWorkbench" },
      { href: "/docs/workspace-shell", label: "WorkspaceShell" },
      { href: "/docs/workflow-canvas", label: "WorkflowCanvas" },
      { href: "/docs/canvas-workspace", label: "CanvasWorkspace" },
      { href: "/docs/node-palette", label: "NodePalette" },
      { href: "/docs/node-inspector", label: "NodeInspector" },
      { href: "/docs/variable-picker", label: "VariablePicker" },
      { href: "/docs/canvas-frame", label: "CanvasFrame" },
      { href: "/docs/canvas-note", label: "CanvasNote" },
      { href: "/docs/session-row", label: "SessionRow" },
      { href: "/docs/agent-row", label: "AgentRow" },
      { href: "/docs/activity-timeline", label: "ActivityTimeline" },
      { href: "/docs/inspector", label: "Inspector" },
      { href: "/docs/chat-message", label: "ChatMessage" },
      { href: "/docs/tool-call", label: "ToolCall" },
    ],
  },
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
