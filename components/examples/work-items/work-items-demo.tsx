"use client"
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { ListTodo, ArrowLeft, BookOpen, Languages, Sun } from "lucide-react"
import { WorkItemsWorkspace } from "@/components/blocks/work-items-workspace"
import { WorkItemQuickCreate } from "@/components/blocks/work-item-detail"
import { WorkItemMutationNotice } from "@/components/blocks/work-item"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  isMutationLocked,
  type MutationState,
  type WorkItemDraft,
  type WorkItemPatch,
  type WorkItemRecord,
  type WorkItemCapabilities,
  type WorkItemsBatchIntent,
  type WorkItemsSavedView,
  type WorkItemsSaveViewIntent,
  type CreateResult,
} from "@/lib/work-items-model"
import { useI18n } from "@/lib/i18n-provider"
import {
  useSiteI18n,
  useSiteFeedback,
  siteMessage,
} from "@/components/site/site-i18n"
import {
  catalog,
  makeWorkItems,
  makeHierarchyWorkItems,
  fixtureToday,
} from "./fixtures"
import {
  groupWorkItems,
  selectWorkItems,
  validateMove,
  mergeGroupPage,
} from "./selectors"
import { applyOperation, fixtureDelay, type LocalOperation } from "./commands"
import { scenarios, scenarioCount, type WorkItemsScenario } from "./scenarios"
import { useWorkItemsUrl } from "./use-work-items-url"
import type { WorkItemsBoardMove } from "@/components/blocks/work-items-views"
import { groupWorkItemLanes } from "@/lib/work-items-view"
import styles from "./work-items-demo.module.css"

