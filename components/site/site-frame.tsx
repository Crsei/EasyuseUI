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
    pathname === "/workspace/agents" ||
    pathname === "/workspace/agents/" ||
    pathname === "/workspace/canvas" ||
    pathname.startsWith("/workspace/canvas/")
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
