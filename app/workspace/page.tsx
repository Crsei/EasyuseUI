import Link from "next/link"
import { WorkspaceShellDemo } from "@/components/examples/workspace-shell-demo"

export const metadata = {
  title: "Agent 工作台",
  description:
    "基于 Component Specification 初始化的紧凑 Agent 工作台，统一尺寸、运行状态和 Inspector。",
}

export default function WorkspacePage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl leading-7 font-semibold">Agent Workspace</h1>
          <p className="mt-2 text-[13px] leading-5 text-text-secondary">
            紧凑布局、统一状态、清晰上下文。基于 Component Specification v1.0。
          </p>
        </div>
        <Link
          href="/docs/workspace-shell"
          className="text-xs leading-5 text-primary"
        >
          组件用法与源码 →
        </Link>
      </div>
      <WorkspaceShellDemo />
    </main>
  )
}
