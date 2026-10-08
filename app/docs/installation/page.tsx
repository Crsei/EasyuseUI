import { CodeBlock } from "@/components/docs/code-block"
import { registryUrl } from "@/lib/site"

export const metadata = { title: "安装与主题" }

export default function InstallationPage() {
  return (
    <>
      <p className="mb-3 text-xs font-medium text-primary">开始</p>
      <h1 className="text-3xl font-semibold tracking-tight">安装与主题</h1>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">
        准备一个支持 React、TypeScript 和 Tailwind CSS 4
        的项目，然后按下面的步骤安装。组件通过源码分发，不依赖本站的运行时。
      </p>
      <h2 className="mt-10 mb-4 text-xl font-semibold">1. 初始化 shadcn</h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        在接收组件的项目根目录执行。已有 components.json 的项目可跳过这一步。
      </p>
      <CodeBlock
        lang="bash"
        code="pnpm dlx shadcn@latest init"
        title="Terminal"
      />
      <h2 className="mt-10 mb-4 text-xl font-semibold">2. 安装一个组件</h2>
      <CodeBlock
        lang="bash"
        code={`pnpm dlx shadcn@latest add ${registryUrl}/button.json`}
        title="Terminal"
      />
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        安装器会一起解析组件依赖和 EasyuseUI
        主题。首次安装会写入主题变量，请先检查已有项目的颜色配置。TaskPanel
        会自动安装 Button。
      </p>
      <h2 className="mt-10 mb-4 text-xl font-semibold">3. 在页面中使用</h2>
      <CodeBlock
        code={
          '"use client"\n\nimport { Button } from "@/components/ui/button"\n\nexport function Example() {\n  return <Button onClick={() => alert("你好，EasyuseUI")}>开始使用</Button>\n}'
        }
      />
      <h2 className="mt-10 mb-4 text-xl font-semibold">主题和自定义</h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        组件使用 background、foreground、primary、muted、border、ring、success
        和 destructive 等语义颜色。通过修改全局 CSS 变量调整品牌，使用根元素的
        dark 类切换深色主题。
      </p>
      <CodeBlock
        lang="bash"
        title="安装组合模块"
        code={`pnpm dlx shadcn@latest add ${registryUrl}/task-panel.json`}
      />
      <h2 className="mt-10 mb-4 text-xl font-semibold">
        部署你自己的 Registry
      </h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        设置 NEXT_PUBLIC_SITE_URL
        为你的站点地址，再运行构建。它同时决定文档中的安装链接和 Registry
        内部的依赖地址。构建完成后，把 out 目录交给静态服务器托管。
      </p>
      <CodeBlock
        lang="bash"
        title="在 EasyuseUI 仓库中执行"
        code={
          "NEXT_PUBLIC_SITE_URL=https://你的域名 pnpm build\n\n# 本地预览构建产物，默认端口 3011\npnpm preview"
        }
      />
    </>
  )
}