export function WorkItemsDemo() {
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const { t, locale, setLocale } = useI18n()
  const { t: siteT } = useSiteI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const url = useWorkItemsUrl()
  const [scenario, setScenario] = useState<WorkItemsScenario>("normal")
  const [items, setItems] = useState(makeWorkItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [childrenState, setChildrenState] = useState<
    "partial" | "loading" | "error" | "success"
  >("partial")
  const [savedViews, setSavedViews] = useState<WorkItemsSavedView[]>([])
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null)
  const [viewMutation, setViewMutation] = useState<MutationState>()
  const savedAuthority = useRef(savedViews)
  savedAuthority.current = savedViews
  const savedOperation = useRef<(() => boolean) | null>(null)
  const [mutations, setMutations] = useState<Record<string, MutationState>>({})
  const [drafts, setDrafts] = useState<Record<string, WorkItemPatch>>({})
  const [createPreset, setCreatePreset] = useState<WorkItemDraft | null>(null)
  const [createMutation, setCreateMutation] = useState<
    MutationState | undefined
  >()
  const [feedback, setFeedback] = useSiteFeedback()
  const [loadedGroups, setLoadedGroups] = useState<string[]>([])
  const [loadingGroups, setLoadingGroups] = useState<string[]>([])
  const [pageErrors, setPageErrors] = useState<string[]>([])
  const generation = useRef(0)
  const operationCounter = useRef(0)
  const operations = useRef(new Map<string, LocalOperation>())
  const createOperation = useRef<WorkItemDraft | null>(null)
  const locks = useRef(new Set<string>())
  const matching = useMemo(
    () => selectWorkItems(items, url.view),
    [items, url.view],
  )
  const visible = useMemo(
    () =>
      scenario === "hierarchy" && childrenState !== "success"
        ? matching.filter((item) => item.id !== "wi-003")
        : matching,
    [matching, scenario, childrenState],
  )
  const queryKey = JSON.stringify([
    generation.current,
    url.view.groupBy,
    url.view.subGroupBy,
    url.view.query,
    url.view.filters,
    url.view.sort,
    url.view.sortDirection,
  ])
  const latest = useRef({ items, queryKey, scenario })
  latest.current = { items, queryKey, scenario }
  const fullGroups = useMemo(
    () => groupWorkItems(visible, catalog, url.view, queryKey),
    [visible, url.view, queryKey],
  )
  const lanes = useMemo(
    () =>
      scenario === "partial"
        ? []
        : groupWorkItemLanes(visible, catalog, url.view, queryKey),
    [visible, url.view, queryKey, scenario],
  )
  const pageError = siteT("site.workItems.demoPageError")
  const groups = useMemo(
    () =>
      fullGroups.map((group, index) => {
        if (
          scenario !== "partial" ||
          loadedGroups.includes(`${queryKey}:${group.key}`)
        )
          return group
        const itemIds = group.itemIds.slice(0, 2)
        return {
          ...group,
          itemIds,
          loadedCount: itemIds.length,
          totalCount: index % 2 ? null : group.totalCount,
          hasMore: group.itemIds.length > 2,
          dataState: pageErrors.includes(`${queryKey}:${group.key}`)
            ? ("error" as const)
            : loadingGroups.includes(`${queryKey}:${group.key}`)
              ? ("loading" as const)
              : group.itemIds.length > 2
                ? ("partial" as const)
                : group.dataState,
          error: pageErrors.includes(`${queryKey}:${group.key}`)
            ? pageError
            : undefined,
        }
      }),
    [
      fullGroups,
      scenario,
      loadedGroups,
      loadingGroups,
      pageErrors,
      queryKey,
      pageError,
    ],
  )
  const loadedItems = useMemo(() => {
    const ids = new Set(groups.flatMap((group) => group.itemIds))
    return visible.filter((item) => ids.has(item.id))
  }, [visible, groups])
  const readOnlyReason = siteT("site.workItems.demoReadOnly")
  const capabilities: WorkItemCapabilities = useMemo(
    () => ({
      canCreate: scenario !== "readonly",
      canEditField: (item) =>
        scenario !== "readonly" &&
        !(scenario === "batch-mixed" && item.id === "wi-004"),
      canMove: (item) => scenario !== "readonly" && !locks.current.has(item.id),
      reason: scenario === "readonly" ? readOnlyReason : undefined,
    }),
    [scenario, readOnlyReason],
  )
  const context = {
    items,
    groups,
    groupBy: url.view.groupBy,
    sort: url.view.sort,
    queryKey,
    capabilities,
    mutations,
  }
  function publish(next: WorkItemRecord[]) {
    latest.current.items = next
    setItems(next)
  }
  function reset(next: WorkItemsScenario) {
    generation.current++
    locks.current.clear()
    operations.current.clear()
    createOperation.current = null
    setScenario(next)
    const rows =
      next === "hierarchy"
        ? makeHierarchyWorkItems()
        : makeWorkItems(scenarioCount(next))
    if (next === "agent") rows[0].agentStatus = "running"
    publish(rows)
    setMutations({})
    setDrafts({})
    setCreateMutation(undefined)
    setCreatePreset(null)
    setLoadedGroups([])
    setLoadingGroups([])
    setPageErrors([])
    setSelectedIds([])
    setCollapsed([])
    setExpanded([])
    setChildrenState("partial")
    savedOperation.current = null
    setViewMutation(undefined)
    setFeedback("")
  }
  function remainingFieldErrors(
    mutation: MutationState,
    operation: LocalOperation,
  ) {
    const errors = { ...mutation.fieldErrors }
    if (operation.kind === "patch")
      for (const field of Object.keys(operation.patch))
        delete errors[field as keyof WorkItemPatch]
    return errors
  }
  function clearConfirmedFields(id: string, operation: LocalOperation) {
    if (operation.kind !== "patch") return
    setDrafts((before) => {
      const draft = { ...before[id] }
      for (const field of Object.keys(operation.patch))
        delete draft[field as keyof WorkItemPatch]
      return { ...before, [id]: draft }
    })
  }
  async function submit(
    item: WorkItemRecord,
    operation: LocalOperation,
    operationId?: string,
  ) {
    if (locks.current.has(item.id) || latest.current.scenario === "readonly")
      return
    const mutation: MutationState = {
      itemId: item.id,
      operationId: operationId ?? `demo-${++operationCounter.current}`,
      baseRevision: item.revision,
      status: "pending",
      fieldErrors: mutations[item.id]?.fieldErrors,
    }
    const currentGeneration = generation.current
    const currentScenario = latest.current.scenario
    locks.current.add(item.id)
    operations.current.set(item.id, operation)
    setMutations((before) => ({ ...before, [item.id]: mutation }))
    if (operation.kind === "patch" && !operationId)
      setDrafts((before) => ({
        ...before,
        [item.id]: { ...before[item.id], ...operation.patch },
      }))
    await fixtureDelay()
    if (currentGeneration !== generation.current) return
    const current = latest.current.items.find((row) => row.id === item.id)
    if (
      (currentScenario === "batch-mixed" && item.id === "wi-002") ||
      currentScenario === "rejected" ||
      (currentScenario === "field-rejected" &&
        operation.kind === "patch" &&
        "title" in operation.patch) ||
      current?.revision !== mutation.baseRevision
    ) {
      locks.current.delete(item.id)
      operations.current.delete(item.id)
      setMutations((before) => ({
        ...before,
        [item.id]: {
          ...mutation,
          status: "rejected",
          fieldErrors:
            operation.kind === "patch"
              ? {
                  ...mutation.fieldErrors,
                  ...Object.fromEntries(
                    Object.keys(operation.patch).map((field) => [
                      field,
                      siteT("site.workItems.demoRejected"),
                    ]),
                  ),
                }
              : mutation.fieldErrors,
          error:
            current?.revision !== mutation.baseRevision
              ? siteT("site.workItems.demoConflict")
              : siteT("site.workItems.demoRejected"),
        },
      }))
      return
    }
    if (
      currentScenario === "unknown" ||
      (currentScenario === "batch-mixed" && item.id === "wi-003")
    ) {
      setMutations((before) => ({
        ...before,
        [item.id]: { ...mutation, status: "unknown" },
      }))
      return
    }
    publish(applyOperation(latest.current.items, operation))
    operations.current.delete(item.id)
    locks.current.delete(item.id)
    clearConfirmedFields(item.id, operation)
    setMutations((before) => ({
      ...before,
      [item.id]: {
        ...mutation,
        status: "confirmed",
        fieldErrors: remainingFieldErrors(mutation, operation),
      },
    }))
    setFeedback(siteMessage("site.workItems.demoConfirmed"))
  }
  function reconcile(id: string) {
    const mutation = mutations[id]
    const operation = operations.current.get(id)
    if (mutation?.status !== "unknown" || !operation) return
    const current = latest.current.items.find((item) => item.id === id)
    const confirmed = current?.revision === mutation.baseRevision
    if (confirmed) publish(applyOperation(latest.current.items, operation))
    operations.current.delete(id)
    locks.current.delete(id)
    if (confirmed) clearConfirmedFields(id, operation)
    setMutations((before) => ({
      ...before,
      [id]: {
        ...mutation,
        status: confirmed ? "confirmed" : "rejected",
        fieldErrors: confirmed
          ? remainingFieldErrors(mutation, operation)
          : mutation.fieldErrors,
        error: confirmed ? undefined : siteT("site.workItems.demoConflict"),
      },
    }))
    setFeedback(
      siteMessage(
        confirmed
          ? "site.workItems.demoReconciled"
          : "site.workItems.demoConflict",
      ),
    )
  }
  function patch(item: WorkItemRecord, patch: WorkItemPatch) {
    const authority = latest.current.items.find((row) => row.id === item.id)
    if (
      !authority ||
      !Object.keys(patch).every((field) =>
        capabilities.canEditField(authority, field as keyof WorkItemPatch),
      )
    )
      return
    void submit(authority, {
      kind: "patch",
      itemId: item.id,
      patch,
      revision: authority.revision,
    })
  }
  function move(request: WorkItemsBoardMove) {
    const item = latest.current.items.find((row) => row.id === request.itemId)
    if (!item) return
    const intent = {
      ...request,
      baseRevision: request.baseRevision ?? item.revision,
      operationId: `move-${++operationCounter.current}`,
    }
    const lane = request.laneKey
      ? lanes.find((lane) => lane.key === request.laneKey)
      : undefined
    if (
      (request.laneKey &&
        (!lane ||
          !lane.groups.some((group) => group.itemIds.includes(item.id)))) ||
      (!request.laneKey && url.view.layout === "board" && lanes.length) ||
      validateMove(intent, { ...context, groups: lane?.groups ?? groups })
    ) {
      setFeedback(siteMessage("site.workItems.demoMoveUnavailable"))
      return
    }
    void submit(item, { kind: "move", intent, groupBy: url.view.groupBy })
  }
  async function loadMore(group: (typeof groups)[number]) {
    const currentGeneration = generation.current
    const requestKey = queryKey
    const requestToken = `${requestKey}:${group.key}`
    if (loadingGroups.includes(`${queryKey}:${group.key}`)) return
    setLoadingGroups((before) => [...before, requestToken])
    await fixtureDelay()
    if (currentGeneration !== generation.current) return
    if (requestKey !== latest.current.queryKey) {
      setLoadingGroups((before) => before.filter((key) => key !== requestToken))
      return
    }
    if (!pageErrors.includes(`${queryKey}:${group.key}`))
      setPageErrors((before) => [...before, requestToken])
    else {
      const merged = mergeGroupPage(
        group,
        fullGroups.find((g) => g.key === group.key)!,
      )
      if (merged.queryKey === requestKey)
        setLoadedGroups((before) => [...before, requestToken])
      setPageErrors((before) => before.filter((key) => key !== requestToken))
    }
    setLoadingGroups((before) => before.filter((key) => key !== requestToken))
  }
  function addCreated(draft: WorkItemDraft) {
    const n =
      Math.max(
        0,
        ...latest.current.items.map((item) => Number(item.id.slice(3))),
      ) + 1
    const id = `wi-${String(n).padStart(3, "0")}`
    const item: WorkItemRecord = {
      id,
      identifier: id.toUpperCase(),
      projectId: "easyuse",
      title: draft.title,
      stateId: draft.stateId,
      priorityId: draft.priorityId,
      assigneeIds: [],
      labelIds: [],
      dueDate: null,
      revision: 1,
    }
    publish([...latest.current.items, item])
    setFeedback(
      siteMessage(
        selectWorkItems([item], url.view).length
          ? "site.workItems.demoCreated"
          : "site.workItems.demoCreatedHidden",
      ),
    )
  }
  async function create(draft: WorkItemDraft) {
    if (!capabilities.canCreate || createOperation.current)
      return {
        status: "rejected" as const,
        error: siteT("site.workItems.demoReadOnly"),
      }
    const token = generation.current
    const state = latest.current.scenario
    createOperation.current = draft
    setCreateMutation({
      itemId: "create",
      operationId: `create-${++operationCounter.current}`,
      baseRevision: 0,
      status: "pending",
    })
    await fixtureDelay()
    if (token !== generation.current) return { status: "rejected" as const }
    if (state === "rejected") {
      createOperation.current = null
      setCreateMutation(undefined)
      return {
        status: "rejected" as const,
        error: siteT("site.workItems.demoRejected"),
      }
    }
    if (state === "unknown") {
      setCreateMutation((before) => before && { ...before, status: "unknown" })
      return { status: "unknown" as const }
    }
    addCreated(draft)
    createOperation.current = null
    setCreateMutation(undefined)
    return { status: "confirmed" as const }
  }
  function reconcileCreate() {
    if (createMutation?.status === "unknown" && createOperation.current) {
      addCreated(createOperation.current)
      createOperation.current = null
      setCreateMutation(undefined)
      setCreatePreset(null)
    }
  }
  function batch(intent: WorkItemsBatchIntent) {
    for (const entry of intent.entries) {
      const item = latest.current.items.find((item) => item.id === entry.itemId)
      if (
        !item ||
        item.revision !== entry.baseRevision ||
        !Object.keys(intent.patch).length ||
        !Object.keys(intent.patch).every(
          (field) =>
            (field === "stateId" || field === "priorityId") &&
            capabilities.canEditField(item, field),
        )
      )
        continue
      void submit(
        item,
        {
          kind: "patch",
          itemId: item.id,
          revision: entry.baseRevision,
          patch: intent.patch,
        },
        `${intent.operationId}:${entry.itemId}`,
      )
    }
  }
  async function loadChildren() {
    if (childrenState === "loading" || childrenState === "success") return
    const token = generation.current
    const key = queryKey
    const before = childrenState
    setChildrenState("loading")
    await fixtureDelay()
    if (token !== generation.current) return
    // Retain the old query's fixture data; do not publish a late child page into a new query.
    if (key !== latest.current.queryKey) {
      setChildrenState(before)
      return
    }
    setChildrenState(before === "error" ? "success" : "error")
  }
  async function saveView(write: () => boolean): Promise<CreateResult> {
    if (savedOperation.current || latest.current.scenario === "readonly")
      return { status: "rejected", error: siteT("site.workItems.demoReadOnly") }
    const token = generation.current
    const state = latest.current.scenario
    savedOperation.current = write
    setViewMutation({
      itemId: "saved-view",
      operationId: `view-${++operationCounter.current}`,
      baseRevision: 0,
      status: "pending",
    })
    await fixtureDelay()
    if (token !== generation.current) return { status: "rejected" }
    if (state === "unknown") {
      setViewMutation((before) => before && { ...before, status: "unknown" })
      return { status: "unknown" }
    }
    savedOperation.current = null
    if (state === "rejected" || !write()) {
      setViewMutation(
        (before) =>
          before && {
            ...before,
            status: "rejected",
            error: siteT("site.workItems.viewConflict"),
          },
      )
      return { status: "rejected", error: siteT("site.workItems.viewConflict") }
    }
    setViewMutation((before) => before && { ...before, status: "confirmed" })
    return { status: "confirmed" }
  }
  function storeView(intent: WorkItemsSaveViewIntent) {
    return saveView(() => {
      const previous = savedAuthority.current.find(
        (view) => view.id === intent.id,
      )
      if (intent.id && (!previous || previous.revision !== intent.baseRevision))
        return false
      const saved: WorkItemsSavedView = {
        id: intent.id ?? `view-${++operationCounter.current}`,
        name: intent.name,
        revision: (previous?.revision ?? 0) + 1,
        view: structuredClone(intent.view),
      }
      const next = previous
        ? savedAuthority.current.map((view) =>
            view.id === previous.id ? saved : view,
          )
        : [...savedAuthority.current, saved]
      savedAuthority.current = next
      setSavedViews(next)
      setActiveSavedId(saved.id)
      return true
    })
  }
  function reconcileView() {
    if (viewMutation?.status !== "unknown" || !savedOperation.current) return
    const confirmed = savedOperation.current()
    savedOperation.current = null
    setViewMutation(
      (before) =>
        before && {
          ...before,
          status: confirmed ? "confirmed" : "rejected",
          error: confirmed ? undefined : siteT("site.workItems.viewConflict"),
        },
    )
  }
  const handlers = useRef({ patch })
  handlers.current = { patch }
  const stablePatch = useCallback(
    (item: WorkItemRecord, patch: WorkItemPatch) =>
      handlers.current.patch(item, patch),
    [],
  )
  function preset(group?: string, laneKey?: string) {
    if (!capabilities.canCreate || isMutationLocked(createMutation)) return
    setCreatePreset({
      title: "",
      stateId:
        url.view.subGroupBy === "state" && laneKey
          ? laneKey
          : url.view.groupBy === "state" && group
            ? group
            : catalog.states[0].id,
      priorityId:
        url.view.subGroupBy === "priority" && laneKey
          ? laneKey
          : url.view.groupBy === "priority" && group
            ? group
            : catalog.priorities[2].id,
    })
  }
  function present(item: WorkItemRecord) {
    return {
      catalog,
      visibleProperties: url.view.visibleProperties,
      capabilities,
      onPatchItem: stablePatch,
      mutation: mutations[item.id],
      today: fixtureToday,
      agentLabel: siteT("site.workItems.simulatedAgent"),
      href: url.href(item.id),
      onOpen: () => url.openItem(item.id),
      onReconcile: () => reconcile(item.id),
    }
  }
  const displayed = useMemo(
    () =>
      loadedItems.map((item) =>
        Object.keys(drafts[item.id] ?? {}).length
          ? { ...item, ...drafts[item.id] }
          : item,
      ),
    [loadedItems, drafts],
  )
  const active = items.find((item) => item.id === url.activeItemId)
  return (
    <main
      id="main-content"
      className={styles.page}
      data-work-items-ready={ready}
    >
      <WorkItemsWorkspace
        title="Work Items"
        sidebar={
          <nav className={styles.nav}>
            <span className="text-xs text-muted-foreground">
              EASYUSEUI / LOCAL
            </span>
            <strong>EasyuseUI</strong>
            <Link
              href="/workspace/work-items/"
              aria-current="page"
              aria-label="Work Items"
            >
              <ListTodo size={16} />
              <span>Work Items</span>
            </Link>
            <Link
              href="/workspace/"
              aria-label={siteT("site.workItems.demoWorkspace")}
            >
              <ArrowLeft size={16} />
              <span>{siteT("site.workItems.demoWorkspace")}</span>
            </Link>
            <Link
              href="/docs/work-items-workspace/"
              aria-label={siteT("site.workItems.demoDocs")}
            >
              <BookOpen size={16} />
              <span>{siteT("site.workItems.demoDocs")}</span>
            </Link>
            <div className={styles.preferences}>
              <Button
                variant="ghost"
                size="sm"
                aria-label={locale === "en" ? "中文" : "English"}
                onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}
              >
                <Languages size={16} />
                <span>{locale === "en" ? "中文" : "English"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={siteT("site.workItems.demoTheme")}
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                <Sun size={16} />
                <span>{siteT("site.workItems.demoTheme")}</span>
              </Button>
            </div>
          </nav>
        }
        headerAction={
          <Button
            disabled={
              !capabilities.canCreate || isMutationLocked(createMutation)
            }
            onClick={() => preset()}
          >
            {t("workItems.create")}
          </Button>
        }
        catalog={catalog}
        items={displayed}
        groups={groups}
        lanes={lanes}
        onCreateInLane={
          capabilities.canCreate && !isMutationLocked(createMutation)
            ? (lane, group) => preset(group, lane)
            : undefined
        }
        hierarchy={{
          expandedIds: expanded,
          onExpandedChange: setExpanded,
          children:
            scenario === "hierarchy"
              ? {
                  "wi-001": {
                    state: childrenState,
                    totalCount: 2,
                    hasMore: childrenState !== "success",
                    error:
                      childrenState === "error"
                        ? siteT("site.workItems.demoPageError")
                        : undefined,
                  },
                  "wi-002": { state: "success", totalCount: 1 },
                }
              : undefined,
          onLoadMore: scenario === "hierarchy" ? loadChildren : undefined,
          onRetry: scenario === "hierarchy" ? loadChildren : undefined,
        }}
        batchActions={{
          items,
          capabilities,
          mutations,
          onApply: batch,
          onReconcile: (ids) => ids.forEach(reconcile),
        }}
        savedViews={{
          views: savedViews,
          activeId: activeSavedId,
          canSave: capabilities.canCreate,
          canDelete: capabilities.canCreate,
          reason: siteT("site.workItems.enhancementNotice"),
          mutation: viewMutation,
          onApply: (saved) => {
            setActiveSavedId(saved.id)
            url.setView(structuredClone(saved.view))
          },
          onSave: storeView,
          onDelete: (saved) =>
            saveView(() => {
              if (
                !savedAuthority.current.some(
                  (view) =>
                    view.id === saved.id && view.revision === saved.revision,
                )
              )
                return false
              const next = savedAuthority.current.filter(
                (view) => view.id !== saved.id,
              )
              savedAuthority.current = next
              setSavedViews(next)
              setActiveSavedId((id) => (id === saved.id ? null : id))
              return true
            }),
          onUnknown: () =>
            setViewMutation(
              (before) => before && { ...before, status: "unknown" },
            ),
          onReconcile: reconcileView,
        }}
        view={url.view}
        onViewChange={url.setView}
        queryKey={queryKey}
        interaction={{
          selectedIds,
          activeItemId: url.activeItemId,
          collapsedGroupIds: collapsed,
        }}
        onSelectionChange={setSelectedIds}
        onToggleGroup={(key) =>
          setCollapsed((before) =>
            before.includes(key)
              ? before.filter((id) => id !== key)
              : [...before, key],
          )
        }
        getPresentation={present}
        activeItem={active ? { ...active, ...drafts[active.id] } : null}
        onCloseItem={url.closeItem}
        onCreateInGroup={
          capabilities.canCreate && !isMutationLocked(createMutation)
            ? preset
            : undefined
        }
        onMove={move}
        canMove={(item, source, target) =>
          capabilities.canMove(item, target) &&
          (url.view.sort === "manual" || source !== target)
        }
        onLoadMore={loadMore}
        onRetryGroup={loadMore}
        announcement={feedback}
        data={{
          emptyTitle:
            items.length === 0
              ? siteT("site.workItems.noProjectItems")
              : undefined,
          emptyDescription:
            items.length === 0
              ? siteT("site.workItems.noProjectItemsHint")
              : undefined,
          state:
            scenario === "loading"
              ? "loading"
              : scenario === "refresh-error"
                ? "error"
                : displayed.length
                  ? "success"
                  : "empty",
          error:
            scenario === "refresh-error"
              ? {
                  category: "network",
                  message: siteT("site.workItems.demoRefreshError"),
                  reason: t("workItems.retained"),
                }
              : undefined,
          onRetry:
            scenario === "refresh-error" || scenario === "loading"
              ? () => setScenario("normal")
              : undefined,
        }}
        notes={
          <div className={styles.notes}>
            <p>{siteT("site.workItems.demoNotice")}</p>
            <p>{siteT("site.workItems.enhancementNotice")}</p>
            <label>
              {siteT("site.workItems.demoScenario")}
              <select
                aria-label={siteT("site.workItems.demoScenario")}
                value={scenario}
                onChange={(e) => reset(e.target.value as WorkItemsScenario)}
              >
                {scenarios.map((value) => (
                  <option key={value} value={value}>
                    {siteT(`site.workItems.scenario.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => reset(scenario)}
            >
              {siteT("site.workItems.demoReset")}
            </Button>
            <span>
              {siteT("site.workItems.demoCounts", {
                loaded: displayed.length,
                total: items.length,
              })}
            </span>
            <Link href="/blog/work-items-shared-views/">
              {siteT("site.workItems.demoArticle")}
            </Link>
          </div>
        }
      />
      {createPreset && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setCreatePreset(null)
          }}
        >
          <DialogContent>
            <DialogTitle>{t("workItems.create")}</DialogTitle>
            <DialogDescription>
              {siteT("site.workItems.demoNotice")}
            </DialogDescription>
            <WorkItemQuickCreate
              catalog={catalog}
              preset={createPreset}
              disabled={!capabilities.canCreate}
              onCreate={create}
              onUnknown={() =>
                setCreateMutation(
                  (before) => before && { ...before, status: "unknown" },
                )
              }
              onCancel={() => setCreatePreset(null)}
              unknown={createMutation?.status === "unknown"}
              onReconcile={reconcileCreate}
            />
          </DialogContent>
        </Dialog>
      )}
      {!createPreset && createMutation?.status === "unknown" && (
        <div className={styles.createUnknown}>
          <WorkItemMutationNotice
            mutation={createMutation}
            onReconcile={reconcileCreate}
          />
        </div>
      )}
    </main>
  )
}
