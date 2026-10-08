import type { Metadata } from "next"
import { AgentBoardDemo } from "@/components/examples/agent-board/agent-board-demo"
export const metadata: Metadata = {
  title: "Agent 运行看板 · EasyuseUI",
  description: "受控 Agent 运行、关注队列、执行步骤与产物审阅的本地组件示例。",
}
export default function AgentBoardPage() {
  return (
    <main id="main-content">
      <AgentBoardDemo page />
    </main>
  )
}
