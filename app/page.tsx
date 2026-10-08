import { SiteText } from "@/components/site/site-i18n"
import Link from "next/link"
import { ArrowRight, Check, Code2, Layers3, MousePointer2 } from "lucide-react"
import { TaskPanelDemo } from "@/components/examples/task-panel-demo"
import { ButtonDemo } from "@/components/examples/button-demo"
import { InputDemo } from "@/components/examples/input-demo"
import { DialogDemo } from "@/components/examples/dialog-demo"
import { CodeBlock } from "@/components/docs/code-block"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { registryUrl } from "@/lib/site"

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-18 pb-20 sm:px-8 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            <SiteText messageKey="site.easyuseuiTheFirstComponentsAreReady" />
          </div>
          <h1 className="text-4xl leading-[1.25] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem]">
            <SiteText messageKey="site.makeUsability" />
            <br />
            <span className="text-primary">
              <SiteText messageKey="site.theDefault" />
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
            <SiteText messageKey="site.reactComponentsForEverydayDevelopmentClearStatesConsistentDetails" />
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link prefetch={false}
              href="/docs/installation"
              className={buttonVariants({ size: "lg" })}
            >
              <SiteText messageKey="site.getStarted" />
              <ArrowRight size={16} />
            </Link>
            <Link prefetch={false}
              href="/components"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              <SiteText messageKey="site.browseComponents" />
            </Link>
            <Link prefetch={false}
              href="/scroll"
              className="inline-flex items-center gap-1.5 px-2 py-3 text-sm text-muted-foreground hover:text-primary"
            >
              <SiteText messageKey="site.tryScrollInteractions" />
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className="mt-7 font-mono text-xs text-muted-foreground">
            React 19 / TypeScript / Tailwind CSS 4
          </p>
        </div>
        <div className="dot-grid relative rounded-3xl border p-5 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-border" />
              <span className="size-2 rounded-full bg-border" />
              <span className="size-2 rounded-full bg-border" />
            </div>
            <span className="rounded-md bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
              <SiteText messageKey="site.interactiveDemoTaskPanelTsx" />
            </span>
          </div>
          <TaskPanelDemo />
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <MousePointer2 size={13} />
            <SiteText messageKey="site.clickRetryToSeeTheTaskContinue" />
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/25">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3 sm:px-8">
          {[
            {
              icon: Layers3,
              title: "组合成你的界面",
              text: "基础组件保持简单，组合模块处理完整场景。",
            },
            {
              icon: MousePointer2,
              title: "每个状态都照顾到",
              text: "从等待、执行到失败，让交互始终清楚。",
            },
            {
              icon: Code2,
              title: "源码就在你的项目",
              text: "按需安装，直接修改，适配自己的业务。",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon size={19} className="mb-4 text-primary" />
              <h2 className="text-sm font-semibold">
                <SiteText text={title} />
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <SiteText text={text} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-9 flex items-end justify-between gap-5">
          <div>
            <p className="mb-3 font-mono text-xs tracking-wider text-primary">
              SMALL DETAILS, BETTER INTERFACES
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              <SiteText messageKey="site.smallComponentsEveryDetailConsidered" />
            </h2>
          </div>
          <Link prefetch={false}
            href="/components"
            className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"
          >
            <SiteText messageKey="site.allComponents" />
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Button",
              text: "明确操作，及时反馈。",
              href: "/docs/button",
              demo: <ButtonDemo />,
            },
            {
              title: "Input",
              text: "从填写到校验，保持清晰。",
              href: "/docs/input",
              demo: <InputDemo />,
            },
            {
              title: "Dialog",
              text: "为眼前的事情，留一点空间。",
              href: "/docs/dialog",
              demo: <DialogDemo />,
            },
          ].map(({ title, text, href, demo }) => (
            <article
              key={title}
              className="flex min-w-0 flex-col rounded-xl border"
            >
              <div className="flex min-h-56 flex-1 items-center justify-center p-5">
                {demo}
              </div>
              <Link prefetch={false}
                href={href}
                className="flex items-center justify-between border-t bg-muted/25 p-5"
              >
                <div>
                  <h3 className="text-sm font-semibold">
                    <SiteText text={title} />
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <SiteText text={text} />
                  </p>
                </div>
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            <SiteText messageKey="site.oneCommandInYourProject" />
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            <SiteText messageKey="site.componentsDependenciesAndThemeInstallTogetherTheCodeLives" />
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Check size={14} className="text-success" />
            <SiteText messageKey="site.forReactProjectsWithShadcnInitialized" />
          </p>
          <Link prefetch={false}
            href="/docs/installation"
            className={cn(buttonVariants({ variant: "ghost" }), "mt-4 -ml-4")}
          >
            <SiteText messageKey="site.viewInstallationGuide" />
            <ArrowRight size={15} />
          </Link>
        </div>
        <CodeBlock
          lang="bash"
          title="Terminal"
          code={`pnpm dlx shadcn@latest add ${registryUrl}/button.json`}
        />
      </section>
    </main>
  )
}
