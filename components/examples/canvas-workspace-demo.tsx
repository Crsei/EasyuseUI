"use client"

import { useEffect, useState } from "react"
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
        !window.confirm("有未导出的图修改，离开后内存草稿会丢失。确定离开？")
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.document.addEventListener("click", leave, true)
    return () => window.document.removeEventListener("click", leave, true)
  }, [dirty])
  const controls = (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="本地 Canvas 示例场景"
    >
      <span className="text-xs text-muted-foreground">本地示例：</span>
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
        Agent 扩展
      </Button>
      <label className="text-xs">
        运行 fixture{" "}
        <select
          aria-label="运行 fixture"
          className="h-8 rounded border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
          onChange={(event) =>
            fixture.setScenario(event.target.value as CanvasFixtureScenario)
          }
        >
          <option value="success">正常</option>
          <option value="failure">失败</option>
          <option value="approval">等待审批</option>
          <option value="unknown">响应丢失</option>
          <option value="disconnect">断线 / 重读失败</option>
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
        注入旧运行事件
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
        空图
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
        基础 Agent 流程
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
        条件分支
      </Button>
      <Button
        size="sm"
        variant="outline"
        aria-pressed={readOnly}
        onClick={() => setReadOnly((value) => !value)}
      >
        只读模式
      </Button>
      <label className="text-xs">
        数据场景{" "}
        <select
          className="h-8 rounded border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
          aria-label="Canvas 数据场景"
          value={state}
          onChange={(event) => setState(event.target.value as DataState)}
        >
          <option value="success">完整</option>
          <option value="loading">加载中</option>
          <option value="partial">部分数据</option>
          <option value="error">刷新失败</option>
          <option value="empty">空状态</option>
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
        50 节点
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
        200 节点
      </Button>
    </div>
  )
  return (
    <div className={layout === "fill" ? styles.fill : "space-y-4"}>
      {layout === "fill" ? (
        <details className={styles.options} data-canvas-fixtures>
          <summary>
            <span>示例场景</span>
            <span>本地内存草稿 · 导出 JSON 保留 · 执行由消费方接入</span>
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
        catalogs={canvasCatalogs}
        readOnly={readOnly}
        state={state}
        error={
          state === "error"
            ? {
                category: "network",
                message: "示例：刷新图文档失败",
                reason: "已有本地草稿保留；此场景不请求真实服务。",
              }
            : undefined
        }
        onRetry={() => setState("success")}
        onDirtyChange={setDirty}
      />
    </div>
  )
}
