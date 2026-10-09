export const normalizeTerm = (value) =>
  value.toLowerCase().replace(/[\s-]/g, "")
const aliases = {
  table: "data-table",
  filterchip: "chip",
  pilltabs: "tabs",
  togglebutton: "toggle",
  divider: "separator",
  commandbar: "command-toolbar",
  segmentedcontrol: "segmented",
  splitview: "resizable",
  timeline: "activity-timeline",
  activityfeed: "activity-timeline",
  workspace: "workspace-shell",
  styleworkbench: "style-workbench",
  conversation: "chat-message",
  modal: "dialog",
  dropdownmenu: "dropdown-menu",
  emptystate: "data-region",
}
export function dictionaryEntry(term, entries) {
  const primary = normalizeTerm(term.split("/")[0].replace(/`/g, "").trim())
  const alias =
    primary === "timeline" && term.includes("Axis")
      ? "timeline"
      : aliases[primary]
  return (
    entries.find((entry) => entry.slug === alias) ??
    entries.find(
      (entry) =>
        normalizeTerm(entry.name) === primary ||
        entry.slug === aliases[primary],
    )
  )
}
export function synchronizeDictionary(source, entries) {
  return source
    .split("\n")
    .map((line) => {
      if (!line.startsWith("|")) return line
      const cells = line.split("|")
      const entry = dictionaryEntry(cells[1], entries)
      if (!entry || cells[cells.length - 2].trim().startsWith("已有"))
        return line
      cells[cells.length - 2] =
        ` 已有：\`${entry.name}\`；[源码](${entry.source}) / [文档](${entry.docPath}) / Registry \`${entry.registryId}\` `
      return cells.join("|")
    })
    .join("\n")
}
export function checkDictionary(source, entries) {
  for (const line of source.split("\n")) {
    if (!line.startsWith("|")) continue
    const cells = line.split("|"),
      entry = dictionaryEntry(cells[1], entries)
    if (!entry && cells[cells.length - 2].trim().startsWith("已有"))
      throw new Error(
        `Available term has no component mapping: ${cells[1].trim()}`,
      )
    if (entry && !cells[cells.length - 2].trim().startsWith("已有"))
      throw new Error(`Availability mismatch: ${entry.slug}`)
  }
}
