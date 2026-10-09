import type { Company } from "./model"
export function csvCell(value: string | number) {
  const raw = String(value)
  // Formula detection includes leading whitespace/control characters.
  const safe =
    /^[\s\u0000-\u001f]*[=+@-]/.test(raw) || /^[\t\r]/.test(raw)
      ? `'${raw}`
      : raw
  return `"${safe.replaceAll('"', '""')}"`
}
export function companiesCsv(
  rows: readonly Company[],
  headers: readonly string[],
) {
  return (
    "\uFEFF" +
    [
      headers,
      ...rows.map((c) => [
        c.name,
        c.tags.join(" / "),
        c.owner,
        c.openDeals,
        c.pipelineValue,
        c.winProbability,
        c.lastInteraction.date,
        c.lastInteraction.label,
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  )
}
export function downloadCsv(csv: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  )
  const anchor = document.createElement("a")
  try {
    anchor.href = url
    anchor.download = "sales-crm-companies-local.csv"
    document.body.append(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
