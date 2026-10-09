import { owners, SEGMENTS, STAGES, TODAY } from "./fixtures"
import type { Company, CompanyDraft, Filters, Sort } from "./model"

export function selectCompanies(
  companies: readonly Company[],
  filters: Filters,
  sort: Sort,
) {
  return companies
    .map((company, index) => ({ company, index }))
    .filter(
      ({ company: c }) =>
        (filters.owner === "all" || c.owner === filters.owner) &&
        (filters.stage === "any" || c.tags.includes(filters.stage)) &&
        c.activityDays <= filters.activity,
    )
    .sort((a, b) => {
      if (!sort) return a.index - b.index
      const av =
        sort.columnId === "name"
          ? a.company.name
          : sort.columnId === "lastInteraction"
            ? a.company.lastInteraction.date
            : a.company[
                sort.columnId as
                  "pipelineValue" | "openDeals" | "winProbability"
              ]
      const bv =
        sort.columnId === "name"
          ? b.company.name
          : sort.columnId === "lastInteraction"
            ? b.company.lastInteraction.date
            : b.company[
                sort.columnId as
                  "pipelineValue" | "openDeals" | "winProbability"
              ]
      const delta =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv, "en")
          : Number(av) - Number(bv)
      return (sort.direction === "asc" ? delta : -delta) || a.index - b.index
    })
    .map(({ company }) => company)
}
export function summarize(rows: readonly Company[]) {
  return {
    count: rows.length,
    pipeline: rows.reduce((sum, c) => sum + c.pipelineValue, 0),
    deals: rows.reduce((sum, c) => sum + c.openDeals, 0),
    win: rows.length
      ? rows.reduce((sum, c) => sum + c.winProbability, 0) / rows.length
      : null,
  }
}
export function visibleTags(tags: readonly string[]) {
  let size = 0
  const visible = tags.filter((tag, index) => {
    size += tag.length
    return index < 2 && (index === 0 || size <= 20)
  })
  return { visible, hidden: tags.length - visible.length }
}
export function activitySeries(company: Company, window: number) {
  // Explicit local windows, not merely a cosmetic selected value.
  return window === 7
    ? company.trend.slice(-7)
    : window === 30
      ? company.trend
      : [...company.trend.map((v) => Math.round(v * 0.7)), ...company.trend]
}
export function draftErrors(draft: CompanyDraft) {
  const errors: Partial<
    Record<
      keyof CompanyDraft,
      "required" | "numberError" | "dateError" | "choiceError" | "logoError"
    >
  > = {}
  if (!draft.name.trim() || draft.name.trim().length > 120)
    errors.name = "required"
  for (const key of ["openDeals", "pipelineValue", "winProbability"] as const) {
    const raw = draft[key].trim(),
      n = Number(raw)
    if (
      !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) ||
      !Number.isFinite(n) ||
      n < 0 ||
      (key === "openDeals" && !Number.isSafeInteger(n)) ||
      (key === "winProbability" && n > 100) ||
      n > Number.MAX_SAFE_INTEGER
    )
      errors[key] = "numberError"
  }
  const date = new Date(`${draft.date}T00:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.date) ||
    !Number.isFinite(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== draft.date
  )
    errors.date = "dateError"
  if (!owners.some((p) => p.name === draft.owner)) errors.owner = "choiceError"
  if (!SEGMENTS.includes(draft.segment)) errors.segment = "choiceError"
  if (!STAGES.includes(draft.stage)) errors.stage = "choiceError"
  if (!draft.interaction.trim() || draft.interaction.length > 80)
    errors.interaction = "required"
  if (
    draft.logo &&
    (!["image/png", "image/jpeg", "image/webp"].includes(draft.logo.type) ||
      draft.logo.size > 2 * 1024 * 1024)
  )
    errors.logo = "logoError"
  return errors
}
export function companyFromDraft(
  draft: CompanyDraft,
  id: string,
  logo?: string,
): Company {
  return {
    id,
    name: draft.name.trim(),
    tags: [draft.segment, draft.stage],
    owner: draft.owner,
    openDeals: Number(draft.openDeals),
    pipelineValue: Number(draft.pipelineValue),
    winProbability: Number(draft.winProbability),
    lastInteraction: { date: draft.date, label: draft.interaction.trim() },
    activityDays: Math.max(
      0,
      Math.round(
        (Date.parse(TODAY + "T00:00:00Z") -
          Date.parse(draft.date + "T00:00:00Z")) /
          86400000,
      ),
    ),
    trend: [],
    logo,
  }
}
