import { Suspense } from "react"
import { WorkbenchDemo } from "@/components/examples/agent-workbench/workbench-demo"
import { WorkbenchExampleProvider } from "@/components/examples/agent-workbench/provider"

export const metadata = {
  title: "Agent 编码工作台",
  description:
    "新版 Agent Workspace 本地交互示例：会话、对话、工具记录、代码审阅与运行面板。",
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div aria-busy="true" />}>
      <WorkbenchExampleProvider>
        <WorkbenchDemo level="app" defaultPage="session" />
      </WorkbenchExampleProvider>
    </Suspense>
  )
}
