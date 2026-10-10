import { SiteText } from "@/components/site/site-i18n"
import { SiteLocalized } from "@/components/site/site-localized"
import Link from "next/link"
import { WorkspaceShellDemo } from "@/components/examples/workspace-shell-demo"

export const metadata = {
  title: "Workspace Shell 示例",
  description:
    "通用 Workspace Shell 本地示例：布局、对象选择、运行状态和 Inspector。",
}

export default function WorkspaceShellPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl leading-7 font-semibold">Workspace Shell</h1>
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
      <Link
        href="/workspace/"
        className="mb-4 inline-flex text-sm text-primary"
      >
        <SiteLocalized
          value={{ "zh-CN": "Agent 编码工作台", en: "Agent coding workbench" }}
        />
      </Link>
      <Link
        href="/workspace/agents/"
        className="mb-4 ml-4 inline-flex text-sm text-primary"
      >
        Agent Board / 运行看板
      </Link>
      <Link
        href="/workspace/svg/"
        className="mb-4 ml-4 inline-flex text-sm text-primary"
      >
        <SiteText messageKey="site.svg.pageTitle" />
      </Link>
      <WorkspaceShellDemo />
    </main>
  )
}
