"use client"

import { useId, useRef, useState, type ReactNode } from "react"
import { Bot, Copy, MessageSquare, Square, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataRegion, type DataRegionProps } from "@/components/ui/data-region"
import { useFollowTail } from "@/lib/use-follow-tail"
import { cn } from "@/lib/utils"
import styles from "./chat-message.module.css"

export type MessageState =
  "pending" | "streaming" | "completed" | "interrupted" | "failed" | "cancelled"
export type ChatMessageProps = {
  id: string
  role: "user" | "agent" | "system"
  author?: string
  time?: string
  content: string
  state?: MessageState
  stage?: string
  elapsed?: string
  reason?: string
  attachments?: ReactNode
  children?: ReactNode
  onRetry?: () => void
  onStop?: () => void
  onContinue?: () => void
}
const states: Record<MessageState, string> = {
  pending: "正在提交",
  streaming: "正在接收",
  completed: "已完成",
  interrupted: "连接中断",
  failed: "发送或执行失败",
  cancelled: "已停止",
}
export function ChatMessage({
  id,
  role,
  author,
  time,
  content,
  state = "completed",
  stage,
  elapsed,
  reason,
  attachments,
  children,
  onRetry,
  onStop,
  onContinue,
}: ChatMessageProps) {
  const [feedback, setFeedback] = useState("")
  const Icon = role === "agent" ? Bot : role === "system" ? Info : MessageSquare
  return (
    <article
      className={styles.message}
      data-message-id={id}
      data-message-state={state}
    >
      <div className={styles.avatar}>
        <Icon size={16} aria-hidden="true" />
      </div>
      <div className={styles.main}>
        <header>
          <span>
            {author ??
              (role === "user" ? "你" : role === "agent" ? "Agent" : "System")}
          </span>
          {time && <time>{time}</time>}
          <span className={styles.actions}>
            {content && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="复制消息"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(content)
                    setFeedback("已复制消息。")
                  } catch {
                    setFeedback("无法访问剪贴板，请手动复制。")
                  }
                }}
              >
                <Copy size={16} />
              </Button>
            )}
          </span>
        </header>
        <div className={styles.body}>
          {content && <p>{content}</p>}
          {children}
        </div>
        {attachments && <div className={styles.attachments}>{attachments}</div>}
        {state !== "completed" && (
          <div
            className={styles.state}
            data-error={state === "failed" || state === "interrupted"}
          >
            <span role="status">
              {states[state]}
              {stage && ` · ${stage}`}
            </span>
            {elapsed && <span>{elapsed}</span>}
            {reason && <p>{reason}</p>}
            {state === "streaming" && onStop && (
              <Button variant="secondary" size="sm" onClick={onStop}>
                <Square size={16} />
                停止接收
              </Button>
            )}
            {state === "failed" && onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                重试消息
              </Button>
            )}
            {state === "interrupted" && onContinue && (
              <Button variant="secondary" size="sm" onClick={onContinue}>
                继续接收
              </Button>
            )}
          </div>
        )}
        <p className={styles.feedback} role="status">
          {feedback}
        </p>
      </div>
    </article>
  )
}

