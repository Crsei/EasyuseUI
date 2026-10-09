import { SiteText } from "@/components/site/site-i18n"
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
            <SiteText messageKey="site.compactLayoutSharedStatesAndClearContextBasedOn" />
          </p>
        </div>
        <Link
          href="/docs/workspace-shell"
          className="text-xs leading-5 text-primary"
        >
          <SiteText messageKey="site.componentUsageAndSource" />
        </Link>
      </div>
      <Link href="/workspace/agents/" className="mb-4 inline-flex text-sm text-primary">Agent Board / 运行看板</Link>
      <Link href="/workspace/svg/" className="mb-4 ml-4 inline-flex text-sm text-primary"><SiteText messageKey="site.svg.pageTitle" /></Link>
      <WorkspaceShellDemo />
    </main>
  )
}
