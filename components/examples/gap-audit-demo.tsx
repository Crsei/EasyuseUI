"use client"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import { Toolbar, ToolbarButton, ToolbarInput } from "@/components/ui/toolbar"
import { Resizable } from "@/components/ui/resizable"
import { Pagination } from "@/components/ui/pagination"
import { CommandToolbar } from "@/components/blocks/command-toolbar"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import { DataTable, type DataTableSort } from "@/components/blocks/data-table"
import { DataTableControls } from "@/components/blocks/data-table-controls"
import { Chart } from "@/components/blocks/chart"
import { useI18n } from "@/lib/i18n-provider"
import {
  createDataTableQuerySession,
  type DataTableColumnConfig,
  type DataTableQuery,
  type DataTablePage,
} from "@/lib/data-table-model"
import { TreeDemo } from "./tree-demo"
import { CommandPaletteDemo } from "./command-palette-demo"

// Local caller text, separate from portable component messages and user drafts.
const copy = {
  title: ["组件边界与可访问性", "Component boundaries and accessibility"],
  local: [
    "本页使用本地fixture；查询与操作由示例模拟，不连接业务服务。",
    "Local fixtures simulate queries and actions; no business service is connected.",
  ],
  long: ["打开长表单", "Open long form"],
  form: ["长表单与错误恢复", "Long form and error recovery"],
  description: [
    "标题、关闭与提交入口保持可达，正文独立滚动。",
    "The title, close and submit actions remain reachable while the body scrolls.",
  ],
  draft: ["示例草稿", "Example draft"],
  field: ["字段", "Field"],
  error: ["追加错误", "Append error"],
  errorText: [
    "验证未通过，草稿已保留。请检查以下字段。",
    "Validation failed. Your draft is retained. Review the fields below.",
  ],
  submit: ["提交本地示例", "Submit local example"],
  sheet: ["打开对象抽屉", "Open object sheet"],
  object: ["对象检查", "Object inspection"],
  nested: ["打开嵌套对话框", "Open nested dialog"],
  detail: ["嵌套详情", "Nested details"],
  popover: ["打开补充说明", "Open supplementary details"],
  supplement: ["补充说明", "Supplementary details"],
  confirm: ["打开确认", "Open confirmation"],
  confirmation: ["确认本地操作", "Confirm local action"],
  cancel: ["取消", "Cancel"],
  commands: ["画布命令", "Canvas commands"],
  search: ["命令内搜索", "Search within commands"],
  save: ["保存布局", "Save layout"],
  undo: ["撤销", "Undo"],
  redo: ["重做", "Redo"],
  align: ["对齐所选对象", "Align selected objects"],
  export: ["导出配置", "Export configuration"],
  unavailable: ["暂无权限", "Permission unavailable"],
  rejected: ["模拟失败", "Simulate failure"],
  shrink: ["缩窄容器", "Narrow container"],
  expand: ["扩大容器", "Widen container"],
  split: ["主从分栏", "Master detail split"],
  vertical: ["上下分栏", "Vertical split"],
  first: ["主区域", "Main region"],
  second: ["详情区域", "Detail region"],
  collapse: ["收起首面板", "Collapse first panel"],
  restore: ["恢复首面板", "Restore first panel"],
  table: ["受控查询表格", "Controlled query table"],
  name: ["名称", "Name"],
  status: ["状态", "Status"],
  rows: ["任务", "Task"],
  fast: ["查询B：立即返回", "Query B: return immediately"],
  slow: ["查询A：延迟返回", "Query A: defer response"],
  complete: ["完成迟到A", "Complete late A"],
  refreshError: ["模拟刷新失败", "Fail refresh"],
  readError: [
    "读取失败，保留当前查询已有行。",
    "Read failed. Existing rows for this query are retained.",
  ],
  total: ["总数未知", "Total unknown"],
  selected: ["已选ID", "Selected IDs"],
  chart: ["已计算的轻量指标", "Caller-computed lightweight values"],
  zero: ["实际零值", "Actual zero"],
  unknown: ["未知", "Unknown"],
  absent: ["未采集", "Not collected"],
  permission: ["无权限", "No permission"],
  gap: ["缺失区间", "Coverage gap"],
  busy: ["正在处理，等待调用方", "Busy; waiting for the caller"],
  selectedButton: ["已选择的操作", "Selected action"],
  invalid: ["字段错误", "Field error"],
  tooltip: [
    "键盘也能读取提示",
    "The tooltip is also available from the keyboard",
  ],
} as const
function useCopy() {
  const { locale } = useI18n()
  return (key: keyof typeof copy) => copy[key][locale === "en" ? 1 : 0]
}

