import type { Metadata } from "next"
import { Suspense } from "react"
import { WorkItemsDemo } from "@/components/examples/work-items/work-items-demo"
export const metadata: Metadata = {
  title: "Work Items",
  description: "List, Board and Table sharing controlled work item components.",
}
export default function WorkItemsPage() {
  return (
    <Suspense fallback={<p>Work Items…</p>}>
      <WorkItemsDemo />
    </Suspense>
  )
}
