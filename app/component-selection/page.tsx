import type { Metadata } from "next"
import { ComponentSelectionDemo } from "@/components/examples/component-selection/selection-demo"
import { SitePageMetadata } from "@/components/site/site-page-metadata"

const title = { "zh-CN": "组件选择模板", en: "Component selection template" }
const description = {
  "zh-CN": "比较真实组件、选择首选与备选、批注并导出新项目的 Agent 交接方案。",
  en: "Compare live components, choose preferred options and alternatives, annotate, and export a new-project Agent handoff.",
}
export const metadata: Metadata = {
  title: title["zh-CN"],
  description: description["zh-CN"],
}
export default function ComponentSelectionPage() {
  return (
    <main id="main-content">
      <SitePageMetadata
        pathname="/component-selection"
        title={title}
        description={description}
      />
      <ComponentSelectionDemo />
    </main>
  )
}
