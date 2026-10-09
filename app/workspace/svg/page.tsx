import type { Metadata } from "next"
import { SvgWorkbenchDemo } from "@/components/examples/svg-workbench/workbench-demo"
export const metadata: Metadata = {
  title: "SVG 工作台",
  description: "离线 SVG 素材浏览、绘制、源码校验与独立 SVG/React 导出。",
}
export default function SvgWorkbenchPage() {
  return (
    <main id="main-content" className="h-full min-h-0">
      <SvgWorkbenchDemo layout="fill" />
    </main>
  )
}
