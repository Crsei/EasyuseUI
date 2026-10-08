"use client"

import { useEffect, useMemo, useState } from "react"
import { CanvasWorkspace } from "@/components/blocks/canvas-workspace"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  applyCanvasCommand,
  commitCanvasHistory,
  createCanvasHistory,
  stepCanvasHistory,
  type CanvasHistory,
} from "@/lib/canvas-commands"
import {
  canvasInvocation,
  canvasProjectDefinitions,
  exportCanvasProject,
  parseCanvasProject,
  validateCanvasProject,
  type CanvasProject,
} from "@/lib/canvas-project"
import {
  createCanvasDocument,
  emptyCanvasSelection,
  type CanvasCommand,
  type CanvasDocument,
  type CanvasNodeDefinition,
  type CanvasSelection,
} from "@/lib/canvas-model"
import { redactText } from "@/lib/redact"
import styles from "./canvas-controls.module.css"

export type CanvasProjectWorkspaceProps = {
  layout?: "preview" | "fill"
  project: CanvasProject
  definitions: CanvasNodeDefinition[]
  onChange?: (project: CanvasProject) => void
  readOnly?: boolean
}
/** Controlled project graph. History and view memory are local, never server versions. */
export function CanvasProjectWorkspace({
  layout = "preview",
  project,
  definitions: base,
  onChange,
  readOnly,
}: CanvasProjectWorkspaceProps) {
  const [path, setPath] = useState([project.rootId])
  const [views, setViews] = useState<
    Record<
      string,
      { selection: CanvasSelection; viewport?: CanvasDocument["viewport"] }
    >
  >({})
  const [histories, setHistories] = useState<Record<string, CanvasHistory>>({})
  const [feedback, setFeedback] = useState("")
  const [dialog, setDialog] = useState(false),
    [json, setJson] = useState("")
  const [checkpoint, setCheckpoint] = useState(() =>
    exportCanvasProject(project),
  )
  const definitions = useMemo(
    () => canvasProjectDefinitions(project, base),
    [project, base],
  )
  const flow = project.flows.find((flow) => flow.id === path.at(-1)) ??
    project.flows.find((flow) => flow.id === project.rootId) ?? {
      id: "invalid-project",
      title: "项目不可用",
      document: createCanvasDocument("invalid-project"),
      inputs: [],
      outputs: [],
    }
  const view = views[flow.id] ?? { selection: emptyCanvasSelection }
  const savedHistory = histories[flow.id]
  const history =
    savedHistory?.document.revision === flow.document.revision &&
    JSON.stringify(savedHistory.document) === JSON.stringify(flow.document)
      ? savedHistory
      : createCanvasHistory(flow.document)
  const problems = useMemo(
    () => validateCanvasProject(project, base),
    [project, base],
  )
  const dirty = exportCanvasProject(project) !== checkpoint
  const locked = readOnly || !onChange
  useEffect(() => {
    if (!dirty) return
    const leave = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", leave)
    return () => window.removeEventListener("beforeunload", leave)
  }, [dirty])
  function saveView(change: Partial<typeof view>) {
    setViews((current) => ({
      ...current,
      [flow.id]: { ...(current[flow.id] ?? view), ...change },
    }))
  }
  function apply(next: CanvasHistory, selection = view.selection) {
    if (locked) return
    const candidate = {
      ...project,
      flows: project.flows.map((item) =>
        item.id === flow.id ? { ...item, document: next.document } : item,
      ),
    }
    const problems = validateCanvasProject(candidate, base)
    if (problems.length) {
      setFeedback(problems[0])
      return
    }
    setHistories((current) => ({ ...current, [flow.id]: next }))
    saveView({ selection })
    onChange?.(candidate)
    setFeedback("本地项目草稿已修改，尚未持久化。")
  }
  function command(command: CanvasCommand) {
    if (locked) return
    const result = applyCanvasCommand(flow.document, command, definitions)
    if (!result.ok) {
      setFeedback(result.message)
      return
    }
    const selection = [
      "move",
      "move-frame",
      "move-note",
      "update-note",
    ].includes(command.type)
      ? view.selection
      : result.selection
    apply(commitCanvasHistory(history, result.document), selection)
  }
  function openNode(id: string) {
    const node = flow.document.nodes.find((node) => node.id === id),
      invocation = node && canvasInvocation(node.type)
    if (
      !invocation ||
      !project.flows.some((flow) => flow.id === invocation.flowId)
    )
      return
    if (path.includes(invocation.flowId)) {
      setFeedback("禁止递归进入当前路径中的流程。")
      return
    }
    setPath((current) => [...current, invocation.flowId])
  }
  const selected = flow.document.nodes.find(
    (node) => node.id === view.selection.nodeIds[0],
  )
  return (
    <div
      className={`${styles.form} ${layout === "fill" ? styles.projectFill : ""}`}
      data-canvas-project
      data-active-flow={flow.id}
    >
      <div className={styles.actions} aria-label="子流程路径">
        {path.map((id, index) => (
          <Button
            key={`${id}:${index}`}
            variant="ghost"
            size="sm"
            aria-current={id === flow.id ? "page" : undefined}
            onClick={() => setPath(path.slice(0, index + 1))}
          >
            {redactText(
              project.flows.find((flow) => flow.id === id)?.title ?? id,
            )}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          disabled={!selected || !canvasInvocation(selected.type)}
          onClick={() => selected && openNode(selected.id)}
        >
          进入子流程
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setJson(exportCanvasProject(project))
            setDialog(true)
          }}
        >
          项目 JSON
        </Button>
        <span className={styles.muted}>
          {dirty ? "项目有未导出修改" : "初始项目或已导出版本"} ·{" "}
          {project.flows.length} 个流程 · 内存草稿
        </span>
      </div>
      <p className={styles.muted}>
        边界：
        {flow.inputs.map((port) => `${port.label} (${port.type})`).join("、") ||
          "无输入"}{" "}
        →{" "}
        {flow.outputs
          .map((port) => `${port.label} (${port.type})`)
          .join("、") || "无输出"}
        。跨流程变量只能通过边界传递。
      </p>
      {problems.length > 0 && (
        <p role="alert" className={styles.error}>
          {problems.join("\n")}
        </p>
      )}
      <p role="status" className={styles.muted}>
        {feedback}
      </p>
      <CanvasWorkspace
        layout={layout}
        key={flow.id}
        document={flow.document}
        definitions={definitions}
        selection={view.selection}
        onSelectionChange={(selection) => saveView({ selection })}
        viewport={view.viewport}
        onViewportChange={(viewport) => saveView({ viewport })}
        onCommand={command}
        readOnly={locked}
        onOpenNode={openNode}
        canUndo={!!history.past.length}
        canRedo={!!history.future.length}
        onUndo={() =>
          apply(stepCanvasHistory(history, "undo"), emptyCanvasSelection)
        }
        onRedo={() =>
          apply(stepCanvasHistory(history, "redo"), emptyCanvasSelection)
        }
        feedback={feedback}
      />
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className={styles.dialog}>
          <DialogTitle>项目 JSON</DialogTitle>
          <DialogDescription>
            包含全部子流程与边界。导入先校验递归、端点、作用域和大小，失败保留项目。
          </DialogDescription>
          <textarea
            aria-label="项目 JSON 文本"
            className={styles.output}
            rows={14}
            value={json}
            onChange={(event) => setJson(event.target.value)}
            spellCheck={false}
          />
          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={() => {
                const text = exportCanvasProject(project),
                  url = URL.createObjectURL(
                    new Blob([text], { type: "application/json" }),
                  ),
                  anchor = document.createElement("a")
                anchor.href = url
                anchor.download = "canvas-project.json"
                anchor.click()
                URL.revokeObjectURL(url)
                setCheckpoint(text)
                setFeedback("已发起脱敏项目下载，不代表服务保存成功。")
              }}
            >
              下载脱敏项目
            </Button>
            <Button
              disabled={locked}
              onClick={() => {
                try {
                  const next = parseCanvasProject(json, base)
                  onChange?.(next)
                  setHistories({})
                  setViews({})
                  setPath([next.rootId])
                  setDialog(false)
                  setFeedback("项目已载入本地草稿。")
                } catch (error) {
                  setFeedback(
                    error instanceof Error ? error.message : "项目导入失败。",
                  )
                }
              }}
            >
              导入项目
            </Button>
          </div>
          <p role="status" className={styles.muted}>
            {feedback}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
