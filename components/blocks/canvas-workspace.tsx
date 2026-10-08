"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  Plus,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Trash2,
  Link2,
  Search,
  Keyboard,
  MoreHorizontal,
  Download,
  Upload,
  Group,
  StickyNote,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import {
  CanvasRunControls,
  CanvasExecutionPanel,
  CanvasExecutionInspector,
} from "@/components/blocks/canvas-execution-panel"
import {
  CanvasServicePanel,
  type CanvasServicePanelProps,
} from "@/components/blocks/canvas-service-panel"
import type { CanvasPersistenceController } from "@/lib/use-canvas-persistence"
import type { CanvasRuntimeController } from "@/lib/use-canvas-runtime"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import { WorkflowCanvas } from "@/components/blocks/workflow-canvas"
import { NodePalette } from "@/components/blocks/node-palette"
import {
  NodeInspector,
  type CanvasInspectorDraft,
} from "@/components/blocks/node-inspector"
import { CanvasConnectionForm } from "@/components/blocks/canvas-connection-form"
import { Inspector } from "@/components/blocks/inspector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataRegion, type RegionError } from "@/components/ui/data-region"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  canvasId,
  type CanvasCommand,
  type CanvasCatalogs,
  type CanvasDocument,
  type CanvasFragment,
  type CanvasNodeDefinition,
  type CanvasSelection,
} from "@/lib/canvas-model"
import { copyCanvasFragment } from "@/lib/canvas-commands"
import {
  exportCanvasDocument,
  parseCanvasDocument,
  validateCanvasDocument,
} from "@/lib/canvas-validation"
import type { DataState } from "@/lib/runtime-status"
import styles from "./canvas-controls.module.css"

