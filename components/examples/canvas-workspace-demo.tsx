"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useEffect, useState } from "react"
import { CanvasPlaybackToolbar, useCanvasPlayback } from "./canvas-playback"
import { CanvasWorkspace } from "@/components/blocks/canvas-workspace"
import { Button } from "@/components/ui/button"
import { useCanvasEditor } from "@/lib/use-canvas-editor"
import { useCanvasRuntime } from "@/lib/use-canvas-runtime"
import {
  createCanvasRuntimeFixture,
  type CanvasFixtureScenario,
} from "./canvas-runtime-fixture"
import { createCanvasDocument } from "@/lib/canvas-model"
import type { DataState } from "@/lib/runtime-status"
import styles from "./canvas-demo.module.css"
import {
  basicCanvasDocument,
  branchCanvasDocument,
  canvasDefinitions,
  stressCanvasDocument,
  stressDefinitions,
  agentCanvasDefinitions,
  agentCanvasDocument,
  canvasCatalogs,
} from "./canvas-fixtures"

export function CanvasWorkspaceDemo({
  stressSize,
  layout = "preview",
}: { stressSize?: 200; layout?: "preview" | "fill" } = {}) {
  const { t } = useSiteI18n()

  const [fixture] = useState(createCanvasRuntimeFixture)
  const [extensions, setExtensions] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [state, setState] = useState<DataState>("success")
  const [dirty, setDirty] = useState(false)
  const [stress, setStress] = useState(!!stressSize)
  const [initial] = useState(() =>
    stressSize ? stressCanvasDocument(stressSize) : basicCanvasDocument(),
  )
  const definitions = stress
    ? stressDefinitions
    : extensions
      ? agentCanvasDefinitions
      : canvasDefinitions
  const editor = useCanvasEditor(
    initial,
    [
      ...stressDefinitions,
      ...agentCanvasDefinitions.filter(
        (def) => !stressDefinitions.some((item) => item.type === def.type),
      ),
    ],
    { readOnly },
  )
  const runtime = useCanvasRuntime(
    editor.document,
    definitions,
    fixture.adapter,
  )
  const playback = useCanvasPlayback(editor.document, runtime, fixture)
  useEffect(() => {
    if (!dirty) return
    function leave(event: MouseEvent) {
      const anchor =
        event.target instanceof Element
          ? (event.target.closest("a[href]") as HTMLAnchorElement | null)
          : null
      if (
        !anchor ||
        anchor.download ||
        anchor.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        anchor.href === window.location.href ||
        (anchor.hash && anchor.pathname === window.location.pathname)
      )
        return
      if (
        !window.confirm(t("site.theGraphHasChangesThatHaveNotBeenExported"))
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.document.addEventListener("click", leave, true)
    return () => window.document.removeEventListener("click", leave, true)
  }, [dirty, t])
  const controls = (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label={t("site.localCanvasDemoScenarios")}
    >
      <span className="text-xs text-muted-foreground">
        {t("site.localDemo")}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={readOnly}
        onClick={() => {
          setStress(false)
          setExtensions(true)
          editor.onCommand({
            type: "replace",
            document: agentCanvasDocument(),
          })
        }}
      >
        {t("site.agentExtensions")}
      </Button>
      <label className="text-xs">
        {t("site.runFixture")}{" "}
        <select
          aria-label={t("site.runFixture")}
          className="h-8 rounded border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
          onChange={(event) =>
            fixture.setScenario(event.target.value as CanvasFixtureScenario)
          }
        >
          <option value="success">{t("site.normal")}</option>
          <option value="failure">{t("site.failed")}</option>
          <option value="approval">{t("site.awaitingApproval")}</option>
          <option value="unknown">{t("site.lostResponse")}</option>
          <option value="disconnect">
            {t("site.disconnectedReadFailure")}
          </option>
        </select>
      </label>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const previous = fixture.getPrevious()
          if (previous) runtime.receive(previous)
        }}
      >
        {t("site.injectAnEventFromAnOldRun")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={readOnly}
        onClick={() => {
          editor.onCommand({
            type: "replace",
            document: createCanvasDocument(),
          })
          setState("success")
        }}
      >
        {t("site.emptyGraph")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={readOnly}
        onClick={() => {
          editor.onCommand({
            type: "replace",
            document: basicCanvasDocument(),
          })
          setState("success")
        }}
      >
        {t("site.basicAgentWorkflow")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={readOnly}
        onClick={() => {
          editor.onCommand({
            type: "replace",
            document: branchCanvasDocument(),
          })
          setState("success")
        }}
      >
        {t("site.conditionalBranch")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        aria-pressed={readOnly}
        onClick={() => setReadOnly((value) => !value)}
      >
        {t("site.readOnlyMode")}
      </Button>
      <label className="text-xs">
        {t("site.dataScenario")}{" "}
        <select
          className="h-8 rounded border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
          aria-label={t("site.canvasDataScenario")}
          value={state}
          onChange={(event) => setState(event.target.value as DataState)}
        >
          <option value="success">{t("site.complete")}</option>
          <option value="loading">{t("site.loading2")}</option>
          <option value="partial">{t("site.partialData")}</option>
          <option value="error">{t("site.refreshFailed")}</option>
          <option value="empty">{t("site.emptyState")}</option>
        </select>
      </label>
      <Button
        size="sm"
        variant="outline"
        disabled={readOnly}
        onClick={() => {
          setStress(true)
          editor.onCommand({
            type: "replace",
            document: stressCanvasDocument(50),
          })
        }}
      >
        {t("site.50Nodes")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={readOnly}
        onClick={() => {
          setStress(true)
          editor.onCommand({
            type: "replace",
            document: stressCanvasDocument(200),
          })
        }}
      >
        {t("site.200Nodes")}
      </Button>
    </div>
  )
  return (
    <div className={layout === "fill" ? styles.fill : "space-y-4"}>
      {layout === "fill" ? (
        <details className={styles.options} data-canvas-fixtures>
          <summary>
            <span>{t("site.demoScenarios")}</span>
            <span>{t("site.localInMemoryDraftExportJsonToKeepIt")}</span>
          </summary>
          {controls}
        </details>
      ) : (
        controls
      )}
      <CanvasWorkspace
        layout={layout}
        {...editor}
        definitions={definitions}
        runtime={runtime}
        executionVisuals={playback.visuals}
        runtimeToolbar={<CanvasPlaybackToolbar playback={playback} />}
        catalogs={canvasCatalogs}
        readOnly={readOnly}
        state={state}
        error={
          state === "error"
            ? {
                category: "network",
                message: t("site.demoGraphDocumentRefreshFailed"),
                reason: t(
                  "site.existingLocalDraftPreservedThisScenarioMakesNoReal",
                ),
              }
            : undefined
        }
        onRetry={() => setState("success")}
        onDirtyChange={setDirty}
      />
    </div>
  )
}
