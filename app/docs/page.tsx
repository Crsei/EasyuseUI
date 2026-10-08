import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { CodeBlock } from "@/components/docs/code-block"
import { catalog } from "@/lib/catalog"

export const metadata = { title: "介绍" }

export default function DocsPage() {
  return (
    <>
      <p className="mb-3 text-xs font-medium text-primary">开始</p>
      <h1 className="text-3xl font-semibold tracking-tight">介绍</h1>
      <p className="mt-5 text-base leading-8 text-muted-foreground">
        EasyuseUI 是一套可以带进自己项目的 React
        组件。统一的主题、清楚的交互状态，以及可以直接修改的源码。
      </p>
      <h2 className="mt-12 mb-4 text-xl font-semibold">组件如何工作</h2>
      <p className="mb-5 text-sm leading-7 text-muted-foreground">
        通过 shadcn CLI 安装后，组件文件会进入你的 components 目录。像普通 React
        组件一样导入，通过属性和回调连接业务。
      </p>
      <CodeBlock
        code={
          'import { Button } from "@/components/ui/button"\n\nexport function SaveButton() {\n  return <Button onClick={() => console.log("保存")}>保存更改</Button>\n}'
        }
      />
      <h2 className="mt-12 mb-5 text-xl font-semibold">当前提供</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.map((entry) => (
          <Link
            key={entry.slug}
            href={`/docs/${entry.slug}`}
            className="rounded-xl border p-5 transition-colors hover:bg-muted/40"
          >
            <h3 className="font-medium">{entry.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {entry.description}
            </p>
          </Link>
        ))}
      </div>
      <h2 className="mt-12 mb-4 text-xl font-semibold">设计约定</h2>
      <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
        <li>用语义颜色表达主操作、错误和完成状态，支持深浅主题。</li>
        <li>交互控件保留键盘操作、焦点提示和可访问名称。</li>
        <li>组件接收数据和回调；请求、权限和持久化由业务项目负责。</li>
        <li>示例中的保存、创建和任务重试均为本地交互演示。</li>
      </ul>
      <Link href="/docs/installation" className={`${buttonVariants()} mt-10`}>
        安装第一个组件
        <ArrowRight size={15} />
      </Link>
    </>
  )
}