export type CanvasWorkspaceProps = {
  layout?: "preview" | "fill"
  document: CanvasDocument
  definitions: CanvasNodeDefinition[]
  selection: CanvasSelection
  onSelectionChange: (selection: CanvasSelection) => void
  onCommand?: (command: CanvasCommand) => void
  readOnly?: boolean
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  state?: DataState
  error?: RegionError
  onRetry?: () => void
  refreshing?: boolean
  feedback?: string
  onDirtyChange?: (dirty: boolean) => void
  services?: CanvasServicePanelProps
  persistence?: CanvasPersistenceController
  runtime?: CanvasRuntimeController
  catalogs?: CanvasCatalogs
  viewport?: CanvasDocument["viewport"]
  onViewportChange?: (viewport: NonNullable<CanvasDocument["viewport"]>) => void
  onOpenNode?: (nodeId: string) => void
}
function fingerprint(document: CanvasDocument) {
  return JSON.stringify({ ...document, revision: 0 })
}
export function CanvasWorkspace({
  layout = "preview",
  document: graph,
  definitions,
  selection,
  onSelectionChange,
  onCommand,
  readOnly = false,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  state = "success",
  error,
  onRetry,
  refreshing,
  feedback,
  onDirtyChange,
  runtime,
  persistence,
  services,
  catalogs,
  viewport,
  onViewportChange,
  onOpenNode,
}: CanvasWorkspaceProps) {
  const [collapsed, setCollapsed] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [commandQuery, setCommandQuery] = useState("")
  const [inspectorView, setInspectorView] = useState("config")
  const [bottomView, setBottomView] = useState("validation")
  const [bottomOpen, setBottomOpen] = useState(layout !== "fill")
  const bottomId = useId()
  const locked = readOnly || !onCommand
  const [dialog, setDialog] = useState<
    | "palette"
    | "connect"
    | "operations"
    | "help"
    | "json"
    | "nodes"
    | "commands"
    | null
  >(null)
  const [query, setQuery] = useState("")
  const [json, setJson] = useState("")
  const [fileError, setFileError] = useState("")
  const [localFeedback, setLocalFeedback] = useState("")
  const [locate, setLocate] = useState<{ id: string; request: number }>()
  const [checkpoint, setCheckpoint] = useState(() => fingerprint(graph))
  const [draftStore, setDraftStore] = useState<
    Record<string, CanvasInspectorDraft>
  >({})
  const clipboard = useRef<CanvasFragment | null>(null)
  const [hasClipboard, setHasClipboard] = useState(false)
  const issues = useMemo(
    () => validateCanvasDocument(graph, definitions),
    [graph, definitions],
  )
  const dirty = persistence
    ? persistence.state.status !== "saved"
    : fingerprint(graph) !== checkpoint
  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])
  const edge = graph.edges.find((item) => item.id === selection.edgeIds[0])
  const note = graph.notes.find((item) => item.id === selection.noteId)
  const frame = graph.frames.find((item) => item.id === selection.frameId)
  const anySelected = !!(
    selection.nodeIds.length ||
    selection.edgeIds.length ||
    frame ||
    note
  )
  useEffect(() => {
    if (!dirty) return
    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => window.removeEventListener("beforeunload", beforeUnload)
  }, [dirty])
  function command(command: CanvasCommand) {
    if (!locked) {
      setLocalFeedback("")
      onCommand?.(command)
    }
  }
  function add(definition: CanvasNodeDefinition) {
    if (locked) return
    setRecent((current) =>
      [
        definition.type,
        ...current.filter((type) => type !== definition.type),
      ].slice(0, 5),
    )
    const id = canvasId("node")
    command({
      type: "add",
      node: {
        id,
        type: definition.type,
        title: definition.label,
        position: {
          x: 80 + (graph.nodes.length % 4) * 320,
          y: 80 + Math.floor(graph.nodes.length / 4) * 240,
        },
        config: structuredClone(definition.defaults),
      },
    })
    setDialog(null)
    setLocate({ id, request: Date.now() })
  }
  function remove() {
    if (frame) command({ type: "delete-frame", frameId: frame.id })
    else if (note) command({ type: "delete-note", noteId: note.id })
    else command({ type: "delete", selection })
  }
  function copy() {
    clipboard.current = copyCanvasFragment(graph, selection.nodeIds)
    setHasClipboard(!!clipboard.current.nodes.length)
    setLocalFeedback(
      clipboard.current.nodes.length
        ? "已复制到画布内存剪贴板。"
        : "请先选择要复制的节点。",
    )
  }
  function paste() {
    if (clipboard.current)
      command({ type: "paste", fragment: clipboard.current })
  }
  function align(axis: "x" | "y" | "distribute") {
    const members = graph.nodes
      .filter((node) => selection.nodeIds.includes(node.id))
      .sort((a, b) => a.position.x - b.position.x)
    if (locked || members.length < 2) return
    const origin = members[0].position,
      step = (members.at(-1)!.position.x - origin.x) / (members.length - 1)
    command({
      type: "move",
      positions: Object.fromEntries(
        members.map((node, index) => [
          node.id,
          {
            x:
              axis === "x"
                ? origin.x
                : axis === "distribute"
                  ? Math.round((origin.x + step * index) / 4) * 4
                  : node.position.x,
            y: axis === "y" ? origin.y : node.position.y,
          },
        ]),
      ),
    })
  }
  function group() {
    const members = graph.nodes.filter((node) =>
      selection.nodeIds.includes(node.id),
    )
    if (!members.length) return
    const x = Math.min(...members.map((node) => node.position.x)) - 24,
      y = Math.min(...members.map((node) => node.position.y)) - 64
    command({
      type: "frame",
      nodeIds: members.map((node) => node.id),
      frame: {
        id: canvasId("frame"),
        title: "流程分组",
        position: { x, y },
        width: Math.max(...members.map((node) => node.position.x)) - x + 264,
        height: Math.max(...members.map((node) => node.position.y)) - y + 264,
      },
    })
  }
  function selectNode(id: string, additive = false) {
    const parentId = graph.nodes.find((node) => node.id === id)?.parentId
    if (parentId)
      setCollapsed((current) => current.filter((id) => id !== parentId))
    onSelectionChange({
      nodeIds: additive
        ? selection.nodeIds.includes(id)
          ? selection.nodeIds.filter((value) => value !== id)
          : [...selection.nodeIds, id]
        : [id],
      edgeIds: [],
    })
    setLocate({ id, request: Date.now() })
  }
  const palette = (
    <NodePalette
      definitions={definitions}
      recentTypes={recent}
      onAdd={add}
      readOnly={locked}
    />
  )
  const nodeList = (
    <div className={styles.navigation}>
      <label className={styles.field}>
        查找图中节点
        <Input
          aria-label="查找图中节点"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="节点标题或 ID"
        />
      </label>
      <ul className={styles.list}>
        {graph.nodes
          .filter((node) =>
            `${node.title} ${node.id}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
          )
          .map((node) => (
            <li key={node.id}>
              <button
                className={styles.nodeLink}
                aria-label={`定位 ${node.title}`}
                aria-pressed={selection.nodeIds.includes(node.id)}
                onClick={(event) => selectNode(node.id, event.shiftKey)}
              >
                {node.title}
              </button>
            </li>
          ))}
      </ul>
      {!graph.nodes.some((node) =>
        `${node.title} ${node.id}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ) && <p className={styles.muted}>没有匹配的图中节点。</p>}
    </div>
  )
  const operations = (
    <div className={styles.actions}>
      <Button
        variant="outline"
        disabled={!selection.nodeIds.length}
        onClick={copy}
      >
        <Copy />
        复制节点
      </Button>
      <Button
        variant="outline"
        disabled={locked || !hasClipboard}
        onClick={paste}
      >
        <ClipboardPaste />
        粘贴节点
      </Button>
      <Button
        variant="outline"
        disabled={locked || !anySelected}
        onClick={remove}
      >
        <Trash2 />
        {frame ? "删除分组并解组" : "删除选中对象"}
      </Button>
      <Button
        variant="outline"
        disabled={locked || !selection.nodeIds.length}
        onClick={group}
      >
        <Group />
        将选中节点分组
      </Button>
      <Button
        variant="outline"
        disabled={locked || selection.nodeIds.length < 2}
        onClick={() => align("x")}
      >
        左对齐
      </Button>
      <Button
        variant="outline"
        disabled={locked || selection.nodeIds.length < 2}
        onClick={() => align("y")}
      >
        顶对齐
      </Button>
      <Button
        variant="outline"
        disabled={locked || selection.nodeIds.length < 3}
        onClick={() => align("distribute")}
      >
        水平分布
      </Button>
      <Button
        variant="outline"
        disabled={locked}
        onClick={() =>
          command({
            type: "note",
            note: {
              id: canvasId("note"),
              text: "说明此处流程的意图。",
              position: { x: 80, y: 400 },
            },
          })
        }
      >
        <StickyNote />
        添加便笺
      </Button>
    </div>
  )
  return (
    <div
      data-canvas-workspace
      data-layout={layout}
      className={layout === "fill" ? styles.fill : undefined}
      data-revision={graph.revision}
      data-node-count={graph.nodes.length}
      data-edge-count={graph.edges.length}
      onKeyDown={(event) => {
        if (
          event.nativeEvent.isComposing ||
          !(event.target instanceof Element) ||
          event.target.closest(
            "input, textarea, select, [contenteditable=true], [role=dialog]",
          )
        )
          return
        const modifier = event.metaKey || event.ctrlKey
        if (modifier && event.key.toLowerCase() === "k") {
          event.preventDefault()
          setCommandQuery("")
          setDialog("commands")
        } else if (modifier && event.key.toLowerCase() === "c") {
          event.preventDefault()
          copy()
        } else if (!locked && modifier && event.key.toLowerCase() === "v") {
          event.preventDefault()
          paste()
        } else if (!locked && modifier && event.key.toLowerCase() === "z") {
          event.preventDefault()
          if (event.shiftKey) onRedo?.()
          else onUndo?.()
        } else if (!locked && modifier && event.key.toLowerCase() === "a") {
          event.preventDefault()
          onSelectionChange({
            nodeIds: graph.nodes.map((node) => node.id),
            edgeIds: [],
          })
        } else if (
          !locked &&
          (event.key === "Delete" || event.key === "Backspace") &&
          anySelected
        ) {
          event.preventDefault()
          remove()
        } else if (event.key === "?") {
          event.preventDefault()
          setDialog("help")
        }
      }}
    >
      <WorkspaceShell
        className={styles.workspace}
        title={
          <span>
            Canvas · {locked ? "只读" : "本地草稿"}
            {dirty ? " · 未导出修改" : ""}
          </span>
        }
        sidebar={
          <>
            <div className={styles.sidebarFull}>
              {palette}
              {nodeList}
            </div>
            <div className={styles.sidebarSmall}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="打开节点目录"
                onClick={() => setDialog("palette")}
              >
                <Plus />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="查找图中节点"
                onClick={() => setDialog("nodes")}
              >
                <Search />
              </Button>
            </div>
          </>
        }
        toolbar={
          <div className={styles.toolbar}>
            <Button
              size="sm"
              disabled={locked}
              onClick={() => setDialog("palette")}
            >
              <Plus />
              添加节点
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="撤销编辑"
              disabled={locked || !canUndo}
              onClick={onUndo}
            >
              <Undo2 />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="重做编辑"
              disabled={locked || !canRedo}
              onClick={onRedo}
            >
              <Redo2 />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={locked}
              onClick={() => setDialog("connect")}
            >
              <Link2 />
              连接端口
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="打开画布操作"
              onClick={() => setDialog("operations")}
            >
              <MoreHorizontal />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="查找图中节点"
              onClick={() => setDialog("nodes")}
            >
              <Search />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setJson(exportCanvasDocument(graph))
                setFileError("")
                setDialog("json")
              }}
            >
              JSON
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="键盘快捷键"
              onClick={() => setDialog("help")}
            >
              <Keyboard />
            </Button>
            {persistence && (
              <div className={styles.actions} aria-label="文档保存">
                <span role="status">
                  {
                    {
                      saved: "服务已确认保存",
                      dirty: "未保存修改",
                      saving: "保存中",
                      error: "保存失败",
                      conflict: "版本冲突",
                      unknown: "保存结果未确认",
                    }[persistence.state.status]
                  }{" "}
                  · {persistence.state.serverRevision}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    locked ||
                    !["dirty", "error"].includes(persistence.state.status)
                  }
                  onClick={persistence.save}
                >
                  保存文档
                </Button>
                {persistence.state.status === "unknown" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={persistence.query}
                  >
                    查询保存回执
                  </Button>
                )}
                {persistence.state.message && (
                  <span className={styles.muted}>
                    {persistence.state.message}
                  </span>
                )}
              </div>
            )}
            {runtime && (
              <CanvasRunControls
                runtime={runtime}
                document={graph}
                definitions={definitions}
                nodeId={selection.nodeIds[0]}
                readOnly={locked}
              />
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCommandQuery("")
                setDialog("commands")
              }}
            >
              命令搜索
            </Button>
            <span>
              {graph.nodes.length} 节点 · {graph.edges.length} 连线
            </span>
          </div>
        }
        inspectorTitle="节点与连接"
        inspector={
          <>
            {(runtime || services) && (
              <div className={styles.actions}>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-pressed={inspectorView === "config"}
                  onClick={() => setInspectorView("config")}
                >
                  配置
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-pressed={inspectorView === "execution"}
                  onClick={() => setInspectorView("execution")}
                >
                  执行详情
                </Button>
              </div>
            )}
            {runtime && inspectorView === "execution" ? (
              <CanvasExecutionInspector
                runtime={runtime}
                document={graph}
                definitions={definitions}
                nodeId={selection.nodeIds[0]}
                readOnly={locked}
              />
            ) : edge ? (
              <Inspector
                object={{
                  id: edge.id,
                  title: edge.label ?? "连线",
                  kind: "Edge",
                  metadata: [
                    { label: "来源", value: edge.source },
                    { label: "目标", value: edge.target },
                  ],
                }}
              >
                <CanvasConnectionForm
                  key={`${edge.id}:${graph.revision}`}
                  document={graph}
                  definitions={definitions}
                  edge={edge}
                  onCommand={command}
                  readOnly={locked}
                />
              </Inspector>
            ) : note ? (
              <NoteInspector
                key={note.id}
                note={note}
                onCommand={command}
                readOnly={locked}
              />
            ) : frame ? (
              <Inspector
                object={{
                  id: frame.id,
                  title: frame.title,
                  kind: "Frame",
                  metadata: [
                    {
                      label: "成员数",
                      value: graph.nodes.filter(
                        (node) => node.parentId === frame.id,
                      ).length,
                    },
                  ],
                }}
              >
                <p className={styles.muted}>
                  此分组仅组织视觉。移动分组会整体移动成员。折叠隐藏成员及其连线，不删除图文档。
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCollapsed((current) =>
                      current.includes(frame.id)
                        ? current.filter((id) => id !== frame.id)
                        : [...current, frame.id],
                    )
                  }
                >
                  {collapsed.includes(frame.id) ? "展开分组" : "折叠分组"}
                </Button>
                <p className={styles.muted}>
                  关联连线：
                  {
                    graph.edges.filter((edge) =>
                      graph.nodes.some(
                        (node) =>
                          node.parentId === frame.id &&
                          (node.id === edge.source || node.id === edge.target),
                      ),
                    ).length
                  }{" "}
                  条（原端点保留）
                </p>
                <Button variant="outline" disabled={locked} onClick={remove}>
                  删除分组并解组
                </Button>
              </Inspector>
            ) : (
              <NodeInspector
                document={graph}
                definitions={definitions}
                nodeId={selection.nodeIds[0]}
                catalogs={catalogs}
                draftStore={draftStore}
                onDraftStoreChange={setDraftStore}
                onCommand={command}
                readOnly={locked}
                issues={issues}
              />
            )}
          </>
        }
        bottomPanelResizable
        bottomPanelCollapsed={!bottomOpen}
        bottomPanel={
          <div className={styles.bottom} data-collapsed={!bottomOpen}>
            <div className={styles.bottomTabs}>
              <Button
                size="sm"
                variant="ghost"
                aria-pressed={bottomView === "validation"}
                onClick={() => {
                  setBottomView("validation")
                  setBottomOpen(true)
                }}
              >
                文档校验{issues.length > 0 ? ` · ${issues.length}` : ""}
              </Button>
              {runtime && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-pressed={bottomView === "execution"}
                  onClick={() => {
                    setBottomView("execution")
                    setBottomOpen(true)
                  }}
                >
                  执行调试
                </Button>
              )}
              {services && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-pressed={bottomView === "services"}
                  onClick={() => {
                    setBottomView("services")
                    setBottomOpen(true)
                  }}
                >
                  服务接入
                </Button>
              )}
              {!bottomOpen && (localFeedback || feedback) && (
                <span role="status" className={styles.bottomFeedback}>
                  {localFeedback || feedback}
                </span>
              )}
              <Button
                size="icon-sm"
                variant="ghost"
                className={styles.bottomToggle}
                aria-label={bottomOpen ? "收起底部面板" : "展开底部面板"}
                aria-expanded={bottomOpen}
                aria-controls={bottomId}
                onClick={() => setBottomOpen((open) => !open)}
              >
                {bottomOpen ? <ChevronDown /> : <ChevronUp />}
              </Button>
            </div>
            <div
              id={bottomId}
              hidden={!bottomOpen}
              className={styles.bottomBody}
            >
              {services && bottomView === "services" ? (
                <CanvasServicePanel
                  {...services}
                  readOnly={locked || services.readOnly}
                />
              ) : runtime && bottomView === "execution" ? (
                <CanvasExecutionPanel
                  runtime={runtime}
                  document={graph}
                  definitions={definitions}
                />
              ) : (
                <>
                  <div className={styles.actions}>
                    <h3>文档校验 · {issues.length} 项</h3>
                    <span className={styles.muted}>
                      {persistence ? (
                        persistence.state.status === "saved" ? (
                          "服务已确认当前版本"
                        ) : (
                          "本地草稿等待服务确认"
                        )
                      ) : (
                        <>
                          {dirty ? "有未导出修改" : "当前初始版本或已导出版本"}{" "}
                          · 内存文档，刷新或离开后丢失
                        </>
                      )}
                    </span>
                  </div>
                  <p role="status" aria-live="polite" className={styles.muted}>
                    {localFeedback ||
                      feedback ||
                      "可从节点目录添加，也可通过连接端口表单构图。"}
                  </p>
                  {issues.length ? (
                    <ul>
                      {issues.map((issue, index) => (
                        <li key={index}>
                          <button
                            className={styles.nodeLink}
                            onClick={() => {
                              if (issue.nodeId) selectNode(issue.nodeId)
                              else if (issue.edgeId)
                                onSelectionChange({
                                  nodeIds: [],
                                  edgeIds: [issue.edgeId],
                                })
                            }}
                          >
                            {issue.severity === "error" ? "错误" : "提示"} ·{" "}
                            {issue.message}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.muted}>
                      未发现结构或配置问题。这不表示流程已执行。
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        }
      >
        <div className={styles.canvasRegion}>
          <DataRegion
            state={
              state === "success" &&
              !graph.nodes.length &&
              !graph.notes.length &&
              !graph.frames.length
                ? "empty"
                : state
            }
            hasContent={
              !!(
                graph.nodes.length ||
                graph.notes.length ||
                graph.frames.length
              )
            }
            error={error}
            onRetry={onRetry}
            refreshing={refreshing}
            emptyTitle="从一个节点开始构图"
            emptyDescription="添加 Input、Agent、Tool 和 Output，并连接它们的端口。"
            emptyAction={
              <Button disabled={locked} onClick={() => setDialog("palette")}>
                添加第一个节点
              </Button>
            }
            partialDescription="图文档尚未完整，保留当前已读取的内容。"
          >
            <div className={styles.canvasSurface}>
              <WorkflowCanvas
                document={graph}
                definitions={definitions}
                execution={runtime?.state.snapshot}
                collapsedFrameIds={collapsed}
                viewport={viewport}
                onViewportChange={onViewportChange}
                onOpenNode={onOpenNode}
                selection={selection}
                onSelectionChange={onSelectionChange}
                onCommand={command}
                readOnly={locked}
                issues={issues}
                focusRequest={locate}
                onContextMenu={() => setDialog("operations")}
              />
            </div>
          </DataRegion>
        </div>
      </WorkspaceShell>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
      >
        <DialogContent className={styles.dialog}>
          <DialogTitle>
            {
              {
                palette: "添加节点",
                connect: "连接端口",
                operations: "画布操作",
                help: "键盘快捷键",
                json: "图文档 JSON",
                nodes: "查找图中节点",
                commands: "命令搜索",
              }[dialog ?? "help"]
            }
          </DialogTitle>
          <DialogDescription>
            {dialog === "json"
              ? "导出仅含脱敏后的图配置，不含运行快照。导入会替换本地草稿，可撤销。"
              : "所有修改仅作用于当前内存图文档。"}
          </DialogDescription>
          {dialog === "palette" && palette}
          {dialog === "nodes" && nodeList}
          {dialog === "commands" && (
            <div className={styles.form}>
              <Input
                aria-label="搜索命令或节点"
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="添加、定位、对齐、撤销"
              />
              {[
                ...definitions.map((def) => ({
                  id: `add-${def.type}`,
                  label: `添加 ${def.label}`,
                  disabled: locked,
                  action: () => add(def),
                })),
                ...graph.nodes.map((node) => ({
                  id: `locate-${node.id}`,
                  label: `定位 ${node.title}`,
                  disabled: false,
                  action: () => selectNode(node.id),
                })),
                {
                  id: "undo",
                  label: "撤销编辑",
                  disabled: locked || !canUndo,
                  action: () => onUndo?.(),
                },
                {
                  id: "align",
                  label: "左对齐",
                  disabled: locked || selection.nodeIds.length < 2,
                  action: () => align("x"),
                },
              ]
                .filter((item) =>
                  item.label.toLowerCase().includes(commandQuery.toLowerCase()),
                )
                .slice(0, 50)
                .map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    disabled={item.disabled}
                    onClick={() => {
                      item.action()
                      setDialog(null)
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              <p className={styles.muted}>
                显示前 50 项；输入名称缩小范围。Tab 选择命令，Enter 执行，Escape
                关闭。
              </p>
            </div>
          )}
          {dialog === "operations" && operations}
          {dialog === "connect" && (
            <CanvasConnectionForm
              document={graph}
              definitions={definitions}
              onCommand={command}
              readOnly={locked}
            />
          )}
          {dialog === "help" && (
            <dl className={styles.shortcut}>
              <dt>Shift + 点击 / 框选</dt>
              <dd>多选节点</dd>
              <dt>方向键 / Shift + 方向键</dt>
              <dd>移动焦点节点 8 / 32px</dd>
              <dt>Ctrl / ⌘ + A</dt>
              <dd>选择全部节点</dd>
              <dt>Ctrl / ⌘ + C / V</dt>
              <dd>复制 / 粘贴节点</dd>
              <dt>Delete / Backspace</dt>
              <dd>删除选中对象</dd>
              <dt>Ctrl / ⌘ + Z / Shift + Z</dt>
              <dd>撤销 / 重做</dd>
              <dt>Escape</dt>
              <dd>关闭弹窗并返回触发按钮</dd>
              <dt>连接端口按钮</dt>
              <dd>无须拖线的连接方式</dd>
            </dl>
          )}
          {dialog === "json" && (
            <div className={styles.stack}>
              <label className={styles.field}>
                图文档内容
                <textarea
                  aria-label="图文档内容"
                  className={styles.json}
                  value={json}
                  readOnly={locked}
                  onChange={(event) => setJson(event.target.value)}
                  spellCheck={false}
                />
              </label>
              <label className={styles.field}>
                读取 JSON 文件
                <input
                  type="file"
                  accept=".json,application/json"
                  disabled={locked}
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    try {
                      if (file.size > 524288)
                        throw new Error("文件超过512KiB限制。")
                      setJson(await file.text())
                      setFileError("")
                    } catch (error) {
                      setFileError(
                        error instanceof Error
                          ? error.message
                          : "读取文件失败，原图已保留。",
                      )
                    }
                  }}
                />
              </label>
              <div className={styles.actions}>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        exportCanvasDocument(graph),
                      )
                      setCheckpoint(fingerprint(graph))
                      setLocalFeedback(
                        "已复制脱敏图文档；本地草稿仍仅存于内存。",
                      )
                      setFileError("")
                    } catch {
                      setFileError("复制失败，草稿已保留。可以下载 JSON 文件。")
                    }
                  }}
                >
                  复制脱敏 JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    try {
                      const blob = new Blob([exportCanvasDocument(graph)], {
                        type: "application/json",
                      })
                      const url = URL.createObjectURL(blob)
                      const anchor = window.document.createElement("a")
                      anchor.href = url
                      anchor.download = `${graph.id}.json`
                      anchor.click()
                      setTimeout(() => URL.revokeObjectURL(url), 1000)
                      setCheckpoint(fingerprint(graph))
                      setLocalFeedback("已发起图文档下载，请保留下载文件。")
                      setFileError("")
                    } catch {
                      setFileError("导出失败，草稿已保留。")
                    }
                  }}
                >
                  <Download />
                  下载 JSON
                </Button>
                <Button
                  disabled={locked}
                  onClick={() => {
                    try {
                      const document = parseCanvasDocument(json, definitions)
                      command({ type: "replace", document })
                      setFileError("")
                      setDialog(null)
                    } catch (error) {
                      setFileError(
                        error instanceof Error
                          ? error.message
                          : "导入失败，原图已保留。",
                      )
                    }
                  }}
                >
                  <Upload />
                  校验并替换草稿
                </Button>
              </div>
              {fileError && (
                <p role="alert" className={styles.error}>
                  {fileError} 原文档未被覆盖。
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
function NoteInspector({
  note,
  onCommand,
  readOnly,
}: {
  note: CanvasDocument["notes"][number]
  onCommand: (command: CanvasCommand) => void
  readOnly: boolean
}) {
  const [text, setText] = useState(note.text)
  return (
    <Inspector
      object={{
        id: note.id,
        title: "流程说明",
        kind: "StickyNote",
        metadata: [{ label: "ID", value: note.id }],
      }}
    >
      <label className={styles.field}>
        便笺正文
        <textarea
          value={text}
          disabled={readOnly}
          maxLength={4000}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <Button
        disabled={readOnly || !text.trim()}
        onClick={() =>
          onCommand({ type: "update-note", noteId: note.id, text })
        }
      >
        应用便笺
      </Button>
    </Inspector>
  )
}
