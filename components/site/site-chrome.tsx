"use client"

import type { ReactNode } from "react"
import { Header } from "./header"
import { SiteFooter } from "./site-footer"

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  )
}
