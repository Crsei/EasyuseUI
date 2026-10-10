"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import type { ReactNode } from "react"

const SiteChrome = dynamic(() =>
  import("./site-chrome").then((module) => module.SiteChrome),
)
const SiteCrmMetadata = dynamic(() =>
  import("./site-crm-metadata").then((module) => module.SiteCrmMetadata),
)

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isCrm = pathname.replace(/\/$/, "") === "/examples/sales-crm"
  const content = (
    <>
      {isCrm && <SiteCrmMetadata />}
      {children}
    </>
  )
  if (
    /^\/examples\/agent-workbench\/(app|layouts|pi)\/?$/.test(pathname) ||
    pathname === "/workspace" ||
    pathname === "/workspace/" ||
    pathname === "/examples/workflow-analytics" ||
    pathname === "/examples/workflow-analytics/" ||
    pathname === "/workspace/agents" ||
    pathname.startsWith("/workspace/agents/") ||
    pathname === "/examples/work-items" ||
    pathname === "/examples/work-items/" ||
    pathname === "/workspace/canvas" ||
    pathname === "/workspace/svg" ||
    pathname.startsWith("/workspace/svg/") ||
    pathname.startsWith("/workspace/canvas/") ||
    pathname === "/examples/sales-crm" ||
    pathname === "/examples/sales-crm/"
  )
    return <div className="h-dvh min-h-0 overflow-hidden">{content}</div>
  return <SiteChrome>{content}</SiteChrome>
}
