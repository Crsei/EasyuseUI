"use client"
import { useId, useState } from "react"
import { DemoVisibility } from "@/components/examples/demo-visibility"
import { Button } from "@/components/ui/button"
import { useSiteI18n } from "@/components/site/site-i18n"
import { DemoLoader } from "./demo-loader"
import { SourceBrowser, type SourceFile } from "./source-browser"
export function ComponentPreview({
  slug,
  name,
  wide,
  files,
}: {
  slug: string
  name: string
  wide?: boolean
  files: SourceFile[]
}) {
  const { t } = useSiteI18n(),
    [generation, setGeneration] = useState(0),
    [tab, setTab] = useState("preview"),
    id = useId()
  const heavy = /^(canvas|workflow|node-|variable-|work-items-workspace)/.test(
    slug,
  )
  return (
    <section
      aria-label={t("site.valueInteractiveDemo", { value0: name })}
      className="my-8 min-w-0 overflow-hidden rounded-xl border"
      id="preview"
    >
      <h2 className="sr-only">
        {t("site.valueInteractiveDemo", { value0: name })}
      </h2>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3">
          <div
            role="group"
            aria-label={t("site.redesign.previewDisplay")}
            className="flex gap-1 py-1"
          >
            <Button
              size="sm"
              variant={tab === "preview" ? "secondary" : "ghost"}
              aria-pressed={tab === "preview"}
              aria-controls={`${id}-preview`}
              onClick={() => setTab("preview")}
            >
              {t("site.redesign.preview")}
            </Button>
            <Button
              size="sm"
              variant={tab === "code" ? "secondary" : "ghost"}
              aria-pressed={tab === "code"}
              aria-controls={`${id}-code`}
              onClick={() => setTab("code")}
            >
              {t("site.redesign.exampleCode")}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGeneration((value) => value + 1)}
          >
            {t("site.redesign.reset")}
          </Button>
        </div>
        <div
          id={`${id}-preview`}
          hidden={tab !== "preview"}
          className="m-0 min-h-[288px] p-4 sm:min-h-[232px] sm:p-6"
        >
          <div className={wide ? "w-full min-w-0" : "mx-auto w-full max-w-lg"}>
            <DemoVisibility value={tab === "preview"}>
              <DemoLoader key={generation} slug={slug} autoLoad={!heavy} />
            </DemoVisibility>
          </div>
        </div>
        <div id={`${id}-code`} hidden={tab !== "code"} className="m-0 p-4">
          <p className="mb-3 text-xs leading-6 text-muted-foreground">
            {t("site.redesign.sourceContext")}
          </p>
          <SourceBrowser files={files} />
        </div>
      </div>
    </section>
  )
}
