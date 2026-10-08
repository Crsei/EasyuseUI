"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CanvasField, CanvasValue } from "@/lib/canvas-model"
import { canvasFieldProblem } from "@/lib/canvas-config"
import styles from "./canvas-controls.module.css"

export type CanvasConfigEditorProps = {
  kind: CanvasField["kind"]
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}
/** Bounded structured configuration only. No expression or code is executed. */
export function CanvasConfigEditor({
  kind,
  id,
  label,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: CanvasConfigEditorProps) {
  const encode = (value: unknown) => onChange(JSON.stringify(value, null, 2))
  let parsed: CanvasValue = null
  try {
    parsed = JSON.parse(value)
  } catch {}
  const object =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : undefined
  const props = {
    id,
    value,
    disabled,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    onChange: (event: { target: { value: string } }) =>
      onChange(event.target.value),
    spellCheck: false,
  }
  if (kind === "key-value" && object && !canvasFieldProblem(kind, object)) {
    const entries = Object.entries(object) as [string, string][]
    const write = (index: number, key: string, value: string) => {
      if (entries.some(([current], i) => i !== index && current === key)) return
      encode(
        Object.fromEntries(
          entries.map((entry, i) => (i === index ? [key, value] : entry)),
        ),
      )
    }
    return (
      <fieldset
        className={styles.builder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        tabIndex={invalid ? -1 : undefined}
      >
        <legend>{label} · 键值表</legend>
        {entries.map(([key, value], index) => (
          <div key={index} className={styles.actions}>
            <label>
              键 {index + 1}
              <Input
                id={index === 0 ? id : undefined}
                aria-label={`${label} 键 ${index + 1}`}
                value={key}
                onChange={(event) => write(index, event.target.value, value)}
              />
            </label>
            <label>
              值 {index + 1}
              <Input
                aria-label={`${label} 值 ${index + 1}`}
                value={value}
                onChange={(event) => write(index, key, event.target.value)}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              aria-label={`移除${label}行 ${index + 1}`}
              onClick={() =>
                encode(
                  Object.fromEntries(entries.filter((_, i) => i !== index)),
                )
              }
            >
              移除
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={entries.length >= 50}
          onClick={() => {
            let index = entries.length + 1
            while (`key_${index}` in object) index++
            encode({ ...object, [`key_${index}`]: "" })
          }}
        >
          添加键值
        </Button>
      </fieldset>
    )
  }
  if (
    kind === "condition" &&
    object &&
    (object.match === "all" || object.match === "any") &&
    Array.isArray(object.clauses) &&
    object.clauses.every(
      (clause) =>
        clause && typeof clause === "object" && !Array.isArray(clause),
    )
  ) {
    const clauses = object.clauses as Record<string, CanvasValue>[]
    const update = (index: number, change: Record<string, CanvasValue>) =>
      encode({
        ...object,
        clauses: clauses.map((clause, i) =>
          i === index ? { ...clause, ...change } : clause,
        ),
      })
    return (
      <fieldset
        className={styles.builder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        tabIndex={invalid ? -1 : undefined}
      >
        <legend>{label} · 条件构建器</legend>
        <label>
          匹配方式
          <select
            id={id}
            aria-label="匹配方式"
            value={object.match}
            onChange={(event) =>
              encode({ ...object, match: event.target.value })
            }
          >
            <option value="all">全部满足 AND</option>
            <option value="any">任一满足 OR</option>
          </select>
        </label>
        {clauses.map((clause, index) => (
          <div key={index} className={styles.form}>
            <label>
              字段 {index + 1}
              <Input
                value={String(clause.field ?? "")}
                onChange={(event) =>
                  update(index, { field: event.target.value })
                }
              />
            </label>
            <label>
              比较 {index + 1}
              <select
                aria-label={`比较 ${index + 1}`}
                value={String(clause.operator ?? "eq")}
                onChange={(event) =>
                  update(index, { operator: event.target.value })
                }
              >
                {[
                  ["eq", "等于"],
                  ["neq", "不等于"],
                  ["contains", "包含"],
                  ["gt", "大于"],
                  ["lt", "小于"],
                ].map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              比较值 {index + 1}
              <Input
                value={String(clause.value ?? "")}
                onChange={(event) =>
                  update(index, { value: event.target.value })
                }
              />
            </label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                encode({
                  ...object,
                  clauses: clauses.filter((_, i) => i !== index),
                })
              }
            >
              移除条件 {index + 1}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={clauses.length >= 20}
          onClick={() =>
            encode({
              ...object,
              clauses: [...clauses, { field: "", operator: "eq", value: "" }],
            })
          }
        >
          添加条件
        </Button>
        {invalid && (
          <p className={styles.error}>请补全条件字段，数值比较使用数字。</p>
        )}
      </fieldset>
    )
  }
  if (
    kind === "schema" &&
    object?.type === "object" &&
    object.properties &&
    typeof object.properties === "object" &&
    !Array.isArray(object.properties) &&
    Array.isArray(object.required) &&
    Object.values(object.properties).every(
      (schema) =>
        !!schema &&
        typeof schema === "object" &&
        !Array.isArray(schema) &&
        Object.keys(schema).every((key) => key === "type") &&
        ["string", "number", "boolean", "object", "array"].includes(
          String(schema.type),
        ),
    ) &&
    Object.keys(object).every((key) =>
      ["type", "properties", "required"].includes(key),
    )
  ) {
    const properties = object.properties,
      required = object.required as string[]
    const entries = Object.entries(properties)
    const write = (index: number, name: string, type: string) => {
      if (entries.some(([key], i) => i !== index && key === name)) return
      const old = entries[index][0]
      encode({
        ...object,
        properties: Object.fromEntries(
          entries.map((entry, i) => (i === index ? [name, { type }] : entry)),
        ),
        required: required.map((key) => (key === old ? name : key)),
      })
    }
    return (
      <fieldset
        disabled={disabled}
        className={styles.builder}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        tabIndex={invalid ? -1 : undefined}
      >
        <legend>{label} · 对象 Schema</legend>
        {entries.map(([name, schema], index) => (
          <div key={index} className={styles.form}>
            <label>
              属性 {index + 1}
              <Input
                id={index === 0 ? id : undefined}
                value={name}
                onChange={(event) =>
                  write(
                    index,
                    event.target.value,
                    (schema as { type: string }).type,
                  )
                }
              />
            </label>
            <label>
              属性类型 {index + 1}
              <select
                aria-label={`属性类型 ${index + 1}`}
                value={(schema as { type: string }).type}
                onChange={(event) => write(index, name, event.target.value)}
              >
                {["string", "number", "boolean", "object", "array"].map(
                  (type) => (
                    <option key={type}>{type}</option>
                  ),
                )}
              </select>
            </label>
            <label className={styles.actions}>
              <input
                type="checkbox"
                checked={required.includes(name)}
                onChange={(event) =>
                  encode({
                    ...object,
                    required: event.target.checked
                      ? [...required, name]
                      : required.filter((key) => key !== name),
                  })
                }
              />
              必填 {index + 1}
            </label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                encode({
                  ...object,
                  properties: Object.fromEntries(
                    entries.filter((_, i) => i !== index),
                  ),
                  required: required.filter((key) => key !== name),
                })
              }
            >
              移除属性 {index + 1}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={entries.length >= 50}
          onClick={() => {
            let index = entries.length + 1
            while (`field_${index}` in properties) index++
            encode({
              ...object,
              properties: {
                ...properties,
                [`field_${index}`]: { type: "string" },
              },
            })
          }}
        >
          添加属性
        </Button>
      </fieldset>
    )
  }
  return (
    <div className={styles.field}>
      <textarea {...props} rows={kind === "code" ? 10 : 5} />
      {["key-value", "condition", "schema"].includes(kind) && (
        <p className={styles.muted}>
          当前内容不能用简化构建器编辑，原始 JSON 保留。修正后可恢复构建器。
        </p>
      )}
      {["expression", "code"].includes(kind) && (
        <p className={styles.muted}>
          仅编辑文本；不求值、不执行代码。变量绑定由节点字段另行管理。
        </p>
      )}
    </div>
  )
}
