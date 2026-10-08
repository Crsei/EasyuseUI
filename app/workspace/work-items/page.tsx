import type { Metadata } from "next"
import { WorkItemsExampleRedirect } from "@/components/examples/work-items/work-items-redirect"
export const metadata: Metadata = {
  title: "Work Items 组件示例入口",
  robots: { index: false, follow: true },
}
export default function WorkItemsPage() {
  return <WorkItemsExampleRedirect />
}
