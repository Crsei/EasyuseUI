/** Browser scenarios supplement (and never stand in for) manual assistive technology review. */
export const uiContractEvidence = {
  button: ["forced colors retain focus, selection, errors and labels"],
  input: ["forced colors retain focus, selection, errors and labels"],
  dialog: [
    "short viewport dialogs retain actions, drafts and modal focus",
    "nested layers follow hit testing, theme and Escape ownership",
    "panel token and reduced motion govern dialog lifecycle",
  ],
  sheet: ["nested layers follow hit testing, theme and Escape ownership"],
  tree: ["forced colors retain focus, selection, errors and labels"],
  "data-table": [
    "table controls preserve selection, query identity and interactive cells",
  ],
  "data-table-controls": [
    "table controls preserve selection, query identity and interactive cells",
  ],
  "data-table-model": [
    "query sessions reject late and mismatched responses and retain refresh data",
  ],
  toolbar: ["toolbar arrows skip disabled commands and preserve input caret"],
  "command-toolbar": [
    "overflow preserves focused commands and invokes only once",
  ],
  resizable: ["nested resizable panels clamp, cancel and restore preferences"],
  "workspace-shell": [
    "inspector dimensions and confirmation retain their contracts",
  ],
  chart: [
    "lightweight chart distinguishes zero and missing reasons with a table",
  ],
} as const
