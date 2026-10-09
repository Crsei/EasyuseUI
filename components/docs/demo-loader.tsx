"use client"

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import { Button } from "@/components/ui/button"
import { useSiteI18n } from "@/components/site/site-i18n"

function completionDemo<M extends Record<string, ComponentType>>(
  load: () => Promise<M>,
  name: keyof M,
): () => Promise<ComponentType> {
  return () => load().then((module) => module[name])
}
const loadCompletion0 = () =>
  import("@/components/examples/control-composition-demo")
const loadCompletion1 = () => import("@/components/examples/disclosure-demo")
const loadCompletion2 = () => import("@/components/examples/feedback-demo")
const loadCompletion3 = () =>
  import("@/components/examples/date-navigation-demo")
const loadCompletion4 = () =>
  import("@/components/examples/conversation-extensions-demo")
const loadCompletion5 = () => import("@/components/examples/content-chart-demo")
const loadCompletion6 = () =>
  import("@/components/examples/layout-integration-demo")

// Explicit import paths let Webpack create isolated chunks. No eager demo imports.
export const demoLoaders: Record<string, () => Promise<ComponentType>> = {
  // BEGIN agent workbench
  "session-navigator": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="session-navigator" />
        },
    ),
  "project-switcher": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="project-switcher" />
        },
    ),
  "session-header": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="session-header" />
        },
    ),
  "context-panel": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="context-panel" />
        },
    ),
  "context-picker": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="context-picker" />
        },
    ),
  "message-content": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="message-content" />
        },
    ),
  "agent-conversation": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="agent-conversation" />
        },
    ),
  "composer-controls": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="composer-controls" />
        },
    ),
  "agent-composer": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="agent-composer" />
        },
    ),
  "file-viewer": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="file-viewer" />
        },
    ),
  "diff-viewer": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="diff-viewer" />
        },
    ),
  "change-review-panel": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="change-review-panel" />
        },
    ),
  "workbench-panel-tabs": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="workbench-panel-tabs" />
        },
    ),
  "execution-output-panel": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="execution-output-panel" />
        },
    ),
  "preview-panel": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="preview-panel" />
        },
    ),
  "agent-workbench": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="agent-workbench" />
        },
    ),
  "task-inbox": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="task-inbox" />
        },
    ),
  "agent-workbench-model": () =>
    import("@/components/examples/agent-workbench/component-demos").then(
      (m) =>
        function Demo() {
          return <m.WorkbenchComponentDemo region="agent-workbench-model" />
        },
    ),
  // END agent workbench

  "toolbar": () => import("@/components/examples/gap-audit-demo").then(m => m.ToolbarDemo),
  "command-toolbar": () => import("@/components/examples/gap-audit-demo").then(m => m.CommandToolbarDemo),
  "data-table-controls": () => import("@/components/examples/gap-audit-demo").then(m => m.DataTableQueryDemo),
  "data-table-model": () => import("@/components/examples/gap-audit-demo").then(m => m.DataTableQueryDemo),
  // BEGIN shadcn completion
  "button-group": completionDemo(loadCompletion0, "ButtonGroupDemo"),
  "input-group": completionDemo(loadCompletion0, "InputGroupDemo"),
  toggle: completionDemo(loadCompletion0, "ToggleDemo"),
  "toggle-group": completionDemo(loadCompletion0, "ToggleGroupDemo"),
  "input-otp": completionDemo(loadCompletion0, "InputOTPDemo"),
  separator: completionDemo(loadCompletion1, "SeparatorDemo"),
  collapsible: completionDemo(loadCompletion1, "CollapsibleDemo"),
  accordion: completionDemo(loadCompletion1, "AccordionDemo"),
  tooltip: completionDemo(loadCompletion1, "TooltipDemo"),
  "alert-dialog": completionDemo(loadCompletion1, "AlertDialogDemo"),
  "hover-card": completionDemo(loadCompletion1, "HoverCardDemo"),
  "context-menu": completionDemo(loadCompletion1, "ContextMenuDemo"),
  skeleton: completionDemo(loadCompletion2, "SkeletonDemo"),
  spinner: completionDemo(loadCompletion2, "SpinnerDemo"),
  empty: completionDemo(loadCompletion2, "EmptyDemo"),
  alert: completionDemo(loadCompletion2, "AlertDemo"),
  progress: completionDemo(loadCompletion2, "ProgressDemo"),
  toast: completionDemo(loadCompletion2, "ToastDemo"),
  sonner: completionDemo(loadCompletion2, "SonnerDemo"),
  "date-calendar": completionDemo(loadCompletion3, "DateCalendarDemo"),
  "date-picker": completionDemo(loadCompletion3, "DatePickerDemo"),
  pagination: completionDemo(loadCompletion3, "PaginationDemo"),
  breadcrumb: completionDemo(loadCompletion3, "BreadcrumbDemo"),
  menubar: completionDemo(loadCompletion3, "MenubarDemo"),
  "navigation-menu": completionDemo(loadCompletion3, "NavigationMenuDemo"),
  direction: completionDemo(loadCompletion3, "DirectionDemo"),
  attachment: completionDemo(loadCompletion4, "AttachmentDemo"),
  marker: completionDemo(loadCompletion4, "MarkerDemo"),
  questionnaire: completionDemo(loadCompletion4, "QuestionnaireDemo"),
  bubble: completionDemo(loadCompletion4, "BubbleDemo"),
  card: completionDemo(loadCompletion5, "CardDemo"),
  "aspect-ratio": completionDemo(loadCompletion5, "AspectRatioDemo"),
  carousel: completionDemo(loadCompletion5, "CarouselDemo"),
  chart: completionDemo(loadCompletion5, "ChartDemo"),
  form: completionDemo(loadCompletion6, "FormDemo"),
  sidebar: completionDemo(loadCompletion6, "SidebarDemo"),
  resizable: completionDemo(loadCompletion6, "ResizableDemo"),
  "scroll-area": completionDemo(loadCompletion6, "ScrollAreaDemo"),
  command: completionDemo(loadCompletion6, "CommandDemo"),
  drawer: completionDemo(loadCompletion6, "DrawerDemo"),
  // END shadcn completion
  "analytics-model": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.AnalyticsModelDemo,
    ),
  "chart-model": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.AnalyticsModelDemo,
    ),
  "chart-frame": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.StatisticalChartDemo,
    ),
  "chart-data-table": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.ChartDataTableDemo,
    ),
  "statistical-chart": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.StatisticalChartDemo,
    ),
  "chart-drilldown-panel": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.ChartDrilldownDemo,
    ),
  "workflow-metric": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.WorkflowMetricDemo,
    ),
  "workflow-charts": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.ProjectOverviewDemo,
    ),
  "risk-evidence-list": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.RiskEvidenceDemo,
    ),
  "work-traceability-view": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.WorkTraceabilityDemo,
    ),
  "work-items-view-adapter": () =>
    import("@/components/examples/workflow-analytics/workflow-analytics-demo").then(
      (m) => m.WorkflowAnalyticsDemo,
    ),
  dashboard: () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.ProjectOverviewDemo,
    ),
  "project-overview-dashboard": () =>
    import("@/components/examples/workflow-analytics/component-demos").then(
      (m) => m.ProjectOverviewDemo,
    ),
  timeline: () =>
    import("@/components/examples/work-items-schedule-demo").then(
      (m) => m.TimelineDemo,
    ),
  calendar: () =>
    import("@/components/examples/work-items-schedule-demo").then(
      (m) => m.CalendarDemo,
    ),
  "schedule-view-controls": () =>
    import("@/components/examples/work-items-schedule-demo").then(
      (m) => m.ScheduleViewControlsDemo,
    ),
  "work-item-date-range-field": () =>
    import("@/components/examples/work-items-schedule-demo").then(
      (m) => m.WorkItemDateRangeFieldDemo,
    ),
  "work-items-schedule": () =>
    import("@/components/examples/work-items-schedule-demo").then(
      (m) => m.UnscheduledWorkItemsDemo,
    ),
  "work-item-timeline": () =>
    import("@/components/examples/work-items-schedule-demo").then(
      (m) => m.WorkItemTimelineDemo,
    ),
  "work-item-calendar": () =>
    import("@/components/examples/work-items-schedule-demo").then(
      (m) => m.WorkItemCalendarDemo,
    ),

  "agent-dependency-graph": () =>
    import("@/components/examples/agent-board/p2-demos").then(
      (module) => module.AgentDependencyGraphDemo,
    ),
  "agent-usage-history": () =>
    import("@/components/examples/agent-board/p2-demos").then(
      (module) => module.AgentUsageHistoryDemo,
    ),
  "agent-run-virtual-list": () =>
    import("@/components/examples/agent-board/p2-demos").then(
      (module) => module.AgentRunVirtualListDemo,
    ),

  "work-items-board-base": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.ItemBoardDemo,
    ),
  "work-item-properties": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemPropertiesDemo,
    ),
  "work-item-row": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemRowDemo,
    ),
  "work-item-card": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemCardDemo,
    ),
  "work-item-list": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemListDemo,
    ),
  "work-item-board": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemBoardDemo,
    ),
  "work-item-table": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemTableDemo,
    ),
  "work-items-toolbar": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemsToolbarDemo,
    ),
  "work-item-detail": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemDetailDemo,
    ),
  "work-items-batch-actions": () =>
    import("@/components/examples/work-items-enhancements-demo").then(
      (m) => m.WorkItemsBatchActionsDemo,
    ),
  "work-items-saved-views": () =>
    import("@/components/examples/work-items-enhancements-demo").then(
      (m) => m.WorkItemsSavedViewsDemo,
    ),
  "work-items-workspace": () =>
    import("@/components/examples/work-items-components-demo").then(
      (m) => m.WorkItemsWorkspaceDemo,
    ),

  "agent-run-properties": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentRunPropertiesDemo,
    ),
  "run-stage-summary": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.RunStageSummaryDemo,
    ),
  "agent-run-row": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentRunRowDemo,
    ),
  "agent-run-card": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentRunCardDemo,
    ),
  "agent-run-list": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentRunListDemo,
    ),
  "agent-run-board": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentRunBoardDemo,
    ),
  "agent-run-inspector": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentRunInspectorDemo,
    ),
  "attention-queue": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AttentionQueueDemo,
    ),
  "approval-request-panel": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.ApprovalRequestPanelDemo,
    ),
  "artifact-list": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.ArtifactListDemo,
    ),
  "review-summary": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.ReviewSummaryDemo,
    ),
  "execution-trace-tree": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.ExecutionTraceTreeDemo,
    ),
  "agent-relationship-list": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentRelationshipListDemo,
    ),
  "agent-usage-summary": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentUsageSummaryDemo,
    ),
  "agent-board-toolbar": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.AgentBoardToolbarDemo,
    ),
  "agent-board-workspace": () =>
    import("@/components/examples/agent-board/agent-board-demo").then(
      (module) => module.AgentBoardDemo,
    ),
  "grouped-list": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.GroupedListDemo,
    ),
  "item-board": () =>
    import("@/components/examples/agent-board/component-demos").then(
      (module) => module.BoardDemo,
    ),
  textarea: () =>
    import("@/components/examples/form-primitives-demo").then(
      (module) => module.TextareaDemo,
    ),
  label: () =>
    import("@/components/examples/form-primitives-demo").then(
      (module) => module.LabelDemo,
    ),
  "native-select": () =>
    import("@/components/examples/form-primitives-demo").then(
      (module) => module.NativeSelectDemo,
    ),
  switch: () =>
    import("@/components/examples/form-primitives-demo").then(
      (module) => module.SwitchDemo,
    ),
  "radio-group": () =>
    import("@/components/examples/form-primitives-demo").then(
      (module) => module.RadioGroupDemo,
    ),
  checkbox: () =>
    import("@/components/examples/checkbox-demo").then(
      (module) => module.CheckboxDemo,
    ),
  table: () =>
    import("@/components/examples/table-demo").then(
      (module) => module.TableDemo,
    ),
  "data-table": () =>
    import("@/components/examples/data-table-demo").then(
      (module) => module.DataTableDemo,
    ),
  avatar: () =>
    import("@/components/examples/avatar-demo").then(
      (module) => module.AvatarDemo,
    ),
  "segment-bar": () =>
    import("@/components/examples/segment-bar-demo").then(
      (module) => module.SegmentBarDemo,
    ),
  sparkline: () =>
    import("@/components/examples/sparkline-demo").then(
      (module) => module.SparklineDemo,
    ),
  "dropdown-menu": () =>
    import("@/components/examples/dropdown-menu-demo").then(
      (module) => module.DropdownMenuDemo,
    ),
  sheet: () =>
    import("@/components/examples/sheet-demo").then(
      (module) => module.SheetDemo,
    ),
  "command-palette": () =>
    import("@/components/examples/command-palette-demo").then(
      (module) => module.CommandPaletteDemo,
    ),
  kbd: () =>
    import("@/components/examples/kbd-demo").then((module) => module.KbdDemo),
  field: () =>
    import("@/components/examples/field-demo").then(
      (module) => module.FieldDemo,
    ),
  "form-section": () =>
    import("@/components/examples/form-section-demo").then(
      (module) => module.FormSectionDemo,
    ),
  slider: () =>
    import("@/components/examples/slider-demo").then(
      (module) => module.SliderDemo,
    ),
  "image-upload": () =>
    import("@/components/examples/image-upload-demo").then(
      (module) => module.ImageUploadDemo,
    ),
  "filter-toolbar": () =>
    import("@/components/examples/filter-toolbar-demo").then(
      (module) => module.FilterToolbarDemo,
    ),
  "metric-summary": () =>
    import("@/components/examples/metric-summary-demo").then(
      (module) => module.MetricSummaryDemo,
    ),
  "rating-display": () =>
    import("@/components/examples/rating-display-demo").then(
      (module) => module.RatingDisplayDemo,
    ),

  menu: () =>
    import("@/components/examples/menu-demo").then((value) => value.MenuDemo),
  popover: () =>
    import("@/components/examples/popover-demo").then(
      (value) => value.PopoverDemo,
    ),
  select: () =>
    import("@/components/examples/select-demo").then(
      (value) => value.SelectDemo,
    ),
  combobox: () =>
    import("@/components/examples/combobox-demo").then(
      (value) => value.ComboboxDemo,
    ),
  segmented: () =>
    import("@/components/examples/segmented-demo").then(
      (value) => value.SegmentedDemo,
    ),
  tabs: () =>
    import("@/components/examples/tabs-demo").then((value) => value.TabsDemo),
  "theme-boundary": () =>
    import("@/components/examples/theme-boundary-demo").then(
      (value) => value.ThemeBoundaryDemo,
    ),
  "workflow-canvas": () =>
    import("@/components/examples/workflow-canvas-demo").then(
      (module) => module.WorkflowCanvasDemo,
    ),
  "canvas-node": () =>
    import("@/components/examples/workflow-canvas-demo").then(
      (module) => module.WorkflowCanvasDemo,
    ),
  "canvas-port": () =>
    import("@/components/examples/workflow-canvas-demo").then(
      (module) => module.WorkflowCanvasDemo,
    ),
  "canvas-edge": () =>
    import("@/components/examples/workflow-canvas-demo").then(
      (module) => module.WorkflowCanvasDemo,
    ),

  i18n: () =>
    import("@/components/examples/i18n-demo").then((module) => module.I18nDemo),
  "canvas-service-panel": () =>
    import("@/components/examples/canvas-services-demo").then(
      (module) => module.CanvasServicesDemo,
    ),
  "canvas-project-workspace": () =>
    import("@/components/examples/canvas-project-demo").then(
      (module) => module.CanvasProjectDemo,
    ),
  "canvas-config-editor": () =>
    import("@/components/examples/canvas-project-demo").then(
      (module) => module.CanvasProjectDemo,
    ),
  "canvas-execution-panel": () =>
    import("@/components/examples/canvas-workspace-demo").then(
      (module) => module.CanvasWorkspaceDemo,
    ),
  "canvas-workspace": () =>
    import("@/components/examples/canvas-workspace-demo").then(
      (module) => module.CanvasWorkspaceDemo,
    ),
  "node-palette": () =>
    import("@/components/examples/canvas-components-demo").then(
      (module) => module.NodePaletteDemo,
    ),
  "node-inspector": () =>
    import("@/components/examples/canvas-components-demo").then(
      (module) => module.NodeInspectorDemo,
    ),
  "variable-picker": () =>
    import("@/components/examples/canvas-components-demo").then(
      (module) => module.VariablePickerDemo,
    ),
  "canvas-frame": () =>
    import("@/components/examples/canvas-components-demo").then(
      (module) => module.CanvasFrameDemo,
    ),
  "canvas-note": () =>
    import("@/components/examples/canvas-components-demo").then(
      (module) => module.CanvasNoteDemo,
    ),
  "style-workbench": () =>
    import("@/components/examples/style-workbench-demo").then(
      (module) => module.StyleWorkbenchDemo,
    ),
  badge: () =>
    import("@/components/examples/badge-demo").then(
      (module) => module.BadgeDemo,
    ),
  tag: () =>
    import("@/components/examples/tag-demo").then((module) => module.TagDemo),
  chip: () =>
    import("@/components/examples/chip-demo").then((module) => module.ChipDemo),
  button: () =>
    import("@/components/examples/button-demo").then(
      (module) => module.ButtonDemo,
    ),
  input: () =>
    import("@/components/examples/input-demo").then(
      (module) => module.InputDemo,
    ),
  dialog: () =>
    import("@/components/examples/dialog-demo").then(
      (module) => module.DialogDemo,
    ),
  "task-panel": () =>
    import("@/components/examples/task-panel-demo").then(
      (module) => module.TaskPanelDemo,
    ),
  "scroll-playground": () =>
    import("@/components/examples/scroll-playground-demo").then(
      (module) => module.ScrollPlaygroundDemo,
    ),
  item: () =>
    import("@/components/examples/item-demo").then((module) => module.ItemDemo),
  "runtime-status-badge": () =>
    import("@/components/examples/runtime-status-badge-demo").then(
      (module) => module.RuntimeStatusBadgeDemo,
    ),
  "workspace-shell": () =>
    import("@/components/examples/workspace-shell-demo").then(
      (module) => module.WorkspaceShellDemo,
    ),
  "data-region": () =>
    import("@/components/examples/data-region-demo").then(
      (module) => module.DataRegionDemo,
    ),
  tree: () =>
    import("@/components/examples/tree-demo").then((module) => module.TreeDemo),
  "session-row": () =>
    import("@/components/examples/session-row-demo").then(
      (module) => module.SessionRowDemo,
    ),
  "agent-row": () =>
    import("@/components/examples/agent-row-demo").then(
      (module) => module.AgentRowDemo,
    ),
  "activity-timeline": () =>
    import("@/components/examples/activity-timeline-demo").then(
      (module) => module.ActivityTimelineDemo,
    ),
  inspector: () =>
    import("@/components/examples/inspector-demo").then(
      (module) => module.InspectorDemo,
    ),
  "chat-message": () =>
    import("@/components/examples/chat-message-demo").then(
      (module) => module.ChatMessageDemo,
    ),
  "tool-call": () =>
    import("@/components/examples/tool-call-demo").then(
      (module) => module.ToolCallDemo,
    ),

  "analytics-resource-model": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.ResourceModelDemo,
    ),
  "analytics-history-metrics": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.HistoryChartsDemo,
    ),
  "analytics-builder-model": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.BuilderDemo,
    ),
  "dashboard-edit-session": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.LayoutEditorDemo,
    ),
  "analytics-image-export": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.HistoryChartsDemo,
    ),
  heatmap: () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.HeatmapDemo,
    ),
  "resource-allocation-view": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.ResourceAllocationDemo,
    ),
  "agent-execution-timeline": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.AgentOperationsDemo,
    ),
  "workflow-history-charts": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.HistoryChartsDemo,
    ),
  "forecast-chart": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.ForecastDemo,
    ),
  "agent-operations-dashboard": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.AgentOperationsDemo,
    ),
  "work-dependency-view": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.DependencyDemo,
    ),
  "dashboard-layout-editor": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.LayoutEditorDemo,
    ),
  "analytics-builder": () =>
    import("@/components/examples/workflow-analytics/advanced-demos").then(
      (m) => m.BuilderDemo,
    ),
}
class DemoErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
function DemoScope({
  slug,
  autoLoad = false,
}: {
  slug: string
  autoLoad?: boolean
}) {
  const { t } = useSiteI18n()
  const [Loaded, setLoaded] = useState<ComponentType>()
  const [state, setState] = useState<"idle" | "loading" | "error">(
    autoLoad ? "loading" : "idle",
  )
  const [attempt, setAttempt] = useState(0)
  const token = useRef(0)
  useEffect(
    () => () => {
      token.current++
    },
    [slug],
  )
  async function load() {
    const request = ++token.current
    setState("loading")
    try {
      const component = await demoLoaders[slug]()
      if (token.current !== request) return
      setLoaded(() => component)
      setState("idle")
    } catch {
      if (token.current === request) setState("error")
    }
  }
  useEffect(() => {
    if (autoLoad) {
      let active = true
      const request = ++token.current
      demoLoaders[slug]()
        .then((component) => {
          if (active && token.current === request) {
            setLoaded(() => component)
            setState("idle")
          }
        })
        .catch(() => {
          if (active && token.current === request) setState("error")
        })
      return () => {
        active = false
      }
    }
  }, [autoLoad, slug])
  const retry = (
    <div role="alert">
      <p>{t("site.optimization.demoError")}</p>
      <Button
        onClick={() => {
          setLoaded(undefined)
          setAttempt((value) => value + 1)
          void load()
        }}
      >
        {t("site.retry")}
      </Button>
    </div>
  )
  return (
    <div data-demo-loader={slug} data-demo-mounted={Boolean(Loaded)}>
      {(Loaded || state !== "idle") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            token.current++
            setLoaded(undefined)
            setState("idle")
          }}
        >
          {t("site.optimization.closeDemo")}
        </Button>
      )}
      {Loaded ? (
        <>
          <DemoErrorBoundary key={attempt} fallback={retry}>
            <Loaded />
          </DemoErrorBoundary>
        </>
      ) : state === "error" ? (
        retry
      ) : (
        <Button
          variant="outline"
          loading={state === "loading"}
          onClick={() => void load()}
        >
          {state === "loading"
            ? t("site.optimization.loadingDemo")
            : t("site.optimization.loadDemo")}
        </Button>
      )}
    </div>
  )
}

export function DemoLoader(props: { slug: string; autoLoad?: boolean }) {
  return <DemoScope key={props.slug} {...props} />
}
