import { SiteText } from "@/components/site/site-i18n"
import { getSingletonHighlighter, createJavaScriptRegexEngine } from "shiki"
import { CopyButton } from "@/components/docs/copy-button"

export async function CodeBlock({
  code,
  lang = "tsx",
  title = "示例代码",
}: {
  code: string
  lang?: "tsx" | "bash" | "json" | "css"
  title?: string
}) {
  const highlighter = await getSingletonHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx", "bash", "json", "css"],
    engine: createJavaScriptRegexEngine(),
  })
  const html = highlighter.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })
  return (
    <div className="code-block min-w-0 overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-1">
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          <SiteText text={title} />
        </span>
        <CopyButton value={code} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
