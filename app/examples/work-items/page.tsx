import type { Metadata } from "next"
import { Suspense } from "react"
import { WorkItemsDemo } from "@/components/examples/work-items/work-items-demo"

export const metadata: Metadata = {
  title: "Work Items 组件示例",
  description:
    "使用同一份受控快照组合 List、Board、Table、Timeline 与 Calendar 的组件示例。",
}

export default function WorkItemsExamplePage() {
  return (
    <Suspense fallback={<p>Work Items…</p>}>
      <WorkItemsDemo />
    </Suspense>
  )
}
