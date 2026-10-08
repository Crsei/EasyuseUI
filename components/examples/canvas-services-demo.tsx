"use client"

import { useState } from "react"
import { CanvasWorkspace } from "@/components/blocks/canvas-workspace"
import type { CanvasServicePanelProps } from "@/components/blocks/canvas-service-panel"
import { Button } from "@/components/ui/button"
import { useCanvasEditor } from "@/lib/use-canvas-editor"
import { useCanvasPersistence } from "@/lib/use-canvas-persistence"
import {
  createCanvasPersistence,
  type CanvasSaveReceipt,
  type CanvasWriteResult,
  type CanvasCollaborationSnapshot,
} from "@/lib/canvas-services"
import { basicCanvasDocument, canvasDefinitions } from "./canvas-fixtures"
import styles from "./canvas-demo.module.css"
function fixtureStorage() {
  let mode = "normal",
    revision = 1
  const receipts = new Map<string, CanvasSaveReceipt>()
  return {
    setMode: (value: string) => {
      mode = value
    },
    adapter: {
      async save(
        request: Parameters<
          Parameters<typeof createCanvasPersistence>[2]["save"]
        >[0],
      ): Promise<CanvasWriteResult> {
        if (mode === "conflict") {
          revision++
          return { kind: "conflict", serverRevision: `fixture-${revision}` }
        }
        const receipt = {
          documentId: request.document.id,
          documentRevision: request.document.revision,
          requestId: request.requestId,
          serverRevision: `fixture-${++revision}`,
        }
        receipts.set(request.requestId, receipt)
        if (mode === "unknown") throw new Error("Fixture lost response")
        return { kind: "saved", receipt }
      },
      async querySave(requestId: string): Promise<CanvasWriteResult> {
        const receipt = receipts.get(requestId)
        return receipt
          ? { kind: "saved", receipt }
          : { kind: "rejected", message: "本地 fixture 确认没有写入。" }
      },
    },
  }
}
export function CanvasServicesDemo({
  layout = "preview",
}: { layout?: "preview" | "fill" } = {}) {
  const [initial] = useState(basicCanvasDocument),
    [fixture] = useState(fixtureStorage)
  const [session] = useState(() =>
    createCanvasPersistence(initial, "fixture-1", fixture.adapter),
  )
  const editor = useCanvasEditor(initial, canvasDefinitions)
  const persistence = useCanvasPersistence(editor.document, session)
  const [snapshot, setSnapshot] = useState<CanvasCollaborationSnapshot>({
    documentId: initial.id,
    revision: "fixture-1",
    asOf: 0,
    threads: [],
    presence: [],
    permissions: { comment: true, restore: true, share: true, publish: true },
  })
  const [operation, setOperation] =
    useState<CanvasServicePanelProps["operation"]>()
  const [environment, setEnvironment] = useState("test")
  const services: CanvasServicePanelProps = {
    sourceLabel: "仅本地 fixture，非真实服务",
    snapshot,
    serverRevision: persistence.state.serverRevision,
    versions: [
      {
        id: "fixture-initial",
        serverRevision: "fixture-1",
        createdAt: "本地初始快照",
        author: "fixture",
      },
    ],
    environments: [
      { id: "test", name: "测试环境（fixture）", available: true },
    ],
    environmentId: environment,
    onEnvironmentChange: setEnvironment,
    operation,
    onUncertain: (command) =>
      setOperation({
        requestId: command.requestId,
        kind: command.kind,
        status: "unknown",
        message: "本地 fixture 模拟发布响应丢失，请查询操作回执。",
      }),
    onQueryReceipt: async (requestId) =>
      setOperation(
        (current) =>
          current && {
            ...current,
            requestId,
            status: "rejected",
            message: "fixture 确认未发布。没有真实发布服务。",
          },
      ),
    onCommand: async (command) => {
      setOperation({
        requestId: command.requestId,
        kind: command.kind,
        status: "pending",
      })
      if (command.kind === "publish")
        throw new Error("Fixture publication response lost")
      if (command.kind === "restore")
        editor.onCommand({ type: "replace", document: initial })
      setSnapshot((current) => ({
        ...current,
        revision: `${current.revision}-next`,
        threads:
          command.kind === "comment"
            ? [
                ...current.threads,
                {
                  id: command.requestId,
                  resolved: false,
                  messages: [
                    {
                      id: command.requestId,
                      author: "本地 fixture 用户",
                      text: command.text,
                      createdAt: "fixture",
                    },
                  ],
                },
              ]
            : current.threads,
      }))
      setOperation({
        requestId: command.requestId,
        kind: command.kind,
        status: command.kind === "share" ? "rejected" : "confirmed",
        message:
          command.kind === "share"
            ? "fixture 未提供分享服务。"
            : "本地 fixture 确认收到操作；不代表真实服务。",
      })
    },
  }
  return (
    <div className={layout === "fill" ? styles.fill : "space-y-4"}>
      <p
        className={
          layout === "fill" ? styles.notice : "text-sm text-muted-foreground"
        }
      >
        所有保存回执、版本、讨论与权限均为显式本地夹具。发布只演示未知结果和查询，不模拟发布成功。
      </p>
      <div
        className={
          layout === "fill"
            ? styles.serviceOptions
            : "flex flex-wrap items-center gap-2"
        }
      >
        <label>
          保存 fixture{" "}
          <select
            aria-label="保存 fixture"
            className="h-8 rounded border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
            onChange={(event) => fixture.setMode(event.target.value)}
          >
            <option value="normal">正常回执</option>
            <option value="unknown">响应丢失</option>
            <option value="conflict">版本冲突</option>
          </select>
        </label>
        {persistence.state.status === "conflict" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              persistence.resolveConflict(
                editor.document,
                persistence.state.conflictingRevision!,
              )
            }
          >
            以当前草稿明确处理 fixture 冲突
          </Button>
        )}
      </div>
      <CanvasWorkspace
        layout={layout}
        {...editor}
        definitions={canvasDefinitions}
        persistence={persistence}
        services={services}
      />
    </div>
  )
}
