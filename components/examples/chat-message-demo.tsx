"use client"
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
  const [feedback, setFeedback] = useState("")
  const [failSend, setFailSend] = useState(false)
  function stop() {
    setMessages((current) =>
      current.map((message) =>
        message.id === "agent-1"
          ? {
              ...message,
              state: "cancelled",
              reason: "用户停止本地演示接收，已有内容保留。",
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
                content: "较早的本地历史记录。\n".repeat(4),
              },
              ...current,
            ])
          }
        >
          加载早期历史
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={failSend}
          onClick={() => setFailSend(!failSend)}
        >
          模拟发送失败
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
                      content: message.content + "\n新增一段本地演示输出。",
                      state: "streaming",
                    }
                  : message,
              ),
            )
          }
        >
          追加演示片段
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
                      reason: "演示连接断开，保留部分正文。",
                    }
                  : message,
              ),
            )
          }
        >
          模拟中断
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
            <h3 className="mb-3 text-sm font-medium">Files / 本地预览</h3>
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
              setFeedback("已添加本地消息，未向 Agent 发送请求。")
            }}
          />
        }
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback || "本地演示，片段追加由按钮触发。"}
      </p>
    </div>
  )
}
