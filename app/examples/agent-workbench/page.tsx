import { Suspense } from "react"
import { WorkbenchDemo } from "@/components/examples/agent-workbench/workbench-demo"
export default function Page() {
  return (
    <Suspense fallback={<div aria-busy="true">Loading…</div>}>
      <WorkbenchDemo level="overview" />
    </Suspense>
  )
}
