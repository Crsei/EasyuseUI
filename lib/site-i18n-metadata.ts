import componentIndex from "./component-navigation.json"

export const componentPageTitles: Record<string, string> = Object.fromEntries(
  componentIndex.map((entry) => [entry.docPath.replace(/\/$/, ""), entry.name]),
)

export const pageDescriptionKeys = {
  "/": "site.metadata_Description",
  "/style-workbench": "site.metadata_style_workbenchDescription",
  "/dictionary": "site.metadata_dictionaryDescription",
  "/scroll": "site.metadata_scrollDescription",
  "/workspace": "site.metadata_workspaceDescription",
  "/workspace/canvas": "site.metadata_workspace_canvasDescription",
} as const