export type ConversationProps = {
  messages: (ChatMessageProps & { after?: ReactNode })[]
  data?: Omit<DataRegionProps, "children" | "hasContent">
  workspace?: ReactNode
  composer?: ReactNode
  className?: string
}
export function Conversation({
  messages,
  data,
  workspace,
  composer,
  className,
}: ConversationProps) {
  const id = useId()
  const [view, setView] = useState("conversation")
  const unique = [
    ...new Map(messages.map((message) => [message.id, message])).values(),
  ]
  const {
    ref: scrollRef,
    unread,
    onScroll,
    jumpToLatest,
  } = useFollowTail(
    unique.map((message) => message.id),
    JSON.stringify(
      unique.map((message) => [message.id, message.content, message.state]),
    ),
  )
  return (
    <div className={cn(styles.conversation, className)}>
      {workspace && (
        <div className={styles.tabs} role="tablist" aria-label="对话与工作区">
          {["conversation", "workspace"].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`${id}-${tab}-tab`}
              aria-controls={`${id}-${tab}`}
              aria-selected={view === tab}
              tabIndex={view === tab ? 0 : -1}
              onClick={() => setView(tab)}
              onKeyDown={(event) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault()
                  const next =
                    event.key === "Home"
                      ? "conversation"
                      : event.key === "End"
                        ? "workspace"
                        : view === "conversation"
                          ? "workspace"
                          : "conversation"
                  setView(next)
                  document.getElementById(`${id}-${next}-tab`)?.focus()
                }
              }}
            >
              {tab === "conversation" ? "Conversation" : "Workspace"}
            </button>
          ))}
        </div>
      )}
      <div
        className={styles.panes}
        data-view={view}
        data-split={Boolean(workspace)}
      >
        <div
          className={styles.chatPane}
          id={`${id}-conversation`}
          role={workspace ? "tabpanel" : undefined}
          aria-labelledby={workspace ? `${id}-conversation-tab` : undefined}
        >
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className={styles.scroll}
            aria-label="对话记录"
            tabIndex={0}
          >
            <DataRegion
              state={unique.length ? "success" : "empty"}
              emptyTitle="开始一段对话"
              emptyDescription="在下方输入任务，发送后会保留完整工作流记录。"
              {...data}
              hasContent={unique.length > 0}
            >
              <div className={styles.messages}>
                {unique.map(({ after, ...message }) => (
                  <div key={message.id}>
                    <ChatMessage {...message} />
                    {after && <div className={styles.after}>{after}</div>}
                  </div>
                ))}
              </div>
            </DataRegion>
          </div>
          {unread > 0 && (
            <Button
              className={styles.latest}
              variant="secondary"
              size="sm"
              onClick={jumpToLatest}
            >
              返回最新
            </Button>
          )}
        </div>
        {workspace && (
          <section
            className={styles.workspace}
            id={`${id}-workspace`}
            role="tabpanel"
            aria-labelledby={`${id}-workspace-tab`}
          >
            {workspace}
          </section>
        )}
      </div>
      {composer}
    </div>
  )
}

export type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: (value: string) => void | Promise<void>
  pending?: boolean
  streaming?: boolean
  disabled?: boolean
  onStop?: () => void
  attachments?: ReactNode
}
export function ChatComposer({
  value,
  onChange,
  onSend,
  pending,
  streaming,
  disabled,
  onStop,
  attachments,
}: ChatComposerProps) {
  const id = useId()
  const composing = useRef(false)
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const canSend = Boolean(
    value.trim() && !pending && !busy && !streaming && !disabled,
  )
  async function send() {
    if (!canSend || sending.current || composing.current) return
    sending.current = true
    setBusy(true)
    setError("")
    try {
      await onSend(value.trim())
    } catch {
      setError("消息未确认发送成功，草稿已保留。请检查连接后重试。")
    } finally {
      sending.current = false
      setBusy(false)
    }
  }
  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      {attachments && <div className={styles.attachments}>{attachments}</div>}
      <label htmlFor={id} className="sr-only">
        消息输入
      </label>
      <textarea
        id={id}
        value={value}
        placeholder="输入任务…"
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onCompositionStart={() => {
          composing.current = true
        }}
        onCompositionEnd={() => {
          composing.current = false
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing &&
            event.nativeEvent.keyCode !== 229 &&
            !composing.current
          ) {
            event.preventDefault()
            void send()
          }
        }}
      />
      <div className={styles.composerActions}>
        <span>Enter 发送 · Shift+Enter 换行</span>
        {streaming ? (
          onStop && (
            <Button variant="secondary" onClick={onStop}>
              <Square size={16} />
              停止
            </Button>
          )
        ) : (
          <Button type="submit" disabled={!canSend} loading={pending || busy}>
            发送
          </Button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className={styles.composerError}>
          {error}
        </p>
      )}
    </form>
  )
}