export function LongDialogDemo() {
  const t = useCopy(),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(false),
    [submitted, setSubmitted] = useState(0)
  return (
    <div data-fixture="long-dialog">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          {t("long")}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("form")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <DialogBody data-long-body>
            <label className="grid gap-2 text-sm">
              {t("draft")}
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} />
            </label>
            {Array.from({ length: 30 }, (_, i) => (
              <label key={i} className="mt-3 grid gap-1 text-xs">
                {t("field")} {i + 1}
                <Input defaultValue={`fixture-${i}`} />
              </label>
            ))}
            {error && (
              <p
                role="alert"
                className="mt-4 border border-dashed p-3 text-sm text-destructive"
              >
                {t("errorText").repeat(12)}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setError(true)}>
              {t("error")}
            </Button>
            <Button onClick={() => setSubmitted((n) => n + 1)}>
              {t("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <output className="ml-3 text-xs" data-submitted>
        {submitted}
      </output>
    </div>
  )
}
export function OverlayDemo() {
  const t = useCopy()
  return (
    <ThemeBoundary mode="scoped" theme="light" legacyAliases>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          {t("sheet")}
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("object")}</SheetTitle>
            <SheetDescription>{t("local")}</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <ThemeBoundary mode="scoped" theme="dark" legacyAliases>
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  {t("nested")}
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>{t("detail")}</DialogTitle>
                  <DialogDescription>{t("description")}</DialogDescription>
                  <div className="mt-4">
                    <Popover>
                      <PopoverTrigger render={<Button variant="outline" />}>
                        {t("popover")}
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverTitle>{t("supplement")}</PopoverTitle>
                        <Button variant="ghost">{t("submit")}</Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </DialogContent>
              </Dialog>
            </ThemeBoundary>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </ThemeBoundary>
  )
}
export function AlertDialogDemo() {
  const t = useCopy()
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        {t("confirm")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{t("confirmation")}</AlertDialogTitle>
        <AlertDialogDescription>{t("local")}</AlertDialogDescription>
        <AlertDialogCancel render={<Button variant="outline" />}>
          {t("cancel")}
        </AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export function TooltipDemo() {
  const t = useCopy()
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>
        {t("supplement")}
      </TooltipTrigger>
      <TooltipContent>{t("tooltip")}</TooltipContent>
    </Tooltip>
  )
}
export function ToolbarDemo() {
  const t = useCopy(),
    [draft, setDraft] = useState("")
  return (
    <Toolbar aria-label={t("commands")}>
      <ToolbarButton>{t("save")}</ToolbarButton>
      <ToolbarButton disabled>{t("unavailable")}</ToolbarButton>
      <ToolbarInput
        aria-label={t("search")}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-40"
      />
      <ToolbarButton>{t("undo")}</ToolbarButton>
    </Toolbar>
  )
}
export function CommandToolbarDemo() {
  const t = useCopy(),
    [narrow, setNarrow] = useState(false),
    [count, setCount] = useState(0)
  const [draft, setDraft] = useState("")
  const actions = useMemo(
    () =>
      [
        "save",
        "undo",
        "redo",
        "align",
        "export",
        "unavailable",
        "rejected",
      ].map((key, i) => ({
        id: key,
        label: t(key as keyof typeof copy),
        priority: key === "save" ? 10 : 0,
        width: key === "align" ? 160 : 112,
        disabled: key === "unavailable",
        onInvoke: async () => {
          if (key === "rejected") throw new Error("Local fixture")
          setCount((n) => n + 1)
          await new Promise((resolve) => setTimeout(resolve, 300 + i))
        },
      })),
    [t],
  )
  return (
    <div
      data-fixture="command-toolbar"
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3"
    >
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => setNarrow((v) => !v)}
      >
        {t(narrow ? "expand" : "shrink")}
      </Button>
      <div style={{ width: narrow ? 280 : 980, maxWidth: "100%" }}>
        <CommandToolbar
          label={t("commands")}
          actions={actions}
          leadingWidth={128}
          leading={
            <ToolbarInput
              aria-label={t("search")}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          }
        />
      </div>
      <output data-command-count className="text-xs">
        {count}
      </output>
    </div>
  )
}
export function ResizableDemo() {
  const t = useCopy(),
    [width, setWidth] = useState(256),
    [height, setHeight] = useState(120),
    [narrow, setNarrow] = useState(false),
    [collapsed, setCollapsed] = useState(false)
  return (
    <div
      data-fixture="resizable"
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3"
    >
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setNarrow((v) => !v)}>
          {t(narrow ? "expand" : "shrink")}
        </Button>
        <Button variant="outline" onClick={() => setCollapsed((v) => !v)}>
          {t(collapsed ? "restore" : "collapse")}
        </Button>
      </div>
      <div style={{ width: narrow ? 320 : 720, maxWidth: "100%", height: 320 }}>
        <Resizable
          className="h-full border"
          label={t("split")}
          value={collapsed ? 0 : width}
          min={collapsed ? 0 : 160}
          max={480}
          disabled={collapsed}
          onValueChange={setWidth}
          first={collapsed ? null : <p className="p-3 text-sm">{t("first")}</p>}
          second={
            <Resizable
              className="h-full"
              axis="vertical"
              label={t("vertical")}
              min={80}
              max={240}
              secondMin={80}
              value={height}
              onValueChange={setHeight}
              first={<p className="p-3 text-sm">{t("second")}</p>}
              second={<p className="p-3 text-sm">{t("local")}</p>}
            />
          }
        />
      </div>
    </div>
  )
}
type Row = { id: string; title: string }
const initialQuery: DataTableQuery = {
  scope: "fixture",
  filter: "initial",
  sort: null,
  page: 1,
  pageSize: 2,
}
export function DataTableQueryDemo() {
  const t = useCopy()
  const [session] = useState(() =>
    createDataTableQuerySession<Row>({ errorMessage: t("readError") }),
  )
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  )
  const [query, setQuery] = useState(initialQuery),
    [selected, setSelected] = useState<string[]>(["outside-page"]),
    [active, setActive] = useState<string | null>(null)
  const [config, setConfig] = useState<DataTableColumnConfig>({
    widths: { title: 240, status: 160 },
  })
  const [cell, setCell] = useState(0)
  const late = useRef<(() => void) | null>(null),
    cursors = useRef(new Map<number, string | null>())
  function load(
    q: DataTableQuery,
    context: { queryKey: string },
  ): Promise<DataTablePage<Row>> {
    const result = {
      queryKey: context.queryKey,
      rows: [0, 1].map((i) => ({
        id: `${q.filter}-${q.page}-${i}`,
        title: `${t("rows")} ${q.filter}-${q.page}-${i}`,
      })),
      hasNext: q.page < 3,
      nextCursor: q.page < 3 ? `cursor-${q.page + 1}` : null,
    }
    if (q.filter === "slow")
      return new Promise((resolve) => {
        late.current = () => resolve(result)
      })
    return Promise.resolve(result)
  }
  function request(next: DataTableQuery) {
    setQuery(next)
    void session.request(next, load)
  }
  useEffect(() => {
    void session.request(initialQuery, load)
    return () => session.dispose()
    // The caller creates one retained session; changing locale does not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])
  function sort(next: DataTableSort) {
    cursors.current.clear()
    request({ ...query, sort: next, page: 1, cursor: null })
  }
  return (
    <div
      data-fixture="table"
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <DataTableControls
          columns={[
            { id: "title", label: t("name"), hideable: false },
            { id: "status", label: t("status") },
          ]}
          value={config}
          onValueChange={setConfig}
        />
        <Button
          variant="outline"
          onClick={() => request({ ...initialQuery, filter: "slow" })}
        >
          {t("slow")}
        </Button>
        <Button
          variant="outline"
          onClick={() => request({ ...initialQuery, filter: "fast" })}
        >
          {t("fast")}
        </Button>
        <Button variant="outline" onClick={() => late.current?.()}>
          {t("complete")}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void session.request(query, async () => {
              throw new Error("Local refresh fixture")
            })
          }
        >
          {t("refreshError")}
        </Button>
      </div>
      <DataTable
        rows={snapshot.rows}
        caption={t("table")}
        columnConfig={config}
        activationMode="separate"
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.title}
        selectedIds={selected}
        onSelectionChange={setSelected}
        activeRowId={active}
        onActivateRow={(row) => setActive(row.id)}
        sort={query.sort}
        onSortChange={sort}
        data={{
          state: snapshot.state,
          refreshing: snapshot.refreshing,
          error: snapshot.error
            ? {
                category: "request",
                message: snapshot.error,
                reason: t("local"),
              }
            : undefined,
        }}
        columns={[
          {
            id: "title",
            header: t("name"),
            sortable: true,
            hideable: false,
            cell: (row) => (
              <Button variant="ghost" onClick={() => setCell((n) => n + 1)}>
                {row.title}
              </Button>
            ),
          },
          { id: "status", header: t("status"), cell: () => t("local") },
        ]}
        footer={
          <>
            <span className="mb-2 block">
              {snapshot.total === undefined ? t("total") : snapshot.total}
            </span>
            <Pagination
              page={query.page}
              pageCount={
                snapshot.total === undefined
                  ? undefined
                  : Math.max(1, Math.ceil(snapshot.total / query.pageSize))
              }
              hasNext={snapshot.hasNext}
              disabled={snapshot.state === "loading" || snapshot.refreshing}
              onPageChange={(page) => {
                if (page > query.page)
                  cursors.current.set(page, snapshot.nextCursor ?? null)
                request({
                  ...query,
                  page,
                  cursor: cursors.current.get(page) ?? null,
                })
              }}
            />
          </>
        }
      />
      <output data-selected-ids className="text-xs">
        {t("selected")}: {JSON.stringify(selected)}
      </output>
      <output data-query-key className="break-all text-xs">
        {snapshot.queryKey}
      </output>
      <output data-cell-count className="text-xs">
        {cell}
      </output>
    </div>
  )
}
export function PaginationDemo() {
  const t = useCopy(),
    [page, setPage] = useState(1)
  return (
    <div className="grid gap-2">
      <p className="text-xs">{t("total")}</p>
      <Pagination page={page} hasNext={page < 3} onPageChange={setPage} />
    </div>
  )
}
export function ChartDemo() {
  const t = useCopy()
  return (
    <Chart
      label={t("chart")}
      type="line"
      data={[
        { id: "zero", label: t("zero"), value: 0 },
        { id: "one", label: "1", value: 1 },
        {
          id: "unknown",
          label: t("unknown"),
          value: null,
          missingReason: "unknown",
        },
        {
          id: "not-collected",
          label: t("absent"),
          value: null,
          missingReason: "not-collected",
        },
        {
          id: "permission",
          label: t("permission"),
          value: null,
          missingReason: "permission",
        },
        { id: "gap", label: t("gap"), value: null, missingReason: "gap" },
        { id: "last", label: "2", value: 2 },
      ]}
    />
  )
}
export function GapAuditShowcase() {
  const t = useCopy()
  return (
    <main
      id="main-content"
      className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 sm:px-8"
    >
      <header>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("local")}</p>
      </header>
      <section
        className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4"
        aria-label="Dialog / Sheet"
      >
        <h2 className="text-base font-medium">Dialog / Sheet</h2>
        <LongDialogDemo />
        <OverlayDemo />
        <CommandPaletteDemo />
      </section>
      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
        <h2 className="text-base font-medium">Toolbar</h2>
        <div className="min-w-0 overflow-auto">
          <ToolbarDemo />
        </div>
        <CommandToolbarDemo />
      </section>
      <section className="grid min-w-0 gap-4">
        <h2 className="text-base font-medium">DataTable</h2>
        <DataTableQueryDemo />
      </section>
      <section className="grid min-w-0 gap-4">
        <h2 className="text-base font-medium">Resizable</h2>
        <ResizableDemo />
      </section>
      <section
        data-fixture="states"
        className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3"
      >
        <h2 className="text-base font-medium">Button / Input / Tree</h2>
        <div className="flex flex-wrap gap-3">
          <Button aria-pressed="true">{t("selectedButton")}</Button>
          <Button loading>{t("busy")}</Button>
          <Button disabled>{t("unavailable")}</Button>
        </div>
        <Input
          aria-label={t("draft")}
          aria-invalid="true"
          aria-describedby="fixture-field-error"
        />
        <p id="fixture-field-error" className="text-sm text-destructive">
          {t("invalid")}
        </p>
        <TreeDemo />
        <TooltipDemo />
      </section>
      <section data-fixture="shell" className="grid min-w-0 gap-4">
        <h2 className="text-base font-medium">WorkspaceShell / Inspector</h2>
        <WorkspaceShell
          title={t("object")}
          sidebar={<p className="p-3">{t("first")}</p>}
          sidebarResizable
          defaultSidebarWidth={256}
          inspector={<AlertDialogDemo />}
          inspectorTitle={t("object")}
          defaultInspectorWidth={280}
          bottomPanel={<p className="p-3">{t("second")}</p>}
          bottomPanelResizable
        >
          <p className="p-4">{t("local")}</p>
        </WorkspaceShell>
      </section>
      <section className="grid min-w-0 gap-4">
        <h2 className="text-base font-medium">Chart / ChartFrame</h2>
        <ChartDemo />
      </section>
    </main>
  )
}
