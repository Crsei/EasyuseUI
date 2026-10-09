"use client"

import Link from "next/link"
import { SiteRootText } from "./site-root-text"

export function SiteSkipLink() {
  return (
    <Link
      prefetch={false}
      href="#main-content"
      className="sr-only z-50 rounded-md bg-background p-3 focus:fixed focus:top-2 focus:left-2 focus:not-sr-only"
    >
      <SiteRootText messageKey="site.skipToMainContent" />
    </Link>
  )
}
