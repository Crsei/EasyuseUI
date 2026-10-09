export type GuideText = { "zh-CN": string; en: string }
export type GuideSection = {
  id: string
  title: GuideText
  body: GuideText
  code?: string
  language?: "tsx" | "bash"
  links?: { href: string; title: GuideText }[]
}
export type DocGuide = {
  slug: string
  title: GuideText
  summary: GuideText
  source: string
  sections: GuideSection[]
}
export const docGuides: DocGuide[] = [
  {
    slug: "installation",
    title: { "zh-CN": "安装与主题", en: "Installation and theme" },
    summary: {
      "zh-CN": "在已有 React 项目安装第一个组件，检查主题、依赖和键盘交互。",
      en: "Install your first component in an existing React project, then verify themes, dependencies and keyboard interaction.",
    },
    source: "README.md / STYLE-WORKBENCH.md",
    sections: [
      {
        id: "prepare",
        title: { "zh-CN": "准备项目", en: "Prepare your project" },
        body: {
          "zh-CN":
            "准备 React、TypeScript 和 Tailwind CSS 项目。在消费项目初始化 shadcn；已经初始化则跳过。本仓库本身无需重新初始化。",
          en: "Prepare a React, TypeScript and Tailwind CSS project. Initialize shadcn in the consumer project, or skip this if already initialized. Do not initialize this repository again.",
        },
        code: "pnpm dlx shadcn@4.21.2 init",
        language: "bash",
      },
      {
        id: "installation",
        title: { "zh-CN": "安装源码", en: "Install source" },
        body: {
          "zh-CN":
            "CLI 安装源码、依赖和主题。命令中的 Registry 地址由站点构建配置提供；公开部署必须设置 NEXT_PUBLIC_SITE_URL。",
          en: "The CLI installs source, dependencies and theme. The build configuration supplies the Registry URL. Public deployments must set NEXT_PUBLIC_SITE_URL.",
        },
        code: "pnpm dlx shadcn@4.21.2 add $REGISTRY_URL/button.json",
        language: "bash",
      },
      {
        id: "usage",
        title: { "zh-CN": "使用与检查", en: "Use and verify" },
        body: {
          "zh-CN":
            "运行项目后，使用 Tab 聚焦按钮、Enter 激活，并检查深浅主题。下面只是页面交互；生产保存逻辑由调用方提供。",
          en: "Run the project, focus the button with Tab, activate with Enter, and check both themes. This is a page interaction; callers supply production save logic.",
        },
        code: `"use client"
import { Button } from "@/components/ui/button"
export function SaveButton() {
  return <Button onClick={() => console.log("save")}>Save</Button>
}`,
      },
      {
        id: "theme",
        title: { "zh-CN": "主题与作用域", en: "Theme and scope" },
        body: {
          "zh-CN":
            "默认主题使用共享语义 token。host 版本适配宿主变量；scoped 版本通过 ThemeBoundary 限制主题，并让 Portal 继承边界。",
          en: "The default theme uses shared semantic tokens. The host variant adapts host variables. The scoped variant limits the theme with ThemeBoundary, including portals.",
        },
        code: `import { ThemeBoundary } from "@/components/ui/theme-boundary"
import type { ReactNode } from "react"
export function PreviewTheme({ children }: { children: ReactNode }) {
  return <ThemeBoundary mode="scoped" theme="dark">{children}</ThemeBoundary>
}`,
      },
    ],
  },
  {
    slug: "controlled-components",
    title: {
      "zh-CN": "受控组件与调用方责任",
      en: "Controlled components and caller responsibilities",
    },
    summary: {
      "zh-CN": "分清显示状态、数据快照与真实执行结果，保留草稿并处理未知回执。",
      en: "Separate presentation state, data snapshots and execution outcomes. Preserve drafts and reconcile unknown receipts.",
    },
    source: "Component-Specification.md / WORK-ITEMS.md",
    sections: [
      {
        id: "ownership",
        title: { "zh-CN": "谁拥有数据", en: "Data ownership" },
        body: {
          "zh-CN":
            "组件接收快照和回调，调用方负责请求、权限、持久化与执行。选中对象不等于启动操作；展开 ToolCall 不等于批准执行。",
          en: "Components receive snapshots and callbacks. Callers own requests, permissions, persistence and execution. Selecting an object does not start an operation, and expanding ToolCall does not approve it.",
        },
        code: `"use client"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
export function Selection() {
  const [checked, setChecked] = useState(false)
  return <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Select item" />
}`,
      },
      {
        id: "states",
        title: { "zh-CN": "状态与恢复", en: "States and recovery" },
        body: {
          "zh-CN":
            "Interaction、Data 和 Runtime 是独立状态轴。刷新失败保留原数据；拒绝保留草稿；unknown 不显示成功，先按操作 ID 查询对账，再决定下一次写入。",
          en: "Interaction, Data and Runtime are independent axes. Preserve data on refresh failure and drafts on rejection. Unknown is not success: query by operation ID before another write.",
        },
        links: [
          {
            href: "/docs/data-region/",
            title: {
              "zh-CN": "DataRegion 数据五态",
              en: "DataRegion data states",
            },
          },
          {
            href: "/docs/tool-call/",
            title: {
              "zh-CN": "ToolCall 审批与对账",
              en: "ToolCall approval and reconciliation",
            },
          },
        ],
      },
      {
        id: "concurrency",
        title: { "zh-CN": "版本与迟到响应", en: "Versions and late responses" },
        body: {
          "zh-CN":
            "Inspector 接收完整对象快照，调用方按对象 ID 丢弃迟到响应。Work Items 命令使用 queryKey、baseRevision 和 operationId，示例内存回执不替代服务端事务。",
          en: "Inspector receives a complete object snapshot; callers discard late responses by object ID. Work Items commands use queryKey, baseRevision and operationId. In-memory receipts do not provide server transactions.",
        },
      },
    ],
  },
  {
    slug: "internationalization",
    title: { "zh-CN": "国际化", en: "Internationalization" },
    summary: {
      "zh-CN":
        "组件默认中文，支持英文；切换显示语言不改变协议值、用户内容或草稿。",
      en: "Components default to Chinese and support English. Locale changes preserve protocol values, user content and drafts.",
    },
    source: "I18N.md / lib/i18n-provider.tsx",
    sections: [
      {
        id: "installation",
        title: { "zh-CN": "安装与 Provider", en: "Installation and provider" },
        body: {
          "zh-CN":
            "Registry 依赖带入便携 i18n。将 Provider 放在稳定的组件树位置，避免因语言变化重挂载编辑器。站点资源与便携组件资源相互独立。",
          en: "Registry dependencies include portable i18n. Keep the provider at a stable tree position so locale changes do not remount editors. Site messages remain separate from portable component messages.",
        },
        code: `import { I18nProvider } from "@/lib/i18n-provider"
import type { ReactNode } from "react"
export function EnglishUI({ children }: { children: ReactNode }) {
  return <I18nProvider defaultLocale="en">{children}</I18nProvider>
}`,
      },
      {
        id: "content",
        title: { "zh-CN": "保留调用方内容", en: "Preserve caller content" },
        body: {
          "zh-CN":
            "只翻译内置呈现文字。用户输入、终端输出、字段协议值和源码不自动翻译。切语言不触发服务写入。",
          en: "Translate built-in presentation text only. Preserve user input, terminal output, protocol values and source code. Locale changes must not trigger service writes.",
        },
      },
    ],
  },
  {
    slug: "registry-and-source",
    title: {
      "zh-CN": "Registry 与源码接入",
      en: "Registry and source integration",
    },
    summary: {
      "zh-CN": "理解安装 ID、依赖闭包与仓库源码的关系，选择适合宿主的主题。",
      en: "Understand install IDs, dependency closures and repository source, and choose a host-compatible theme.",
    },
    source: "registry.json / scripts/build-registry.mjs / README.md",
    sections: [
      {
        id: "installation",
        title: { "zh-CN": "使用真实安装 ID", en: "Use the actual install ID" },
        body: {
          "zh-CN":
            "文档读取 Manifest 中的 registryId；它可能与组件名和文档 slug 不同。CLI 重写导入路径并安装依赖闭包，不应逐个猜测内部文件。",
          en: "Documentation uses registryId from the Manifest. It can differ from the component name or slug. The CLI rewrites imports and installs the dependency closure; do not guess internal file dependencies.",
        },
        code: "pnpm dlx shadcn@4.21.2 add $REGISTRY_URL/work-items-workspace.json",
        language: "bash",
      },
      {
        id: "source",
        title: {
          "zh-CN": "源码和示例的边界",
          en: "Source and example boundaries",
        },
        body: {
          "zh-CN":
            "源码浏览器展示仓库原文件；安装结果含路径重写。示例文件可能包含 Provider、fixture 与失败注入。先理解示例适配层，再连接自己的数据服务。",
          en: "The source browser shows original repository files; installation rewrites paths. Example files can contain providers, fixtures and failure injection. Understand the example adapter before connecting your data service.",
        },
      },
      {
        id: "publishing",
        title: { "zh-CN": "部署自己的 Registry", en: "Publish your Registry" },
        body: {
          "zh-CN":
            "静态构建显式设置 NEXT_PUBLIC_SITE_URL 为部署站点地址。公开构建不能依赖浏览器地址补救错误配置，也不能发布 localhost 安装命令。",
          en: "Set NEXT_PUBLIC_SITE_URL to your deployment origin at build time. Public builds must not infer the Registry from the browser or publish localhost installation commands.",
        },
        code: "NEXT_PUBLIC_SITE_URL=https://ui.example.com pnpm build",
        language: "bash",
      },
    ],
  },
  {
    slug: "composing-workspaces",
    title: { "zh-CN": "组合工作台", en: "Compose a workspace" },
    summary: {
      "zh-CN":
        "以已有的工作台组件为骨架，将导航、任务和对象详情放在合适的位置。",
      en: "Use existing workspace components to place navigation, tasks and object details in the right regions.",
    },
    source: "UI-PATTERNS.md / WORK-ITEMS.md / CANVAS.md",
    sections: [
      {
        id: "structure",
        title: { "zh-CN": "从布局到任务", en: "From layout to task" },
        body: {
          "zh-CN":
            "WorkspaceShell 管理导航、主区、Inspector 和底部面板。工作项优先复用 WorkItemsWorkspace；画布复用 CanvasWorkspace。页面适配器持有 URL、fixture 或服务连接。",
          en: "WorkspaceShell organizes navigation, main content, Inspector and bottom panels. Reuse WorkItemsWorkspace for work items and CanvasWorkspace for graphs. Page adapters own URLs, fixtures and service connections.",
        },
        links: [
          {
            href: "/docs/workspace-shell/",
            title: {
              "zh-CN": "WorkspaceShell 布局",
              en: "WorkspaceShell layout",
            },
          },
          {
            href: "/docs/work-items-workspace/",
            title: {
              "zh-CN": "WorkItemsWorkspace 组合",
              en: "WorkItemsWorkspace composition",
            },
          },
          {
            href: "/docs/canvas-workspace/",
            title: {
              "zh-CN": "CanvasWorkspace 组合",
              en: "CanvasWorkspace composition",
            },
          },
        ],
      },
      {
        id: "examples",
        title: { "zh-CN": "运行完整示例", en: "Run a complete example" },
        body: {
          "zh-CN":
            "从示例库进入 Agent、Work Items 或 Canvas，检查窄屏、语言、状态恢复和键盘路径。本地演示只证明这些组件行为，不证明真实执行、存储或业务验收。",
          en: "Open Agent, Work Items or Canvas from the gallery. Check narrow layouts, locales, recovery and keyboard paths. Local demonstrations prove component behavior, not real execution, storage or business acceptance.",
        },
        links: [
          {
            href: "/examples/",
            title: { "zh-CN": "打开示例库", en: "Open example gallery" },
          },
        ],
      },
    ],
  },
]
