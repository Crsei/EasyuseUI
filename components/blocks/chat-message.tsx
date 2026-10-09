"use client"
import { useUiFeedback } from "@/lib/i18n-provider"
import { uiMessage } from "@/lib/i18n-core"
import { useI18n } from "@/lib/i18n-provider"
import { localizeStaticData } from "@/lib/i18n-core"

import {
  memo,
  useId,
  useRef,
  useState,
  useImperativeHandle,
  type Ref,
  type ReactNode,
} from "react"
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
export const ChatMessage = memo(function ChatMessage({
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
  const { t, locale } = useI18n()

  const localizedStates = localizeStaticData(states, locale)

  const [feedback, setFeedback] = useUiFeedback("")
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
              (role === "user"
                ? t("chatMessage.you")
                : role === "agent"
                  ? "Agent"
                  : "System")}
          </span>
          {time && <time>{time}</time>}
          <span className={styles.actions}>
            {content && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("chatMessage.copyMessage")}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(content)
                    setFeedback(uiMessage("chatMessage.messageCopied"))
                  } catch {
                    setFeedback(
                      uiMessage("chatMessage.clipboardUnavailableCopyManually"),
                    )
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
              {localizedStates[state]}
              {stage && ` · ${stage}`}
            </span>
            {elapsed && <span>{elapsed}</span>}
            {reason && <p>{reason}</p>}
            {state === "streaming" && onStop && (
              <Button variant="secondary" size="sm" onClick={onStop}>
                <Square size={16} />
                {t("chatMessage.stopReceiving")}
              </Button>
            )}
            {state === "failed" && onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                {t("chatMessage.retryMessage")}
              </Button>
            )}
            {state === "interrupted" && onContinue && (
              <Button variant="secondary" size="sm" onClick={onContinue}>
                {t("chatMessage.continueReceiving")}
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
})

export type ConversationActions = {
  scrollToMessage: (id: string, options?: { focus?: boolean }) => boolean
  jumpToLatest: () => void
}
export type ConversationProps = {
  actionsRef?: Ref<ConversationActions>
  /** Opt in to browser offscreen layout deferral; records remain in the DOM. */
  deferOffscreen?: boolean
  /** Advance on every append, history edit, deletion, reorder or state change. */
  revision?: string | number
  messages: (ChatMessageProps & { after?: ReactNode })[]
  data?: Omit<DataRegionProps, "children" | "hasContent">
  workspace?: ReactNode
  composer?: ReactNode
  className?: string
}
export function Conversation({
  actionsRef,
  deferOffscreen = false,
  messages,
  revision,
  data,
  workspace,
  composer,
  className,
}: ConversationProps) {
  const { t } = useI18n()

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
    scrollToId,
  } = useFollowTail(
    unique.map((message) => message.id),
    revision ??
      JSON.stringify(
        unique.map((message) => [
          message.id,
          message.role,
          message.author,
          message.time,
          message.content,
          message.state,
          message.stage,
          message.elapsed,
          message.reason,
        ]),
      ),
  )
  useImperativeHandle(actionsRef, () => ({
    scrollToMessage: scrollToId,
    jumpToLatest,
  }))
  return (
    <div className={cn(styles.conversation, className)}>
      {workspace && (
        <div
          className={styles.tabs}
          role="tablist"
          aria-label={t("chatMessage.conversationAndWorkspace")}
        >
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
            aria-label={t("chatMessage.conversationHistory")}
            tabIndex={0}
          >
            <DataRegion
              state={unique.length ? "success" : "empty"}
              emptyTitle={t("chatMessage.startAConversation")}
              emptyDescription={t(
                "chatMessage.enterATaskBelowSendingItPreservesThe",
              )}
              {...data}
              hasContent={unique.length > 0}
            >
              <div
                className={styles.messages}
                data-defer-offscreen={deferOffscreen || undefined}
                data-follow-tail-list
              >
                {unique.map((message) => (
                  <ConversationRow key={message.id} message={message} />
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
              {t("chatMessage.jumpToLatest")}
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
  const { t } = useI18n()

  const id = useId()
  const composing = useRef(false)
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useUiFeedback("")
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
      setError(
        uiMessage(
          "chatMessage.messageDeliveryIsUnconfirmedYourDraftIsPreserved",
        ),
      )
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
        {t("chatMessage.messageInput")}
      </label>
      <textarea
        id={id}
        value={value}
        placeholder={t("chatMessage.enterATask")}
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
        <span>{t("chatMessage.enterToSendShiftEnterForANew")}</span>
        {streaming ? (
          onStop && (
            <Button variant="secondary" onClick={onStop}>
              <Square size={16} />
              {t("chatMessage.stop")}
            </Button>
          )
        ) : (
          <Button type="submit" disabled={!canSend} loading={pending || busy}>
            {t("chatMessage.send")}
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

const ConversationRow = memo(function ConversationRow({
  message,
}: {
  message: ChatMessageProps & { after?: ReactNode }
}) {
  const { after, ...props } = message
  return (
    <div className={styles.messageEntry} data-follow-tail-id={message.id}>
      <ChatMessage {...props} />
      {after && <div className={styles.after}>{after}</div>}
    </div>
  )
})
