"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { Item } from "@/components/ui/item"
import { ExecutionSessionList } from "@/components/blocks/agent-workbench/panels"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { useI18n } from "@/lib/i18n-provider"
import type { SessionSnapshot } from "@/lib/agent-workbench-model"
import type { ComponentProps } from "react"
import styles from "./reference.module.css"

export function RuntimePanel({
  session,
  ...props
}: ComponentProps<typeof ExecutionSessionList> & { session: SessionSnapshot }) {
  const { locale } = useI18n()
  const en = locale === "en"
  const [tab, setTab] = useState("output")
  const labels = en
    ? {
        output: "Output",
        tests: "Tests",
        problems: "Problems",
        events: "Events",
        logs: "Logs",
        metrics: "Metrics",
        terminal: "Terminal",
      }
    : {
        output: "输出",
        tests: "测试",
        problems: "问题",
        events: "事件",
        logs: "日志",
        metrics: "指标",
        terminal: "终端",
      }
  const failures = props.commands.filter(
    (c) => c.status === "failed" || c.outcome === "unknown",
  )
  return (
    <section
      data-runtime-panel
      className={styles.runtime}
      aria-label={en ? "Runtime records" : "运行记录"}
    >
      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <TabsList>
          {Object.entries(labels).map(([id, label]) => (
            <TabsTab key={id} value={id}>
              {label}
              {id === "problems" && failures.length > 0
                ? ` (${failures.length})`
                : ""}
            </TabsTab>
          ))}
        </TabsList>
        {(["output", "logs"] as const).map((id) => (
          <BaseTabs.Panel key={id} value={id} keepMounted>
            <ExecutionSessionList {...props} />
          </BaseTabs.Panel>
        ))}
        <BaseTabs.Panel value="tests" keepMounted>
          <p className={styles.notice}>
            {en
              ? "No structured test report supplied. Command output and its exit code remain available under Output."
              : "来源未提供结构化测试报告。命令输出及来源退出码可在输出页查看。"}
          </p>
        </BaseTabs.Panel>
        <BaseTabs.Panel value="problems" keepMounted>
          {failures.length ? (
            failures.map((c) => (
              <Item
                key={c.commandId}
                title={c.command}
                description={
                  <>
                    <RuntimeStatusBadge status={c.status} /> · {c.commandId} ·{" "}
                    {c.outcome === "unknown"
                      ? en
                        ? "Outcome unknown"
                        : "结果未知"
                      : en
                        ? "Source failure"
                        : "来源失败"}
                  </>
                }
                onSelect={() => {
                  props.onSelect(c.commandId)
                  setTab("output")
                }}
              />
            ))
          ) : (
            <p className={styles.notice}>
              {en ? "No reported problems." : "来源未报告问题。"}
            </p>
          )}
        </BaseTabs.Panel>
        <BaseTabs.Panel value="events" keepMounted>
          {session.tools.map((tool) => (
            <Item
              key={tool.id}
              title={tool.name}
              description={
                <>
                  <RuntimeStatusBadge status={tool.status} /> · {tool.id}
                </>
              }
              onSelect={
                props.onOpenTool ? () => props.onOpenTool?.(tool.id) : undefined
              }
            />
          ))}
        </BaseTabs.Panel>
        <BaseTabs.Panel value="metrics" keepMounted>
          <p className={styles.notice}>
            {en
              ? "The source does not supply structured metrics."
              : "来源未提供结构化指标。"}
          </p>
        </BaseTabs.Panel>
        <BaseTabs.Panel value="terminal" keepMounted>
          <p className={styles.notice}>
            {en
              ? "No PTY service connected. Read-only command output is available under Output."
              : "尚未连接 PTY 服务。只读命令输出可在输出页查看。"}
          </p>
        </BaseTabs.Panel>
      </Tabs>
    </section>
  )
}
