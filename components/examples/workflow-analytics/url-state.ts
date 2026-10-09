export const views = [
  "overview",
  "traceability",
  "charts",
  "agents",
  "resources",
  "delivery",
  "flow",
  "risk",
  "custom",
  "builder",
] as const
export const chartIds = [
  "status-distribution",
  "completion-trend",
  "work-item-aging",
  "blocker-distribution",
  "state-residence",
  "burndown",
  "burnup",
  "velocity",
  "cumulative-flow",
  "cycle-time",
] as const
export type ShowcaseUrl = {
  view: (typeof views)[number]
  project: string
  range: "8d" | "30d" | "90d"
  timeField: "asOf" | "createdAt" | "completedAt"
  bucket: "day" | "week" | "month"
  tz: string
  member: string
  status: string
  chart: (typeof chartIds)[number]
  widget: string
  series: string
  bucketId: string
  entity: string
  filter: string
  notice: boolean
}
export function parseShowcaseUrl(params: URLSearchParams): ShowcaseUrl {
  let notice = false
  const pick = <T extends string>(
    key: string,
    options: readonly T[],
    fallback: T,
  ) => {
    const v = params.get(key)
    if (v !== null && !options.includes(v as T)) notice = true
    return options.includes(v as T) ? (v as T) : fallback
  }
  const text = (key: string, max = 120) => {
    const v = params.get(key) ?? ""
    if (v.length > max) {
      notice = true
      return ""
    }
    return v
  }
  const allowed = [
    "view",
    "project",
    "range",
    "timeField",
    "bucket",
    "tz",
    "member",
    "status",
    "chart",
    "widget",
    "series",
    "bucketId",
    "entity",
    "filter",
  ]
  for (const key of params.keys()) if (!allowed.includes(key)) notice = true
  const selectedEntity = text("entity")
  const validEntity =
    !selectedEntity ||
    /^(idea|workItem|session|run|artifact):[A-Za-z0-9_-]+$/.test(selectedEntity)
  if (!validEntity) notice = true
  return {
    view: pick("view", views, "overview"),
    project: pick("project", ["alpha", "beta", "empty"], "alpha"),
    range: pick("range", ["8d", "30d", "90d"], "30d"),
    timeField: pick("timeField", ["asOf", "createdAt", "completedAt"], "asOf"),
    bucket: pick("bucket", ["day", "week", "month"], "day"),
    tz: pick(
      "tz",
      ["Asia/Shanghai", "UTC", "America/New_York"],
      "Asia/Shanghai",
    ),
    member: pick(
      "member",
      ["", "lin", "maya", "noah", "aria", "unmatched"],
      "",
    ),
    status: pick("status", ["", "backlog", "active", "completed"], ""),
    chart: pick("chart", chartIds, "work-item-aging"),
    widget: text("widget"),
    series: text("series"),
    bucketId: text("bucketId", 400),
    entity: validEntity ? selectedEntity : "",
    filter: text("filter", 2000),
    notice,
  }
}
export function serializeShowcaseUrl(state: ShowcaseUrl) {
  const p = new URLSearchParams()
  for (const [key, value] of Object.entries(state))
    if (key !== "notice" && value) p.set(key, String(value))
  return p.toString()
}
