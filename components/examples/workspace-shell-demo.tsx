"use client"

import { useId, useState } from "react"
import {
  Activity,
  Bot,
  Copy,
  FileText,
  Inbox,
  MessageSquare,
  Plus,
  Search,
  X,
} from "lucide-react"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Item } from "@/components/ui/item"
import { Tree, type TreeNode } from "@/components/ui/tree"
import { SessionRow } from "@/components/blocks/session-row"
import { AgentRow } from "@/components/blocks/agent-row"
import { ActivityTimeline } from "@/components/blocks/activity-timeline"
import { Inspector } from "@/components/blocks/inspector"
import { Conversation, ChatComposer } from "@/components/blocks/chat-message"
import { ToolCall } from "@/components/blocks/tool-call"
import {
  runtimeStatuses,
  runtimeStatusMeta,
  type DataState,
  type RuntimeStatus,
} from "@/lib/runtime-status"
import styles from "./workspace-shell-demo.module.css"

type View = "sessions" | "agents" | "activity" | "chat"
type Entity = { id: string; name: string; kind: string; status: RuntimeStatus }
const initialSessions: Entity[] = [
  {
    id: "session-design",
    name: "整理组件规范",
    kind: "Session",
    status: "running",
  },
  {
    id: "session-tree",
    name: "检查 Session 层级",
    kind: "Session",
    status: "waiting",
  },
  {
    id: "session-review",
    name: "审阅状态语言",
    kind: "Session",
    status: "completed",
  },
]
const agents: Entity[] = [
  { id: "agent-builder", name: "Builder", kind: "Agent", status: "running" },
  { id: "agent-reviewer", name: "Reviewer", kind: "Agent", status: "idle" },
]
const events: Entity[] = [
  {
    id: "event-read",
    name: "读取 Component Specification",
    kind: "Activity",
    status: "completed",
  },
  {
    id: "event-implement",
    name: "构建工作台基础界面",
    kind: "Activity",
    status: "running",
  },
  {
    id: "event-approval",
    name: "等待人工检查尺寸",
    kind: "Activity",
    status: "waiting",
  },
]
const navigation = [
  { id: "sessions", label: "Sessions", Icon: Inbox },
  { id: "agents", label: "Agents", Icon: Bot },
  { id: "activity", label: "Activity", Icon: Activity },
  { id: "chat", label: "Chat", Icon: MessageSquare },
] as const

