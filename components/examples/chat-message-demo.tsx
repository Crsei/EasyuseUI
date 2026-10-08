"use client"
import { useSiteFeedback, siteMessage } from "@/components/site/site-i18n"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useState } from "react"
import {
  Conversation,
  ChatComposer,
  type ChatMessageProps,
} from "@/components/blocks/chat-message"
import { ToolCall } from "@/components/blocks/tool-call"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
export function ChatMessageDemo() {
  const { t } = useSiteI18n()

  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      id: "user-1",
      role: "user",
      content: "按规范实现工作台组件。",
      time: "16:40",
    },
    {
      id: "agent-1",
      role: "agent",
      author: "Builder",
      content: "已读取尺寸契约。消息保留在同一内容轴，工具执行单独展示。",
      state: "streaming",
      stage: "读取规范",
      elapsed: "00:24",
      time: "16:42",
    },
  ])
  const [feedback, setFeedback] = useSiteFeedback("")
  const [failSend, setFailSend] = useState(false)
  function stop() {
    setMessages((current) =>
      current.map((message) =>
        message.id === "agent-1"
          ? {
              ...message,
              state: "cancelled",
              reason: t("site.theUserStoppedTheLocalDemoStreamReceivedContent"),
            }
          : message,
      ),
    )
  }
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            setMessages((current) => [
              {
                id: `history-${current.length}`,
                role: "system",
                content: t("site.earlierLocalHistoryRecord").repeat(4),
              },
              ...current,
            ])
          }
        >
          {t("site.loadEarlierHistory")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={failSend}
          onClick={() => setFailSend(!failSend)}
        >
          {t("site.simulateSendFailure")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            setMessages((current) =>
              current.map((message) =>
                message.id === "agent-1"
                  ? {
                      ...message,
                      content:
                        message.content + t("site.aNewLocalDemoOutputFragment"),
                      state: "streaming",
                    }
                  : message,
              ),
            )
          }
        >
          {t("site.appendDemoFragment")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            setMessages((current) =>
              current.map((message) =>
                message.id === "agent-1"
                  ? {
                      ...message,
                      state: "interrupted",
                      reason: t(
                        "site.demoConnectionInterruptedPartialTextPreserved",
                      ),
                    }
                  : message,
              ),
            )
          }
        >
          {t("site.simulateInterruption")}
        </Button>
      </div>
      <Conversation
        messages={messages.map((message) => ({
          ...message,
          onStop: message.id === "agent-1" ? stop : undefined,
          after:
            message.id === "agent-1" ? (
              <ToolCall
                call={{
                  id: "read-1",
                  name: "read_file",
                  target: "Component-Specification.md",
                  status: "completed",
                  arguments: { path: "Component-Specification.md" },
                  output: "Button: 32px\nItem: 56px\nInspector: 320px",
                  duration: "24ms",
                  exitCode: 0,
                }}
              />
            ) : undefined,
        }))}
        workspace={
          <>
            <h3 className="mb-3 text-sm font-medium">
              {t("site.filesLocalPreview")}
            </h3>
            <Item title="Component-Specification.md" />
            <pre className="mt-3 overflow-auto text-xs">
              {"+ Tree\n+ ActivityTimeline\n+ ChatMessage\n+ ToolCall"}
            </pre>
          </>
        }
        composer={
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSend={(text) => {
              if (failSend)
                return Promise.reject(new Error("Local demo rejection"))
              setMessages((current) => [
                ...current,
                { id: `local-${current.length}`, role: "user", content: text },
              ])
              setDraft("")
              setFeedback(
                siteMessage("site.localMessageAddedNoRequestSentToAnAgent"),
              )
            }}
          />
        }
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback || t("site.localDemoAppendFragmentsWithTheButton")}
      </p>
    </div>
  )
}
