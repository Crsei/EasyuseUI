import type { AnalyticsFilter, AnalyticsQuery } from "./analytics-model"
export type DashboardWidgetDefinition = {
  id: string
  templateId: string
  query: AnalyticsQuery
  width: 6 | 12
  height: 240 | 320 | 400
}
export type DashboardDefinition = {
  schemaVersion: 1
  id: string
  revision: number
  templateId: string
  widgets: readonly DashboardWidgetDefinition[]
  globalFilters: readonly AnalyticsFilter[]
}
/** Configuration only. Fixed templates do not offer unsaved layout editing. */
export function validateDashboardDefinition(
  value: DashboardDefinition,
): boolean {
  return (
    value.schemaVersion === 1 &&
    Number.isSafeInteger(value.revision) &&
    value.revision >= 0 &&
    new Set(value.widgets.map((w) => w.id)).size === value.widgets.length &&
    value.widgets.every(
      (w) => [6, 12].includes(w.width) && [240, 320, 400].includes(w.height),
    )
  )
}