export function WorkspaceShellDemo() {
  const id = useId()
  const [view, setView] = useState<View>("sessions")
  const [sessions, setSessions] = useState(initialSessions)
  const [selected, setSelected] = useState<Entity | null>(initialSessions[0])
  const [runtime, setRuntime] = useState<RuntimeStatus>("running")
  const [dataState, setDataState] = useState<DataState>("success")
  const [search, setSearch] = useState("")
  const [draft, setDraft] = useState("")
  const [sessionView, setSessionView] = useState<"list" | "tree">("list")
  const [messages, setMessages] = useState<string[]>([])
  const [feedback, setFeedback] = useState("")
  const selectedStatus = (entity: Entity) =>
    entity.id === selected?.id ? runtime : entity.status
  const items = (
    view === "agents" ? agents : view === "activity" ? events : sessions
  ).filter((entity) => entity.name.toLowerCase().includes(search.toLowerCase()))

  function select(entity: Entity) {
    setSelected(entity)
    setRuntime(entity.status)
    setFeedback("")
  }
  function createSession() {
    const entity: Entity = {
      id: `session-local-${sessions.length + 1}`,
      name: `本地 Session ${sessions.length + 1}`,
      kind: "Session",
      status: "idle",
    }
    setSessions((current) => [...current, entity])
    select(entity)
    setView("sessions")
    setSearch("")
    setDataState("success")
    setFeedback("已创建本地演示 Session。")
  }
  function sendMessage() {
    if (!draft.trim()) return
    setMessages((current) => [...current, draft.trim()])
    setDraft("")
    setFeedback("消息已添加到本地演示，未向 Agent 发送请求。")
  }

  const inspector = (
    <Inspector
      object={
        selected
          ? {
              id: selected.id,
              title: selected.name,
              kind: selected.kind,
              status: runtime,
              metadata: [
                { label: "类型", value: selected.kind },
                { label: "ID", value: selected.id, copyValue: selected.id },
                { label: "模型", value: "未连接 · 本地演示" },
                { label: "Tokens" },
                { label: "来源", value: "本地 UI fixture" },
              ],
            }
          : null
      }
    >
      {selected && (
        <section>
          <h3>关联文件</h3>
          <div className={styles.fileRow}>
            <FileText size={16} aria-hidden="true" />
            <span>Component-Specification.md</span>
          </div>
        </section>
      )}
    </Inspector>
  )

  function renderRows() {
    if (view === "activity")
      return (
        <ActivityTimeline
          events={items.map((entity, index) => ({
            id: entity.id,
            time: `16:42:0${index}`,
            agent: "Builder",
            type: "本地事件",
            action: entity.name,
            target: "Component-Specification.md",
            status: selectedStatus(entity),
            duration: "24ms",
            details: <p>本地演示事件，尚未连接真实 Runtime。</p>,
          }))}
          selectedId={selected?.id}
          onSelect={(event) => {
            const entity = events.find((entry) => entry.id === event.id)
            if (entity) select(entity)
          }}
        />
      )
    return (
      <ul className={styles.entityList}>
        {items.map((entity) => (
          <li key={entity.id}>
            {view === "agents" ? (
              <AgentRow
                agent={{
                  id: entity.id,
                  name: entity.name,
                  status: selectedStatus(entity),
                }}
                selected={selected?.id === entity.id}
                onSelect={() => select(entity)}
              />
            ) : (
              <SessionRow
                session={{
                  id: entity.id,
                  title: entity.name,
                  status: selectedStatus(entity),
                  updatedAt: "刚刚更新",
                }}
                selected={selected?.id === entity.id}
                onSelect={() => select(entity)}
              />
            )}
          </li>
        ))}
      </ul>
    )
  }
  const treeNodes: TreeNode[] = [
    {
      id: "idea-design",
      label: "Idea / 工作台设计",
      children: items.map((entity) => ({
        id: entity.id,
        label: entity.name,
        metadata: entity.id,
        status: selectedStatus(entity),
        children:
          entity.id === "session-design"
            ? [
                {
                  id: "run-foundation",
                  label: "Run / 初始化 Foundation",
                  status: "completed",
                },
              ]
            : undefined,
      })),
    },
  ]

  return (
    <div className={styles.demo}>
      <div className={styles.controls}>
        <div>
          <label htmlFor={`${id}-data`}>数据状态</label>
          <select
            id={`${id}-data`}
            value={dataState}
            onChange={(event) => setDataState(event.target.value as DataState)}
          >
            <option value="success">Success · 完整数据</option>
            <option value="loading">Loading · 首次加载</option>
            <option value="empty">Empty · 空状态</option>
            <option value="partial">Partial · 部分数据</option>
            <option value="error">Error · 刷新失败</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-runtime`}>运行状态</label>
          <select
            id={`${id}-runtime`}
            value={runtime}
            onChange={(event) =>
              setRuntime(event.target.value as RuntimeStatus)
            }
          >
            {runtimeStatuses.map((status) => (
              <option key={status} value={status}>
                {status} · {runtimeStatusMeta[status].label}
              </option>
            ))}
          </select>
        </div>
        <span className={styles.fixtureLabel}>本地演示</span>
      </div>
      <WorkspaceShell
        inspectorFooter={
          selected ? (
            <div className={styles.inspectorActions}>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(selected.id)
                    setFeedback("已复制对象 ID。")
                  } catch {
                    setFeedback("无法访问剪贴板，请从 Metadata 手动复制 ID。")
                  }
                }}
              >
                <Copy size={16} />
                复制 ID
              </Button>
              <Button variant="ghost" onClick={() => setView("chat")}>
                查看对话
              </Button>
            </div>
          ) : undefined
        }
        title="EasyuseUI / Agent Workspace"
        sidebar={
          <div className={styles.navigation}>
            <div className={styles.projectMark}>
              <span>e.</span>
              <span className={styles.navLabel}>Agent Workspace</span>
            </div>
            <nav aria-label="工作台页面">
              {navigation.map(({ id: navId, label, Icon }) => (
                <Item
                  key={navId}
                  ariaLabel={label}
                  title={<span className={styles.navLabel}>{label}</span>}
                  leading={<Icon />}
                  density="compact"
                  selected={view === navId}
                  onSelect={() => {
                    setView(navId)
                    setSearch("")
                  }}
                />
              ))}
            </nav>
            <div className={`${styles.navNote} ${styles.navLabel}`}>
              <span>COMPACT DENSITY</span>
              <p>Foundation → Primitive → Pattern → Workspace</p>
            </div>
          </div>
        }
        inspector={inspector}
        inspectorTitle={selected?.kind || "Inspector"}
        toolbar={
          <>
            {view !== "chat" ? (
              <div className={styles.search}>
                <Search size={16} aria-hidden="true" />
                <Input
                  type="search"
                  aria-label="搜索当前列表"
                  placeholder="搜索当前列表…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            ) : (
              <span className={styles.caption}>
                Conversation + Agent Runtime Workspace
              </span>
            )}
            {view === "sessions" && (
              <div className={styles.viewSwitch} aria-label="Session 视图">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={sessionView === "list"}
                  onClick={() => setSessionView("list")}
                >
                  列表视图
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={sessionView === "tree"}
                  onClick={() => setSessionView("tree")}
                >
                  层级视图
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="清除对象选择"
              onClick={() => setSelected(null)}
            >
              <X />
            </Button>
          </>
        }
      >
        <div className={styles.pageHeader}>
          <div>
            <h2>{navigation.find((item) => item.id === view)?.label}</h2>
            <p>
              {view === "chat"
                ? "对话与工具执行各自表达语义。"
                : "平铺列表 · 选择对象，在 Inspector 查看上下文。"}
            </p>
          </div>
          <Button onClick={createSession}>
            <Plus size={16} />
            新建 Session
          </Button>
        </div>
        <div className={styles.pageContent} aria-busy={dataState === "loading"}>
          {dataState === "loading" ? (
            <div aria-label="正在加载工作区" className={styles.skeletons}>
              {[0, 1, 2].map((key) => (
                <div key={key}>
                  <span />
                  <span />
                </div>
              ))}
            </div>
          ) : (
            <>
              {dataState === "error" && (
                <div role="alert" className={styles.error}>
                  <p>演示刷新失败：网络不可用。已有内容已保留。</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDataState("success")}
                  >
                    重试读取
                  </Button>
                </div>
              )}
              {dataState === "partial" && (
                <p className={styles.notice}>
                  当前为部分数据。缺失的 usage 显示「—」，不计为 0。
                </p>
              )}
              {dataState === "empty" ||
              (view !== "chat" && items.length === 0) ? (
                <div className={styles.empty}>
                  <Inbox size={20} aria-hidden="true" />
                  <h3>这里暂时没有内容</h3>
                  <p>
                    {search
                      ? "没有匹配的结果，清除搜索后查看全部对象。"
                      : "当前演示数据为空，可以恢复数据或创建本地 Session。"}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDataState("success")
                      setSearch("")
                    }}
                  >
                    恢复演示数据
                  </Button>
                </div>
              ) : view === "chat" ? (
                <Conversation
                  messages={[
                    {
                      id: "initial-user",
                      role: "user",
                      content: "请按照组件规范初始化 Agent 工作台。",
                      time: "16:40",
                    },
                    {
                      id: "initial-agent",
                      role: "agent",
                      author: "Builder",
                      content:
                        "基础布局使用 Sidebar、Main 和 Inspector。运行状态通过同一份字典展示，选中态独立保留。",
                      time: "16:42",
                      state:
                        runtime === "running" || runtime === "thinking"
                          ? "streaming"
                          : runtime === "failed"
                            ? "failed"
                            : runtime === "cancelled"
                              ? "cancelled"
                              : "completed",
                      stage: "本地展示片段",
                      elapsed: "00:24",
                      onStop: () => setRuntime("cancelled"),
                      after: (
                        <ToolCall
                          call={{
                            id: "workspace-read",
                            name: "read_file",
                            target: "Component-Specification.md",
                            status: "completed",
                            duration: "24ms",
                            arguments: { path: "Component-Specification.md" },
                            output:
                              "Button default: 32px\nItem double: 56px\nInspector: 320px",
                          }}
                        />
                      ),
                    },
                    ...messages.map((text, index) => ({
                      id: `local-message-${index}`,
                      role: "user" as const,
                      content: text,
                      author: "你 · 本地消息",
                    })),
                  ]}
                  workspace={
                    <>
                      <h3 className="mb-3 text-sm font-medium">
                        Files / Diff / Preview
                      </h3>
                      <Item
                        title="Component-Specification.md"
                        leading={<FileText />}
                      />
                      <p className={styles.caption}>
                        本地工作区预览 · 未连接文件系统或终端。
                      </p>
                    </>
                  }
                  composer={
                    <ChatComposer
                      value={draft}
                      onChange={setDraft}
                      onSend={() => sendMessage()}
                    />
                  }
                />
              ) : view === "sessions" ? (
                sessionView === "tree" ? (
                  <Tree
                    label="工作台 Session 层级"
                    nodes={treeNodes}
                    selectedId={selected?.id}
                    defaultExpandedIds={["idea-design", "session-design"]}
                    onSelect={(node) => {
                      const entity = sessions.find(
                        (entry) => entry.id === node.id,
                      )
                      if (entity) select(entity)
                    }}
                  />
                ) : (
                  <section aria-label="Idea / 工作台设计">
                    <h3 className={styles.groupTitle}>
                      Idea / 工作台设计 · {items.length} Sessions
                    </h3>
                    {renderRows()}
                  </section>
                )
              ) : (
                renderRows()
              )}
            </>
          )}
        </div>
      </WorkspaceShell>
      <p role="status" className={styles.feedback}>
        {feedback || "调整状态、选择对象或打开 Chat，检查规范中的布局与状态。"}
      </p>
    </div>
  )
}
