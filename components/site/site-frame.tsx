"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function SiteFrame({
  children,
  header,
  footer,
}: {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}) {
  const pathname = usePathname()
  if (
    /^\/examples\/agent-workbench\/(app|layouts)\/?$/.test(pathname) ||
    pathname === "/examples/workflow-analytics" ||
    pathname === "/examples/workflow-analytics/" ||
    pathname === "/workspace/agents" ||
    pathname.startsWith("/workspace/agents/") ||
    pathname === "/examples/work-items" ||
    pathname === "/examples/work-items/" ||
    pathname === "/workspace/canvas" ||
    pathname.startsWith("/workspace/canvas/") ||
    pathname === "/examples/sales-crm" ||
    pathname === "/examples/sales-crm/"
  )
    return <div className="h-dvh min-h-0 overflow-hidden">{children}</div>
  return (
    <div className="flex min-h-svh flex-col">
      {header}
      <div className="flex flex-1 flex-col">{children}</div>
      {footer}
    </div>
  )
}
