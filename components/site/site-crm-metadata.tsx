"use client"

import { SitePageMetadata } from "./site-page-metadata"
import metadata from "@/lib/site-crm-metadata.json"

export function SiteCrmMetadata() {
  return (
    <SitePageMetadata
      pathname="/examples/sales-crm"
      title={metadata.title}
      description={metadata.description}
    />
  )
}
