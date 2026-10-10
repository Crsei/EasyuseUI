"use client"

import { useState } from "react"
import { CodePreview } from "@/components/blocks/code-preview"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { useI18n } from "@/lib/i18n-provider"
import type { DataState } from "@/lib/runtime-status"

const sample = `// This is a read-only source snapshot.
export type Session = { id: string; title: string }

const authorization = "Bearer demo-private-token"
export function selectSession(sessions: Session[], id: string) {
  return sessions.find((session) => session.id === id)
}
`

/** A local fixture: no file read, save, or runtime operation is performed. */
export function CodePreviewDemo() {
  const [state, setState] = useState<DataState>("success")
  const { locale } = useI18n()
  const labels = locale === "en"
    ? { success: "Content", partial: "Partial", error: "Read error", empty: "Empty", loading: "Loading", retry: "Retry" }
    : { success: "内容", partial: "部分内容", error: "读取错误", empty: "空内容", loading: "加载中", retry: "重试" }
  return (
    <div className="min-w-0">
      <ButtonGroup className="mb-2 flex-wrap">
        {(["success", "partial", "error", "empty", "loading"] as const).map((value) => (
          <Button key={value} size="sm" variant="ghost" aria-pressed={state === value} onClick={() => setState(value)}>
            {labels[value]}
          </Button>
        ))}
      </ButtonGroup>
      <CodePreview
        identity="fixture:src/session.ts"
        revision="fixture-v1"
        path="src/session.ts"
        code={state === "empty" ? "" : sample}
        state={state}
        incomplete={state === "partial"}
        error={state === "error" ? { category: "request", message: labels.error, reason: locale === "en" ? "Fixture read failed" : "模拟读取失败" } : undefined}
        onRetry={() => setState("success")}
        highlightRange={{ start: 4, end: 6 }}
      />
    </div>
  )
}
