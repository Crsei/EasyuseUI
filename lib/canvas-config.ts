import type { CanvasField, CanvasValue } from "@/lib/canvas-model"
export const canvasStructuredKinds = [
  "json",
  "key-value",
  "condition",
  "schema",
] as const
export function isCanvasStructuredField(kind: CanvasField["kind"]) {
  return (canvasStructuredKinds as readonly string[]).includes(kind)
}
const record = (value: CanvasValue): value is Record<string, CanvasValue> =>
  !!value && typeof value === "object" && !Array.isArray(value)
export function canvasFieldProblem(
  kind: CanvasField["kind"],
  value: CanvasValue,
): string | undefined {
  if (
    kind === "key-value" &&
    (!record(value) ||
      Object.entries(value).some(
        ([key, value]) => !key.trim() || typeof value !== "string",
      ))
  )
    return "键值表需要非空键和字符串值。"
  if (kind === "condition") {
    if (
      !record(value) ||
      !["all", "any"].includes(String(value.match)) ||
      !Array.isArray(value.clauses) ||
      !value.clauses.length ||
      value.clauses.length > 20 ||
      value.clauses.some(
        (clause) =>
          !record(clause) ||
          typeof clause.field !== "string" ||
          !clause.field.trim() ||
          !["eq", "neq", "contains", "gt", "lt"].includes(
            String(clause.operator),
          ) ||
          typeof clause.value !== "string" ||
          (["gt", "lt"].includes(String(clause.operator)) &&
            (!clause.value.trim() || !Number.isFinite(Number(clause.value)))),
      )
    )
      return "条件需要 1–20 条有效规则，数值比较必须使用数字。"
  }
  if (kind === "schema") {
    if (
      !record(value) ||
      value.type !== "object" ||
      !record(value.properties) ||
      !Array.isArray(value.required) ||
      value.required.some(
        (key) =>
          typeof key !== "string" ||
          !record(value.properties) ||
          !(key in value.properties),
      ) ||
      Object.entries(value.properties).some(
        ([key, schema]) =>
          !key.trim() ||
          !record(schema) ||
          !["string", "number", "boolean", "object", "array"].includes(
            String(schema.type),
          ),
      )
    )
      return "Schema 需要 object、有效 properties 和 required 字段。"
  }
}
