"use client"
import { useEffect, useId, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { CopyButton } from "./copy-button"
import { useSiteI18n } from "@/components/site/site-i18n"
export type SourceFile = {
  id: string
  path: string
  kind: string
  url: string
  lines: number
}
type Resource = { id: string; path: string; code: string; html: string }
export function SourceBrowser({ files }: { files: SourceFile[] }) {
  const { t } = useSiteI18n(),
    id = useId(),
    token = useRef(0)
  const [selected, setSelected] = useState(files[0]?.id ?? ""),
    [resources, setResources] = useState<Record<string, Resource>>({}),
    [status, setStatus] = useState<"idle" | "loading" | "error">("idle"),
    [expanded, setExpanded] = useState(false)
  const file = files.find((file) => file.id === selected),
    resource = resources[selected]
  useEffect(
    () => () => {
      token.current++
    },
    [],
  )
  async function load() {
    if (!file) return
    const request = ++token.current
    setStatus("loading")
    try {
      const response = await fetch(file.url)
      if (!response.ok) throw new Error("source")
      const data = await response.json()
      if (
        data.id !== file.id ||
        data.path !== file.path ||
        typeof data.code !== "string" ||
        typeof data.html !== "string"
      )
        throw new Error("source")
      if (request !== token.current) return
      setResources((before) => ({ ...before, [file.id]: data }))
      setStatus("idle")
    } catch {
      if (request === token.current) setStatus("error")
    }
  }
  return (
    <div className="min-w-0 rounded-xl border" data-source-browser>
      <div className="flex flex-wrap items-center gap-3 border-b p-3">
        <label htmlFor={id} className="sr-only">
          {t("site.redesign.source")}
        </label>
        <select
          id={id}
          value={selected}
          onChange={(event) => {
            token.current++
            setSelected(event.target.value)
            setStatus("idle")
            setExpanded(false)
          }}
          className="min-h-8 min-w-0 max-w-full flex-1 rounded-md border bg-background px-2 font-mono text-xs [@media(pointer:coarse)]:min-h-11"
        >
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.path}
            </option>
          ))}
        </select>
        {resource && <CopyButton value={resource.code} />}
      </div>
      {!resource ? (
        <div className="p-4">
          <Button
            variant="outline"
            loading={status === "loading"}
            onClick={() => void load()}
          >
            {t(
              status === "loading"
                ? "site.redesign.sourceLoading"
                : status === "error"
                  ? "site.retry"
                  : "site.redesign.loadSource",
            )}
          </Button>
          {status === "error" && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t("site.redesign.sourceError")}
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            data-source-loaded="true"
            tabIndex={0}
            role="region"
            aria-label={file?.path}
            className={`code-block overflow-auto overscroll-contain ${expanded ? "max-h-[70vh]" : "max-h-80"}`}
            dangerouslySetInnerHTML={{ __html: resource.html }}
          />
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {t(
                expanded
                  ? "site.redesign.collapseCode"
                  : "site.redesign.showFull",
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
