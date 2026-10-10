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
  onOpenTool?: (toolCallId: string) => void
  groupTools?: boolean
  presentation?: "default" | "workspace"
  onOpenChange?: (fileId: string) => void
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
  onOpenTool,
  groupTools = false,
  presentation = "default",
  onOpenChange,
}: AgentConversationProps) {
  const { t, locale } = useI18n()
  const messages = useMemo(
    () =>
      session.messages.map((m) => ({
        id: m.messageId,
        role: m.role,
        author: m.role === "agent" ? session.agent.name : undefined,
        state: m.state,
        time: m.timestamp
          ? new Date(m.timestamp).toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
        content: m.parts
          .map((p) => ("text" in p ? p.text : p.label))
          .join("\n"),
        renderContent: () => (
          <>
            {(() => {
              const groups: MessagePart[][] = []
              const canGroup = (part: MessagePart) => {
                if (!groupTools || part.kind !== "tool") return false
                const tool = session.tools.find(
                  (tool) => tool.id === part.referenceId,
                )
                return Boolean(
                  tool &&
                  ["read", "grep", "find", "ls", "search"].includes(
                    tool.name.toLowerCase(),
                  ) &&
                  tool.status === "completed" &&
                  tool.outcome !== "unknown" &&
                  !tool.error,
                )
              }
              for (const part of m.parts) {
                const previous = groups.at(-1)
                if (canGroup(part) && previous && canGroup(previous[0]))
                  previous.push(part)
                else groups.push([part])
              }
              return groups.map((parts) =>
                canGroup(parts[0]) ? (
                  <details key={parts[0].partId} className={styles.toolGroup}>
                    <summary>
                      {parts
                        .map((part) =>
                          part.kind === "tool"
                            ? session.tools.find(
                                (tool) => tool.id === part.referenceId,
                              )?.name
                            : "",
                        )
                        .filter(
                          (value, index, all) => all.indexOf(value) === index,
                        )
                        .join(" / ")}{" "}
                      · {parts.length}
                    </summary>
                    {parts.map((part) =>
                      part.kind === "tool" ? (
                        <div key={part.partId}>
                          <ToolCall
                            call={session.tools.find(
                              (tool) => tool.id === part.referenceId,
                            )!}
                          />
                          {onOpenTool && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOpenTool(part.referenceId)}
                            >
                              {t("resource.commands")}
                            </Button>
                          )}
                        </div>
                      ) : null,
                    )}
                  </details>
                ) : (
                  parts.map((part) => (
                    <div className={styles.messagePart} key={part.partId}>
                      {part.kind === "phase" ? (
                        <div
                          className={styles.phase}
                          data-phase={part.phase}
                          data-initial={m.parts.indexOf(part) === 0}
                        >
                          {t(
                            part.phase === "action"
                              ? "workbench.phaseAction"
                              : part.phase === "output"
                                ? "workbench.phaseOutput"
                                : "workbench.phaseThinking",
                          )}
                        </div>
                      ) : part.kind === "text" ? (
                        <div
                          data-public-progress={
                            m.parts
                              .slice(0, m.parts.indexOf(part))
                              .filter((p) => p.kind === "phase")
                              .at(-1)?.phase === "thinking" || undefined
                          }
                        >
                          <MessageContent content={part.text} />
                        </div>
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
                            <div>
                              <ToolCall
                                call={tool}
                                defaultExpanded={
                                  tool.status === "failed" ||
                                  tool.outcome === "unknown"
                                }
                              />
                              {Boolean(tool.fileIds?.length) &&
                                tool.changeRevision ===
                                  session.changes.revision && (
                                  <div className={styles.changeSummary}>
                                    {session.changes.files
                                      .filter((file) =>
                                        tool.fileIds!.includes(file.fileId),
                                      )
                                      .map((file) => (
                                        <Button
                                          key={file.fileId}
                                          variant="ghost"
                                          size="sm"
                                          disabled={!onOpenChange}
                                          onClick={() =>
                                            onOpenChange?.(file.fileId)
                                          }
                                        >
                                          <code>{file.path}</code>
                                          {file.truncated ? (
                                            <span>
                                              {t("workbench.truncated")}
                                            </span>
                                          ) : (
                                            <span>
                                              <span
                                                className={styles.additions}
                                              >
                                                +
                                                {
                                                  file.lines.filter(
                                                    (line) =>
                                                      line.kind === "add",
                                                  ).length
                                                }
                                              </span>{" "}
                                              <span
                                                className={styles.deletions}
                                              >
                                                −
                                                {
                                                  file.lines.filter(
                                                    (line) =>
                                                      line.kind === "remove",
                                                  ).length
                                                }
                                              </span>
                                            </span>
                                          )}
                                        </Button>
                                      ))}
                                  </div>
                                )}
                              {onOpenTool && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onOpenTool(tool.id)}
                                >
                                  {t("resource.commands")}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <p className={styles.meta}>
                              {part.label} · {t("workbench.unavailable")}
                            </p>
                          )
                        })()
                      ) : part.kind === "plan" &&
                        session.plan.some(
                          (step) => step.id === part.referenceId,
                        ) ? (
                        <div className={styles.planSummary}>
                          <span>
                            {t("agentBoard.steps", {
                              completed: session.plan.filter(
                                (step) => step.status === "completed",
                              ).length,
                              total: session.plan.length,
                            })}
                          </span>{" "}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!onOpenReference}
                            onClick={() => onOpenReference?.(part)}
                          >
                            {part.label}
                          </Button>
                        </div>
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
                  ))
                ),
              )
            })()}
          </>
        ),
      })),
    [
      session.messages,
      session.tools,
      session.plan,
      session.changes,
      session.agent.name,
      onOpenChange,
      onOpenReference,
      onOpenTool,
      groupTools,
      t,
      locale,
    ],
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
        presentation={presentation}
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
