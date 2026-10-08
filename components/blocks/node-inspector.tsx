"use client"

import { useId, useRef, useState } from "react"
import { CanvasConfigEditor } from "@/components/blocks/canvas-config-editor"
import { isCanvasStructuredField } from "@/lib/canvas-config"
import { Inspector } from "@/components/blocks/inspector"
import { VariablePicker } from "@/components/blocks/variable-picker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  validateCanvasConfig,
  validateCanvasVariable,
  parseCanvasDocument,
} from "@/lib/canvas-validation"
import type {
  CanvasCommand,
  CanvasDocument,
  CanvasNodeDefinition,
  CanvasNodeRecord,
  CanvasValue,
  CanvasVariable,
  CanvasIssue,
  CanvasCatalogs,
} from "@/lib/canvas-model"
import styles from "./canvas-controls.module.css"

export type CanvasInspectorDraft = {
  source: string
  title: string
  values: Record<string, string>
  bindings: Record<string, CanvasVariable>
  errors: Record<string, string>
}
export type NodeInspectorProps = {
  document: CanvasDocument
  definitions: CanvasNodeDefinition[]
  nodeId?: string
  onCommand?: (command: CanvasCommand) => void
  readOnly?: boolean
  issues?: CanvasIssue[]
  catalogs?: CanvasCatalogs
  draftStore?: Record<string, CanvasInspectorDraft>
  onDraftStoreChange?: (drafts: Record<string, CanvasInspectorDraft>) => void
}
function makeDraft(
  node: CanvasNodeRecord,
  definition: CanvasNodeDefinition,
): CanvasInspectorDraft {
  return {
    source: JSON.stringify([node.title, node.config, node.bindings]),
    title: node.title,
    values: Object.fromEntries(
      (definition.fields ?? []).map((field) => [
        field.key,
        isCanvasStructuredField(field.kind)
          ? JSON.stringify(node.config[field.key] ?? null, null, 2)
          : String(node.config[field.key] ?? ""),
      ]),
    ),
    bindings: structuredClone(node.bindings ?? {}),
    errors: {},
  }
}
/** Drafts are keyed by stable object ID and the controlled configuration snapshot. */
export function NodeInspector({
  document,
  definitions,
  nodeId,
  onCommand,
  readOnly,
  issues = [],
  catalogs,
  draftStore,
  onDraftStoreChange,
}: NodeInspectorProps) {
  const [localDrafts, setLocalDrafts] = useState<
    Record<string, CanvasInspectorDraft>
  >({})
  const drafts = draftStore ?? localDrafts
  function setDrafts(next: Record<string, CanvasInspectorDraft>) {
    if (onDraftStoreChange) onDraftStoreChange(next)
    else setLocalDrafts(next)
  }
  const [variableField, setVariableField] = useState<string>()
  const formRef = useRef<HTMLFormElement>(null)
  const prefix = useId()
  const node = document.nodes.find((item) => item.id === nodeId)
  const definition = definitions.find((item) => item.type === node?.type)
  const object = node
    ? {
        id: node.id,
        title: node.title,
        kind: definition?.label ?? "未知节点",
        metadata: [
          { label: "节点 ID", value: node.id, copyValue: node.id },
          { label: "节点类型", value: node.type },
          { label: "位置", value: `${node.position.x}, ${node.position.y}` },
        ],
      }
    : null
  if (!node || !definition)
    return (
      <Inspector
        object={object}
        emptyDescription="选择一个节点来编辑配置；选择连线可重连或断开。"
      >
        {node && (
          <p className={styles.muted}>
            缺少对应节点定义，原始配置和端口引用已保留。可导出文档；此节点不能配置。
          </p>
        )}
      </Inspector>
    )
  const fresh = makeDraft(node, definition)
  const draft =
    drafts[node.id]?.source === fresh.source ? drafts[node.id] : fresh
  const locked = readOnly || !onCommand
  function update(change: Partial<CanvasInspectorDraft>) {
    setDrafts({ ...drafts, [node!.id]: { ...draft, ...change } })
  }
  function apply() {
    const errors: Record<string, string> = {}
    const config = structuredClone(node!.config)
    for (const field of definition!.fields ?? []) {
      if (draft.bindings[field.key]) continue
      const value = draft.values[field.key] ?? ""
      try {
        config[field.key] = isCanvasStructuredField(field.kind)
          ? (JSON.parse(value) as CanvasValue)
          : field.kind === "number"
            ? value.trim()
              ? Number(value)
              : null
            : value
      } catch {
        errors[field.key] = `${field.label}不是有效 JSON。`
      }
    }
    const candidate = {
      ...node!,
      title: draft.title,
      config,
      bindings: draft.bindings,
    }
    if (!draft.title.trim()) errors.title = "节点名称不能为空。"
    Object.assign(errors, validateCanvasConfig(candidate, definition!))
    for (const field of definition!.fields ?? [])
      if (
        field.catalog &&
        !draft.bindings[field.key] &&
        !catalogs?.[field.catalog]?.some(
          (entry) => entry.id === config[field.key] && entry.available,
        )
      )
        errors[field.key] = `${field.label}引用不可用，请重新选择。`
    for (const [field, reference] of Object.entries(draft.bindings)) {
      const error = validateCanvasVariable(
        document,
        definitions,
        candidate,
        field,
        reference,
      )
      if (error) errors[field] = error
    }
    update({ errors })
    if (Object.keys(errors).length) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>("[aria-invalid=true]")
          ?.focus(),
      )
      return
    }
    if (!locked) {
      try {
        parseCanvasDocument(
          JSON.stringify({
            ...document,
            nodes: document.nodes.map((item) =>
              item.id === candidate.id ? candidate : item,
            ),
          }),
          definitions,
          undefined,
          { allowInvalidBindings: true },
        )
      } catch (error) {
        update({
          errors: {
            ...errors,
            custom:
              error instanceof Error ? error.message : "配置无法写入文档。",
          },
        })
        return
      }
      onCommand?.({
        type: "configure",
        nodeId: node!.id,
        title: draft.title.trim(),
        config,
        bindings: draft.bindings,
      })
      const next = { ...drafts }
      delete next[node!.id]
      setDrafts(next)
    }
  }
  return (
    <Inspector object={object}>
      <form
        ref={formRef}
        noValidate
        className={styles.form}
        aria-label="节点配置"
        onSubmit={(event) => {
          event.preventDefault()
          apply()
        }}
      >
        <label className={styles.field} htmlFor={`${prefix}-title`}>
          节点名称
          <Input
            id={`${prefix}-title`}
            disabled={locked}
            value={draft.title}
            aria-invalid={!!draft.errors.title}
            aria-describedby={
              draft.errors.title ? `${prefix}-title-error` : undefined
            }
            onChange={(event) => update({ title: event.target.value })}
          />
          {draft.errors.title && (
            <span id={`${prefix}-title-error`} className={styles.error}>
              {draft.errors.title}
            </span>
          )}
        </label>
        {(definition.fields ?? []).map((field) => {
          const id = `${prefix}-${field.key}`
          const reference = draft.bindings[field.key]
          const inputProps = {
            id,
            disabled: locked || !!reference,
            value: draft.values[field.key] ?? "",
            "aria-invalid": !!draft.errors[field.key],
            "aria-describedby": draft.errors[field.key]
              ? `${id}-error`
              : undefined,
            onChange: (event: { target: { value: string } }) =>
              update({
                values: { ...draft.values, [field.key]: event.target.value },
              }),
          }
          return (
            <div key={field.key} className={styles.field}>
              <label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </label>
              {field.catalog ? (
                <select {...inputProps}>
                  <option value="">选择{field.label}</option>
                  {draft.values[field.key] &&
                    !catalogs?.[field.catalog]?.some(
                      (entry) => entry.id === draft.values[field.key],
                    ) && (
                      <option value={draft.values[field.key]}>
                        当前引用不可用
                      </option>
                    )}
                  {catalogs?.[field.catalog]?.map((entry) => (
                    <option
                      key={entry.id}
                      value={entry.id}
                      disabled={!entry.available}
                    >
                      {entry.name}
                      {entry.available ? "" : " · 不可用"}
                    </option>
                  ))}
                </select>
              ) : isCanvasStructuredField(field.kind) ||
                field.kind === "expression" ||
                field.kind === "code" ? (
                <CanvasConfigEditor
                  kind={field.kind}
                  id={id}
                  label={field.label}
                  value={inputProps.value}
                  disabled={inputProps.disabled}
                  invalid={inputProps["aria-invalid"]}
                  describedBy={inputProps["aria-describedby"]}
                  onChange={(value) =>
                    inputProps.onChange({ target: { value } })
                  }
                />
              ) : field.kind === "textarea" ? (
                <textarea
                  {...inputProps}
                  rows={isCanvasStructuredField(field.kind) ? 5 : 3}
                  spellCheck={false}
                />
              ) : field.kind === "select" ? (
                <select {...inputProps}>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  {...inputProps}
                  type={field.kind === "number" ? "number" : "text"}
                  step={field.kind === "number" ? "any" : undefined}
                  min={field.min}
                  max={field.max}
                />
              )}
              {reference && (
                <p className={styles.muted}>
                  引用：
                  {document.nodes.find((item) => item.id === reference.nodeId)
                    ?.title ?? "来源已删除"}{" "}
                  / {reference.portId}
                  {reference.path.length
                    ? `.${reference.path.join(".")}`
                    : ""}{" "}
                  · {reference.type}
                </p>
              )}
              {draft.errors[field.key] && (
                <span id={`${id}-error`} className={styles.error}>
                  {draft.errors[field.key]}
                </span>
              )}
              {field.variableType && (
                <div className={styles.actions}>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={locked}
                    onClick={() => setVariableField(field.key)}
                  >
                    选择{field.label}变量
                  </Button>
                  {reference && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={locked}
                      onClick={() => {
                        const bindings = { ...draft.bindings }
                        delete bindings[field.key]
                        update({ bindings })
                      }}
                    >
                      移除绑定
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {Object.entries(draft.errors)
          .filter(([key]) => key.startsWith("custom"))
          .map(([key, message]) => (
            <p key={key} className={styles.error}>
              {message}
            </p>
          ))}
        <div className={styles.actions}>
          <Button type="submit" disabled={locked}>
            应用配置
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={locked}
            onClick={() => {
              const next = { ...drafts }
              delete next[node.id]
              setDrafts(next)
            }}
          >
            放弃修改
          </Button>
        </div>
        <p className={styles.muted}>
          字段修改在应用前仅保留于当前对象草稿。无效输入不会覆盖图文档。
        </p>
        {issues
          .filter((issue) => issue.nodeId === node.id)
          .map((issue, index) => (
            <p key={index} className={styles.error}>
              {issue.message}
            </p>
          ))}
      </form>
      <Dialog
        open={!!variableField}
        onOpenChange={(open) => {
          if (!open) setVariableField(undefined)
        }}
      >
        <DialogContent className={styles.dialog}>
          <DialogTitle>选择上游变量</DialogTitle>
          <DialogDescription>
            仅展示当前节点可达上游的兼容输出。引用关联稳定 ID。
          </DialogDescription>
          {variableField && (
            <VariablePicker
              document={document}
              definitions={definitions}
              targetId={node.id}
              expectedType={
                definition.fields?.find((field) => field.key === variableField)
                  ?.variableType
              }
              readOnly={locked}
              onInsert={(reference) => {
                update({
                  bindings: { ...draft.bindings, [variableField]: reference },
                })
                setVariableField(undefined)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Inspector>
  )
}
