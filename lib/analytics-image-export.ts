import { analyticsQueryKey } from "./analytics-query"
import type { AnalyticsQuery, AnalyticsResult } from "./analytics-model"
/** Browser-only caller action. Exports the authorized aggregate snapshot, never paginated raw records. */
export function analyticsSvgExport(
  svg: SVGSVGElement,
  input: {
    query: AnalyticsQuery
    result: AnalyticsResult
    title: string
    fixtureLabel?: string
  },
): string {
  if (input.result.queryKey !== analyticsQueryKey(input.query))
    throw new Error("Snapshot query mismatch")
  const clone = svg.cloneNode(true) as SVGSVGElement,
    originals = [svg, ...svg.querySelectorAll("*")],
    copies = [clone, ...clone.querySelectorAll("*")]
  for (let i = 0; i < copies.length; i++) {
    const el = copies[i]
    if (
      ["script", "foreignObject", "image", "use", "a"].includes(el.localName)
    ) {
      el.remove()
      continue
    }
    for (const attr of [...el.attributes])
      if (attr.name.startsWith("on") || attr.name.includes("href"))
        el.removeAttribute(attr.name)
    const computed = getComputedStyle(originals[i])
    for (const property of [
      "fill",
      "stroke",
      "color",
      "font-family",
      "font-size",
    ]) {
      const value = computed.getPropertyValue(property)
      if (value && !value.includes("url(")) el.setAttribute(property, value)
    }
  }
  const width = Math.max(svg.getBoundingClientRect().width, 320),
    height = Math.max(svg.getBoundingClientRect().height, 200),
    ns = "http://www.w3.org/2000/svg",
    root = document.createElementNS(ns, "svg")
  root.setAttribute("xmlns", ns)
  root.setAttribute("width", String(width))
  root.setAttribute("height", String(height + 96))
  clone.setAttribute("x", "0")
  clone.setAttribute("y", "80")
  root.append(clone)
  const lines = [
    input.title,
    `${input.result.unit} · ${input.query.range.from} → ${input.query.range.to} · ${input.query.timeZone}`,
    `${input.result.snapshotId} · ${input.result.completeness} · ${input.fixtureLabel ?? ""}`,
  ]
  lines.forEach((line, i) => {
    const text = document.createElementNS(ns, "text")
    text.setAttribute("x", "8")
    text.setAttribute("y", String(20 + i * 22))
    text.setAttribute("font-size", i ? "11" : "16")
    text.setAttribute("fill", getComputedStyle(svg).color)
    text.textContent = line
    root.append(text)
  })
  return new XMLSerializer().serializeToString(root)
}
