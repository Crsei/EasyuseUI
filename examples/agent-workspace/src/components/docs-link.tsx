"use client"
import type { ReactNode } from "react"
function docsHref(path: string) {
  const origin = process.env.NEXT_PUBLIC_DOCS_ORIGIN
  if (!origin) return
  try {
    const url = new URL(origin)
    if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash) return new URL(path, url.origin).href
  } catch {}
}
export function DocsLink({ path, children }: { path: string; children: ReactNode }) {
  const href = docsHref(path)
  return href ? <a href={href}>{children}</a> : <span>{children}</span>
}
