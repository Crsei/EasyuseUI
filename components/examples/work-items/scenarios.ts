export const scenarios = [
  "normal",
  "loading",
  "empty",
  "partial",
  "refresh-error",
  "readonly",
  "rejected",
  "field-rejected",
  "unknown",
  "agent",
  "50",
  "200",
  "1000",
] as const
export type WorkItemsScenario = (typeof scenarios)[number]
export function scenarioCount(scenario: WorkItemsScenario) {
  return scenario === "empty" || scenario === "loading"
    ? 0
    : ["50", "200", "1000"].includes(scenario)
      ? Number(scenario)
      : 24
}
