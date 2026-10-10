"use client"

import Link from "next/link"
import { useReducer, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { AgentConversation } from "@/components/blocks/agent-workbench/conversation"
import { AgentComposer } from "@/components/blocks/agent-workbench/composer"
import {
  ProjectSwitcher,
  SessionHeader,
  SessionNavigator,
} from "@/components/blocks/agent-workbench/navigation"
import { ChangeReviewPanel } from "@/components/blocks/agent-workbench/review"
import { ContextPanel } from "@/components/blocks/agent-workbench/context"
import { ApprovalRequestPanel } from "@/components/blocks/approval-request-panel"
import { Button } from "@/components/ui/button"
import { DataRegion } from "@/components/ui/data-region"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { Item } from "@/components/ui/item"
import { useI18n } from "@/lib/i18n-provider"
import { runtimeStatuses, type DataState } from "@/lib/runtime-status"
import type { ConversationActions } from "@/components/blocks/chat-message"
import type {
  ReviewComment,
  SessionSnapshot,
  WorkbenchPanelId,
} from "@/lib/agent-workbench-model"
import {
  initialWorkbench,
  makeDraft,
  models,
  permissions,
  environments,
} from "../agent-workbench/fixtures"
import { commandFixtures } from "../agent-workbench/resource-fixtures"
import {
  ActivityNavigation,
  type ActivityArea,
} from "../agent-workbench/activity-navigation"
import { DeferredWorkbenchPanels } from "../agent-workbench/deferred-panels"
import {
  InterventionAttentionStrip,
  InterventionQueuePreview,
} from "./intervention-panels"
import {
  approvalId,
  initialIntervention,
  interventionReducer,
} from "./intervention-model"
import { RuntimePanel } from "./runtime-panel"
import referenceTokens from "./reference-tokens.module.css"
import styles from "./reference.module.css"

export const referenceModules = [
  ["MD01", "全局栏", "Global header"],
  ["MD02", "导航轨", "Activity rail"],
  ["MD03", "会话导航", "Session navigation"],
  ["MD04", "会话标题", "Session header"],
  ["MD05", "历史阅读", "History viewport"],
  ["MD06", "用户消息", "User message"],
  ["MD07", "Agent 轮次", "Agent turn"],
  ["MD08", "计划摘要", "Plan summary"],
  ["MD09", "Read / Search", "Read / Search"],
  ["MD10", "文件修改", "File changes"],
  ["MD11", "Shell / Test", "Shell / Test"],
  ["MD12", "输入区", "Composer"],
  ["MD13", "队列摘要", "Queue preview"],
  ["MD14", "审批与提醒", "Approval and attention"],
  ["MD15", "资源标签", "Resource tabs"],
  ["MD16", "宽 Diff", "Wide Diff"],
  ["MD17", "底部运行", "Runtime panel"],
] as const

/** All source controls are explicit in-memory fixtures. No transport or execution. */
export function ReferenceLab() {
  const { locale, setLocale, t } = useI18n()
  const { theme, setTheme } = useTheme()
  const en = locale === "en"
  const [fixture] = useState(initialWorkbench)
  const [selected, setSelected] = useState("MD07")
  const [data, setData] = useState<DataState>("success")
  const [interaction, setInteraction] = useState("default")
  const [runtime, setRuntime] = useState("running")
  const [draft, setDraft] = useState(() =>
    makeDraft(fixture.sessions[0].sessionId),
  )
  const [sessionId, setSessionId] = useState(fixture.sessions[0].sessionId)
  const [projectId, setProjectId] = useState(fixture.sessions[0].projectId)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [area, setArea] = useState<ActivityArea>("sessions")
  const [panel, setPanel] = useState<WorkbenchPanelId>("changes")
  const [fileId, setFileId] = useState("file-filter")
  const [mode, setMode] = useState<"unified" | "split">("unified")
  const [comments, setComments] = useState<ReviewComment[]>([])
  const [command, setCommand] = useState<string>()
  const [intervention, dispatch] = useReducer(
    interventionReducer,
    undefined,
    initialIntervention,
  )
  const reading = useRef<ConversationActions>(null)
  const session: SessionSnapshot = {
    ...fixture.sessions[0],
    status: runtime,
    dataState: "success",
    capabilities: {
      ...fixture.sessions[0].capabilities,
      send: runtime === "idle",
      queue: true,
      steer: true,
    },
  }
  const commands = commandFixtures(session)
  const receipts =
    interaction === "pending" || interaction === "unknown"
      ? [
          {
            requestId: "fixture-reference-operation",
            targetId: session.sessionId,
            action: "send",
            state: interaction as "pending" | "unknown",
          },
        ]
      : []
  function conversationFor(id: string) {
    const source = session.messages[1]
    const narrowed =
      id === "MD06"
        ? session.messages.filter((m) => m.role === "user")
        : id === "MD05" || id === "MD07"
          ? id === "MD05" && historyLoaded
            ? [
                {
                  ...session.messages[0],
                  messageId: "fixture-reference-history",
                  sequence: 0,
                  parts: [
                    {
                      ...session.messages[0].parts[0],
                      partId: "fixture-reference-history-part",
                      kind: "text" as const,
                      text: "Earlier fixture message",
                    },
                  ],
                },
                ...session.messages,
              ]
            : session.messages
          : [
              {
                ...source,
                parts: source.parts.filter((p) =>
                  id === "MD08"
                    ? p.kind === "plan"
                    : p.kind === "tool" &&
                      (id === "MD09"
                        ? [
                            "fixture-read-filter",
                            "fixture-search-filter",
                          ].includes(p.referenceId)
                        : id === "MD10"
                          ? p.referenceId === "fixture-edit-filter"
                          : p.referenceId === session.tools[0].id),
                ),
              },
            ]
    return (
      <AgentConversation
        presentation="workspace"
        session={{
          ...session,
          messages: narrowed,
          history: { hasMore: id === "MD05" && !historyLoaded },
        }}
        groupTools
        actionsRef={id === "MD05" ? reading : undefined}
        onLoadHistory={() => setHistoryLoaded(true)}
        onOpenChange={(id) => {
          setFileId(id)
          setSelected("MD16")
        }}
        onOpenReference={() => {
          setPanel("plan")
          setSelected("MD15")
        }}
        onOpenTool={(id) => {
          setCommand(`command-${id}`)
          setSelected("MD17")
        }}
      />
    )
  }
  const resourcePanels = (
    ["changes", "files", "plan", "context", "activity"] as const
  ).map((id) => ({
    id,
    label: t(`workbench.${id}`),
    available: true,
    render: () =>
      id === "changes" || id === "files" ? (
        session.changes.files.map((file) => (
          <Item
            key={file.fileId}
            title={file.path}
            description={session.changes.revision}
            onSelect={() => {
              setFileId(file.fileId)
              setSelected("MD16")
            }}
          />
        ))
      ) : id === "plan" ? (
        session.plan.map((step) => (
          <Item
            key={step.id}
            title={step.title}
            description={<RuntimeStatusBadge status={step.status} />}
            onSelect={
              step.toolId
                ? () => {
                    setCommand(`command-${step.toolId}`)
                    setSelected("MD17")
                  }
                : undefined
            }
          />
        ))
      ) : id === "context" ? (
        <ContextPanel
          references={draft.context}
          onRemove={(id) =>
            setDraft({
              ...draft,
              context: draft.context.filter((r) => r.id !== id),
              version: draft.version + 1,
            })
          }
        />
      ) : (
        <p className={styles.notice}>
          {session.source} · {session.activeRunId}
        </p>
      ),
  }))
  const approval = intervention.approvalOperation
  const modules = {
    MD01: (
      <div className={styles.global}>
        <ProjectSwitcher
          projects={fixture.projects}
          value={projectId}
          onChange={setProjectId}
        />
        <span>
          {session.environment.name} · {session.environment.branch}
        </span>
        <span>{en ? "Worktree not supplied" : "来源未提供工作树"}</span>
      </div>
    ),
    MD02: (
      <div className={styles.rail}>
        <ActivityNavigation
          area={area}
          page="session"
          href={(page) =>
            `/examples/agent-workbench/app/?template=coding&page=${page}`
          }
          onNavigate={() => setSelected("MD15")}
          onArea={setArea}
          onSearch={() => setSelected("MD03")}
          onSettings={() => setSelected("MD12")}
          onHelp={() => setSelected("MD07")}
          settingsOpen={false}
          taskCount={session.attention.length}
          changeCount={session.changes.files.length}
          artifactCount={session.artifacts.length}
        />
      </div>
    ),
    MD03: (
      <SessionNavigator
        projects={fixture.projects}
        sessions={fixture.sessions}
        projectId={projectId}
        selectedId={sessionId}
        onProjectChange={setProjectId}
        onSelect={setSessionId}
        onNew={() => setSelected("MD12")}
        newLabel={en ? "New session" : "新建会话"}
      />
    ),
    MD04: (
      <SessionHeader
        presentation="workspace"
        session={session}
        onInterrupt={() => setInteraction("pending")}
      />
    ),
    MD05: conversationFor("MD05"),
    MD06: conversationFor("MD06"),
    MD07: conversationFor("MD07"),
    MD08: conversationFor("MD08"),
    MD09: conversationFor("MD09"),
    MD10: conversationFor("MD10"),
    MD11: conversationFor("MD11"),
    MD12: (
      <div className={styles.dock}>
        <AgentComposer
          session={session}
          draft={draft}
          onChange={setDraft}
          models={models}
          permissions={permissions}
          environments={environments}
          receipts={receipts}
          onSubmit={() => setInteraction("pending")}
          onReconcile={() => setInteraction("default")}
          onInterrupt={() => setInteraction("pending")}
        />
      </div>
    ),
    MD13: (
      <>
        <InterventionQueuePreview
          state={{ ...intervention, dataState: data }}
          dispatch={dispatch}
        />
        <Link href="/examples/agent-workbench/regions/intervention/">
          {en ? "Queue source controls and recovery" : "队列来源确认与恢复"}
        </Link>
      </>
    ),
    MD14: (
      <>
        <InterventionAttentionStrip
          operation={approval}
          onReview={() =>
            document.getElementById("reference-approval")?.focus()
          }
        />
        <div id="reference-approval" tabIndex={-1}>
          <ApprovalRequestPanel
            request={{
              ...fixture.sessions[1].attention[0],
              attentionId: approvalId,
              allowedActions:
                approval?.state === "confirmed" ? [] : ["accept", "reject"],
              operation: approval ? { state: approval.state } : undefined,
            }}
            onAction={async (action) => {
              if (action === "accept" || action === "reject")
                dispatch({
                  type: "approval-request",
                  action,
                  baseRevision: intervention.approvalRevision,
                })
            }}
          />
        </div>
        <Link href="/examples/agent-workbench/regions/intervention/">
          {en ? "Approval source controls and recovery" : "审批来源确认与恢复"}
        </Link>
      </>
    ),
    MD15: (
      <DeferredWorkbenchPanels
        panels={resourcePanels}
        value={panel}
        primaryPanels={["changes", "files", "plan"]}
        onChange={setPanel}
      />
    ),
    MD16: (
      <ChangeReviewPanel
        scopeId={session.sessionId}
        changes={session.changes}
        selectedFileId={fileId}
        onSelectFile={setFileId}
        comments={comments}
        onCommentsChange={setComments}
        mode={mode}
        onModeChange={setMode}
      />
    ),
    MD17: (
      <RuntimePanel
        session={session}
        commands={commands}
        selectedId={command}
        onSelect={setCommand}
        onOpenTool={() => setSelected("MD11")}
        onOpenResource={(id) => {
          setFileId(id)
          setSelected("MD16")
        }}
        onSource={() => setSelected("MD05")}
      />
    ),
  }
  return (
    <main
      className={`${styles.root} ${referenceTokens.tokens}`}
      data-reference-lab
      data-reference-version="V2"
      data-data-state={data}
    >
      <header className={styles.header}>
        <Link href="/examples/agent-workbench/regions/">
          ← {en ? "Regions" : "区域实验室"}
        </Link>
        <h1>
          {en ? "Agent Workspace reference states" : "Agent Workspace 参考状态"}
        </h1>
        <span>
          {en
            ? "Explicit local fixture · V2 · no service writes"
            : "明确本地 fixture · V2 · 无服务写入"}
        </span>
      </header>
      <div className={styles.controls}>
        <label>
          {en ? "Module" : "模块"}
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {referenceModules.map(([id, zh, label]) => (
              <option key={id} value={id}>
                {id} · {en ? label : zh}
              </option>
            ))}
          </select>
        </label>
        <label>
          {en ? "Data state" : "数据状态"}
          <select
            value={data}
            onChange={(e) => setData(e.target.value as DataState)}
          >
            {["success", "loading", "empty", "partial", "error"].map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          {en ? "Interaction" : "交互状态"}
          <select
            value={interaction}
            onChange={(e) => setInteraction(e.target.value)}
          >
            {["default", "disabled", "pending", "unknown"].map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Runtime
          <select value={runtime} onChange={(e) => setRuntime(e.target.value)}>
            {[...runtimeStatuses, "source-status-unrecognized"].map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          {en ? "Theme" : "主题"}
          <select
            value={theme === "dark" ? "dark" : "light"}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          {en ? "Language" : "语言"}
          <select
            value={locale}
            onChange={(e) =>
              setLocale(e.target.value === "en" ? "en" : "zh-CN")
            }
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <p className={styles.notice}>
        {en
          ? "Hover and keyboard focus are exercised on interactive targets. Selection belongs to each module. Data, runtime and operation states remain separate; error retains the prior snapshot."
          : "在交互目标上检查 hover 与键盘焦点；选中由各模块控制。数据、运行与操作状态相互独立；读取错误保留原快照。"}
      </p>
      <div className={styles.layout}>
        <nav aria-label={en ? "Reference modules" : "参考模块"}>
          {referenceModules.map(([id, zh, label]) => (
            <Button
              key={id}
              variant="ghost"
              aria-current={selected === id ? "page" : undefined}
              onClick={() => setSelected(id)}
            >
              {id} · {en ? label : zh}
            </Button>
          ))}
        </nav>
        <section className={styles.preview} aria-label={`${selected} preview`}>
          <DataRegion
            state={data}
            hasContent={
              data === "success" || data === "partial" || data === "error"
            }
            error={{
              category: "request",
              message: en
                ? "Fixture refresh failed; previous snapshot retained."
                : "fixture 刷新失败；保留原快照。",
              reason: en ? "Explicit fixture source" : "显式 fixture 来源",
            }}
            onRetry={() => setData("success")}
            emptyTitle={en ? "No source records" : "来源暂无记录"}
            emptyDescription={
              en
                ? "Choose success to load the fixture."
                : "切换 success 读取 fixture。"
            }
          >
            <span />
          </DataRegion>
          <fieldset
            className={styles.viewport}
            hidden={data === "loading" || data === "empty"}
            disabled={interaction === "disabled"}
          >
            <legend className="sr-only">{selected}</legend>
            {Object.entries(modules).map(([id, module]) => (
              <div
                className={styles.module}
                data-reference-module={id}
                key={id}
                hidden={selected !== id}
              >
                {module}
              </div>
            ))}
          </fieldset>
        </section>
      </div>
    </main>
  )
}
