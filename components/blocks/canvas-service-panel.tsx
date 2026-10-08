"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DataRegion, type RegionError } from "@/components/ui/data-region"
import { previewText, redactText } from "@/lib/redact"
import { canvasId } from "@/lib/canvas-model"
import type { DataState } from "@/lib/runtime-status"
import type {
  CanvasCollaborationSnapshot,
  CanvasPublicationReceipt,
} from "@/lib/canvas-services"
import styles from "./canvas-controls.module.css"

export type CanvasServicePayload =
  | { kind: "restore"; versionId: string }
  | { kind: "comment"; text: string; threadId?: string }
  | { kind: "publish"; environmentId: string }
  | { kind: "share" }
export type CanvasServiceCommand = {
  requestId: string
  documentId: string
  expectedServerRevision: string
} & CanvasServicePayload

export type CanvasServicePanelProps = {
  sourceLabel: string
  snapshot: CanvasCollaborationSnapshot
  serverRevision: string
  versions?: {
    id: string
    serverRevision: string
    createdAt: string
    author?: string
  }[]
  environments?: { id: string; name: string; available: boolean }[]
  environmentId?: string
  onEnvironmentChange?: (id: string) => void
  publication?: CanvasPublicationReceipt
  shareUrl?: string
  operation?: {
    requestId: string
    kind: CanvasServiceCommand["kind"]
    status: "pending" | "submitted" | "unknown" | "confirmed" | "rejected"
    message?: string
  }
  onCommand?: (command: CanvasServiceCommand) => void | Promise<void>
  /** Must retain unknown in caller state before a possible remount. */
  onUncertain: (command: CanvasServiceCommand) => void
  onQueryReceipt?: (requestId: string) => void | Promise<void>
  state?: DataState
  error?: RegionError
  onRetry?: () => void
  readOnly?: boolean
}
export function CanvasServicePanel({
  sourceLabel,
  snapshot,
  serverRevision,
  versions = [],
  environments = [],
  environmentId,
  onEnvironmentChange,
  publication,
  shareUrl,
  operation,
  onCommand,
  onUncertain,
  onQueryReceipt,
  state = "success",
  error,
  onRetry,
  readOnly,
}: CanvasServicePanelProps) {
  const [restore, setRestore] = useState<string>()
  const [draft, setDraft] = useState("")
  const [local, setLocal] = useState<{
    key: string
    requestId: string
    message: string
    unknown?: boolean
  }>()
  const busy = useRef(false)
  const key = `${snapshot.documentId}:${snapshot.revision}`
  const localWaiting =
    local?.key === key &&
    !(
      operation?.requestId === local.requestId &&
      ["confirmed", "rejected"].includes(operation.status)
    )
  const waiting =
    localWaiting ||
    (operation &&
      ["pending", "submitted", "unknown"].includes(operation.status))
  const locked = readOnly || !onCommand || !!waiting
  async function dispatch(payload: CanvasServicePayload) {
    if (
      locked ||
      busy.current ||
      !snapshot.permissions[
        payload.kind === "comment" ? "comment" : payload.kind
      ]
    )
      return
    const command = {
      ...payload,
      requestId: canvasId("service-request"),
      documentId: snapshot.documentId,
      expectedServerRevision: serverRevision,
    }
    busy.current = true
    setLocal({
      key,
      requestId: command.requestId,
      message: "请求提交中；结果由来源确认。",
    })
    try {
      await onCommand?.(command)
      setLocal({
        key,
        requestId: command.requestId,
        message: "请求已提交，等待来源确认。",
      })
    } catch {
      onUncertain(command)
      setLocal({
        key,
        requestId: command.requestId,
        message: "结果未确认；查询回执前禁止重复提交。",
        unknown: true,
      })
    } finally {
      busy.current = false
    }
  }
  const unknown =
    operation?.status === "unknown" || (local?.key === key && local.unknown)
  const requestId = operation?.requestId ?? local?.requestId
  const publicationValid =
    publication?.documentId === snapshot.documentId &&
    publication?.serverRevision === serverRevision
  const safeUrl = (value: string) => {
    try {
      const url = new URL(value)
      return ["https:", "http:"].includes(url.protocol) ? url.href : undefined
    } catch {
      return undefined
    }
  }
  return (
    <section className={styles.execution} aria-label="服务接入">
      <p className={styles.muted}>
        {redactText(sourceLabel)} · {redactText(serverRevision)}
        。本地撤销与服务端版本历史分开。
      </p>
      <DataRegion
        state={state}
        hasContent={
          versions.length > 0 ||
          snapshot.threads.length > 0 ||
          environments.length > 0
        }
        error={
          error
            ? {
                ...error,
                message: redactText(error.message),
                reason: redactText(error.reason),
              }
            : undefined
        }
        onRetry={onRetry}
        emptyTitle="来源尚未提供服务内容"
        emptyDescription="调用方提供版本、权限、讨论、环境和回执后显示对应内容。"
      >
        <details open>
          <summary>版本历史 · {versions.length}</summary>
          <ul className={styles.list}>
            {versions.map((version) => (
              <li key={version.id} className={styles.actions}>
                <span>
                  {redactText(version.id)} · {redactText(version.createdAt)} ·{" "}
                  {redactText(version.author ?? "—")}
                </span>
                {snapshot.permissions.restore && onCommand && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={locked}
                    onClick={() => setRestore(version.id)}
                  >
                    恢复版本 {redactText(version.id)}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </details>
        <details open>
          <summary>讨论 · {snapshot.threads.length}（与便笺分开）</summary>
          <ul className={styles.list}>
            {snapshot.threads.map((thread) => (
              <li key={thread.id}>
                <strong>
                  {redactText(thread.id)}
                  {thread.resolved ? " · 已解决" : ""}
                </strong>
                {thread.messages.map((message) => (
                  <p key={message.id}>
                    {redactText(message.author)} ·{" "}
                    {previewText(redactText(message.text)).text}
                  </p>
                ))}
              </li>
            ))}
          </ul>
          {snapshot.permissions.comment && onCommand && (
            <div className={styles.field}>
              <label htmlFor={`comment-${snapshot.documentId}`}>讨论草稿</label>
              <textarea
                id={`comment-${snapshot.documentId}`}
                value={draft}
                maxLength={4000}
                disabled={readOnly}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                size="sm"
                disabled={locked || !draft.trim()}
                onClick={() =>
                  dispatch({
                    kind: "comment",
                    text: draft.trim(),
                  })
                }
              >
                提交讨论
              </Button>
              <span className={styles.muted}>
                提交不直接插入消息；草稿保留，等待来源更新 Thread。
              </span>
            </div>
          )}
        </details>
        <details>
          <summary>协作 Presence</summary>
          <ul>
            {snapshot.presence
              .filter((member) => member.expiresAt > snapshot.asOf)
              .map((member) => (
                <li key={member.memberId}>
                  {redactText(member.name)}
                  {member.cursor
                    ? ` · 指针 ${member.cursor.x}, ${member.cursor.y}`
                    : ""}
                </li>
              ))}
          </ul>
          <p className={styles.muted}>
            临时状态，以来源 asOf 和 expiresAt 判定；不写入图文档。
          </p>
        </details>
        <div className={styles.actions}>
          {environments.length > 0 && (
            <label>
              环境
              <select
                aria-label="发布环境"
                value={environmentId ?? ""}
                disabled={readOnly || !!waiting || !onEnvironmentChange}
                onChange={(event) => onEnvironmentChange?.(event.target.value)}
              >
                <option value="">选择环境</option>
                {environments.map((environment) => (
                  <option
                    key={environment.id}
                    value={environment.id}
                    disabled={!environment.available}
                  >
                    {redactText(environment.name)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {snapshot.permissions.publish && onCommand && (
            <Button
              size="sm"
              disabled={
                locked ||
                !environments.some(
                  (environment) =>
                    environment.id === environmentId && environment.available,
                )
              }
              onClick={() =>
                dispatch({
                  kind: "publish",
                  environmentId: environmentId!,
                })
              }
            >
              发布已保存版本
            </Button>
          )}
          {snapshot.permissions.share && onCommand && (
            <Button
              size="sm"
              variant="outline"
              disabled={locked}
              onClick={() => dispatch({ kind: "share" })}
            >
              请求分享链接
            </Button>
          )}
        </div>
        {publication &&
          (publicationValid ? (
            <p>
              来源确认发布：{redactText(publication.publicationId)} ·{" "}
              {redactText(publication.environmentId)}
            </p>
          ) : (
            <p className={styles.error}>
              发布回执属于其他文档或版本，不能证明当前版本已发布。
            </p>
          ))}
        {shareUrl && safeUrl(shareUrl) && (
          <a href={safeUrl(shareUrl)} target="_blank" rel="noreferrer">
            打开来源提供的分享链接
          </a>
        )}
      </DataRegion>
      <p role="status">
        {redactText(
          operation?.message ?? (local?.key === key ? local.message : ""),
        )}
      </p>
      {unknown && requestId && onQueryReceipt && (
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            if (busy.current) return
            busy.current = true
            try {
              await onQueryReceipt(requestId)
            } catch {
              setLocal({
                key,
                requestId,
                message: "查询操作回执失败，原请求和未知结果保留。",
                unknown: true,
              })
            } finally {
              busy.current = false
            }
          }}
        >
          查询操作回执
        </Button>
      )}
      <Dialog
        open={!!restore}
        onOpenChange={(open) => {
          if (!open) setRestore(undefined)
        }}
      >
        <DialogContent>
          <DialogTitle>恢复服务端版本</DialogTitle>
          <DialogDescription>
            将版本 {redactText(restore ?? "")}{" "}
            作为新服务版本。当前本地草稿由调用方保留或合并；这不是本地撤销。
          </DialogDescription>
          <Button
            disabled={locked || !snapshot.permissions.restore}
            onClick={() => {
              if (restore)
                void dispatch({
                  kind: "restore",
                  versionId: restore,
                })
              setRestore(undefined)
            }}
          >
            确认恢复版本
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
