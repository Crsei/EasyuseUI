"use client"
import { useSiteFeedback, siteMessage } from "@/components/site/site-i18n"
import { useSiteI18n } from "@/components/site/site-i18n"

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
  const { t } = useSiteI18n()

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
  const [feedback, setFeedback] = useSiteFeedback("")
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
      name: t("site.localSessionValue", { value0: sessions.length + 1 }),
      kind: "Session",
      status: "idle",
    }
    setSessions((current) => [...current, entity])
    select(entity)
    setView("sessions")
    setSearch("")
    setDataState("success")
    setFeedback(siteMessage("site.localDemoSessionCreated"))
  }
  function sendMessage() {
    if (!draft.trim()) return
    setMessages((current) => [...current, draft.trim()])
    setDraft("")
    setFeedback(siteMessage("site.messageAddedToLocalDemoNoRequestSentTo"))
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
                { label: t("site.type"), value: selected.kind },
                { label: "ID", value: selected.id, copyValue: selected.id },
                { label: t("site.model"), value: "未连接 · 本地演示" },
                { label: "Tokens" },
                { label: t("site.source"), value: "本地 UI fixture" },
              ],
            }
          : null
      }
    >
      {selected && (
        <section>
          <h3>{t("site.relatedFiles")}</h3>
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
            type: t("site.localEvent"),
            action: entity.name,
            target: "Component-Specification.md",
            status: selectedStatus(entity),
            duration: "24ms",
            details: <p>{t("site.localDemoEventNoRealRuntimeConnected")}</p>,
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
                  updatedAt: t("site.justUpdated"),
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
      label: t("site.ideaWorkspaceDesign"),
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
                  label: t("site.runInitializeFoundation"),
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
          <label htmlFor={`${id}-data`}>{t("site.dataState")}</label>
          <select
            id={`${id}-data`}
            value={dataState}
            onChange={(event) => setDataState(event.target.value as DataState)}
          >
            <option value="success">{t("site.successCompleteData")}</option>
            <option value="loading">{t("site.loadingInitialLoad")}</option>
            <option value="empty">{t("site.emptyEmptyState")}</option>
            <option value="partial">{t("site.partialPartialData")}</option>
            <option value="error">{t("site.errorRefreshFailure")}</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-runtime`}>{t("site.runtimeStatus")}</label>
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
        <span className={styles.fixtureLabel}>{t("site.localDemo2")}</span>
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
                    setFeedback(siteMessage("site.objectIdCopied"))
                  } catch {
                    setFeedback(
                      siteMessage(
                        "site.clipboardUnavailableCopyTheIdFromMetadataManually",
                      ),
                    )
                  }
                }}
              >
                <Copy size={16} />
                {t("site.copyId")}
              </Button>
              <Button variant="ghost" onClick={() => setView("chat")}>
                {t("site.viewConversation")}
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
            <nav aria-label={t("site.workspacePage")}>
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
                  aria-label={t("site.searchCurrentList")}
                  placeholder={t("site.searchCurrentList2")}
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
              <div
                className={styles.viewSwitch}
                aria-label={t("site.sessionView")}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={sessionView === "list"}
                  onClick={() => setSessionView("list")}
                >
                  {t("site.listView")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={sessionView === "tree"}
                  onClick={() => setSessionView("tree")}
                >
                  {t("site.hierarchyView")}
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("site.clearObjectSelection")}
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
                ? t(
                    "site.conversationAndToolExecutionExpressDifferentSemantics",
                  )
                : t("site.flatListSelectAnObjectToInspectItsContext")}
            </p>
          </div>
          <Button onClick={createSession}>
            <Plus size={16} />
            {t("site.newSession")}
          </Button>
        </div>
        <div className={styles.pageContent} aria-busy={dataState === "loading"}>
          {dataState === "loading" ? (
            <div
              aria-label={t("site.loadingWorkspace")}
              className={styles.skeletons}
            >
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
                  <p>
                    {t(
                      "site.demoRefreshFailedNetworkUnavailableExistingContentPreserved",
                    )}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDataState("success")}
                  >
                    {t("site.retryRead")}
                  </Button>
                </div>
              )}
              {dataState === "partial" && (
                <p className={styles.notice}>
                  {t("site.partialDataMissingUsageIsShownAsNotZero")}
                </p>
              )}
              {dataState === "empty" ||
              (view !== "chat" && items.length === 0) ? (
                <div className={styles.empty}>
                  <Inbox size={20} aria-hidden="true" />
                  <h3>{t("site.noContentYet")}</h3>
                  <p>
                    {search
                      ? t("site.noMatchingResultsClearSearchToViewAllObjects")
                      : t("site.demoDataIsEmptyRestoreDataOrCreateA")}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDataState("success")
                      setSearch("")
                    }}
                  >
                    {t("site.restoreDemoData")}
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
                      stage: t("site.localDisplayFragment"),
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
                      author: t("site.youLocalMessage"),
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
                        {t(
                          "site.localWorkspacePreviewNoFilesystemOrTerminalConnected",
                        )}
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
                    label={t("site.workspaceSessionHierarchy")}
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
                  <section aria-label={t("site.ideaWorkspaceDesign")}>
                    <h3 className={styles.groupTitle}>
                      {t("site.ideaWorkspaceDesign2")}
                      {items.length} Sessions
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
        {feedback || t("site.adjustStatesSelectObjectsOrOpenChatToInspect")}
      </p>
    </div>
  )
}
