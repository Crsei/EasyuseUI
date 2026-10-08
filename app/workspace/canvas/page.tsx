import type { Metadata } from "next"
import { CanvasWorkspaceDemo } from "@/components/examples/canvas-workspace-demo"

export const metadata: Metadata = {
  title: "Canvas 工作台 · EasyuseUI",
  description: "构图、配置、校验与 JSON 导入导出的本地画布工作台。",
}
export default function CanvasPage() {
  return <CanvasWorkspaceDemo layout="fill" />
}
