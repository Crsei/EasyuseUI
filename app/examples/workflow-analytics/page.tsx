import type { Metadata } from "next"
import { WorkflowAnalyticsDemo } from "@/components/examples/workflow-analytics/workflow-analytics-demo"
export const metadata: Metadata = {
  title: "工作流分析组件示例",
  description:
    "固定项目 Dashboard、真实历史口径的本地 fixture、图表数据表与受控工作项下钻。",
}
export default function WorkflowAnalyticsPage() {
  return <WorkflowAnalyticsDemo />
}
