"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SiteText } from "@/components/site/site-i18n"

export function WorkItemsExampleRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace(
      `/examples/work-items/${window.location.search}${window.location.hash}`,
    )
  }, [router])
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-5 py-12">
      <p className="mb-4 text-sm text-muted-foreground">
        <SiteText messageKey="site.examples.moved" />
      </p>
      <Link
        href="/examples/work-items/"
        className="inline-flex min-h-11 items-center text-sm text-primary"
      >
        <SiteText messageKey="site.examples.openWorkItems" />
      </Link>
    </main>
  )
}
