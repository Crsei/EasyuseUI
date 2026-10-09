"use client"
import { useState, useMemo, type ReactNode, type Ref } from "react"
import { Button } from "@/components/ui/button"
import {
  Conversation,
  type ConversationActions,
} from "@/components/blocks/chat-message"
import { ToolCall } from "@/components/blocks/tool-call"
import { useI18n } from "@/lib/i18n-provider"
import type { SessionSnapshot, MessagePart } from "@/lib/agent-workbench-model"
import styles from "./workbench.module.css"
/** Small safe Markdown subset: paragraphs, headings, fenced code and inline code. HTML stays text. */
export function MessageContent({
  content,
  maximum = 32768,
}: {
  content: string
  maximum?: number
}) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const bound = content.slice(0, Math.max(0, Math.min(262144, maximum)))
  const blocks = bound.split(/(```[^\n]*\n[\s\S]*?(?:```|$))/g)
  return (
    <div className={styles.text}>
      {blocks.map((block, index) => {
        if (block.startsWith("```")) {
          const code = block.replace(/^```[^\n]*\n/, "").replace(/```$/, "")
          return (
            <div key={index}>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code)
                    setCopied(true)
                  } catch {
                    setCopyError(true)
                  }
                }}
              >
                {t("workbench.copy")}
              </Button>
              <pre className={styles.code}>
                <code>{code}</code>
              </pre>
            </div>
          )
        }
        return (
          <div key={index}>
            {block.split(/\n\n/).map((line, j) =>
              /^#{1,3} /.test(line) ? (
                <h3 className={styles.heading} key={j}>
                  {line.replace(/^#{1,3} /, "")}
                </h3>
              ) : (
                <p key={j}>
                  {line
                    .split(/(`[^`]+`)/g)
                    .map((text, k) =>
                      text.startsWith("`") ? (
                        <code key={k}>{text.slice(1, -1)}</code>
                      ) : (
                        text
                      ),
                    )}
                </p>
              ),
            )}
          </div>
        )
      })}
      {bound.length < content.length && (
        <p className={styles.meta}>{t("workbench.truncated")}</p>
      )}
      <span role="status">
        {copyError
          ? t("workbench.copyFailed")
          : copied
            ? t("workbench.copied")
            : ""}
      </span>
    </div>
  )
}
export type AgentConversationProps = {
  session: SessionSnapshot
  composer?: ReactNode
  attention?: ReactNode
  onLoadHistory?: () => void
  onOpenReference?: (part: MessagePart) => void
  actionsRef?: Ref<ConversationActions>
  deferOffscreen?: boolean
  onRetry?: () => void
}
export function AgentConversation({
  session,
  composer,
  attention,
  onLoadHistory,
  onOpenReference,
  actionsRef,
  deferOffscreen,
  onRetry,
}: AgentConversationProps) {
  const { t } = useI18n()
  const messages = useMemo(
    () =>
      session.messages.map((m) => ({
        id: m.messageId,
        role: m.role,
        state: m.state,
        content: m.parts
          .map((p) => ("text" in p ? p.text : p.label))
          .join("\n"),
        renderContent: () => (
          <>
            {m.parts.map((part) => (
              <div className={styles.messagePart} key={part.partId}>
                {part.kind === "text" ? (
                  <MessageContent content={part.text} />
                ) : part.kind === "code" ? (
                  <MessageContent
                    content={`\`\`\`${part.language ?? ""}\n${part.text}\n\`\`\``}
                  />
                ) : part.kind === "tool" ? (
                  (() => {
                    const tool = session.tools.find(
                      (tool) => tool.id === part.referenceId,
                    )
                    return tool ? (
                      <ToolCall call={tool} />
                    ) : (
                      <p className={styles.meta}>
                        {part.label} · {t("workbench.unavailable")}
                      </p>
                    )
                  })()
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenReference?.(part)}
                    disabled={!onOpenReference}
                  >
                    {part.label}
                  </Button>
                )}
              </div>
            ))}
          </>
        ),
      })),
    [session.messages, session.tools, onOpenReference, t],
  )
  const displayed = useMemo(
    () =>
      messages.map((message, index) =>
        index === messages.length - 1
          ? { ...message, after: attention }
          : message,
      ),
    [messages, attention],
  )
  return (
    <div className={styles.chat}>
      {session.history.hasMore && (
        <div className={styles.toolbar}>
          <Button
            variant="ghost"
            size="sm"
            loading={session.history.loading}
            onClick={onLoadHistory}
            disabled={!onLoadHistory}
          >
            {t("workbench.loadHistory")}
          </Button>
        </div>
      )}
      <Conversation
        layout="fill"
        className={styles.conversation}
        messages={displayed}
        revision={session.revision}
        actionsRef={actionsRef}
        deferOffscreen={deferOffscreen}
        data={{
          state: session.dataState,
          onRetry,
          error: session.error
            ? {
                category: "network",
                message: session.error,
                reason: session.error,
              }
            : undefined,
        }}
        composer={composer}
      />
    </div>
  )
}
