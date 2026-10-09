"use client"
import Link from "next/link"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Kbd } from "@/components/ui/kbd"
import {
  companiesFixture,
  notificationsFixture,
  currentUser,
  owners,
  defaultDraft,
  defaultFilters,
} from "./fixtures"
import type {
  Company,
  CompanyDraft,
  Filters,
  Notification,
  Overlay,
  Scenario,
  Sort,
} from "./model"
import { companyFromDraft, draftErrors, selectCompanies } from "./selectors"
import { companiesCsv, downloadCsv } from "./export"
import { SalesCrmSidebar } from "./sidebar"
import { SalesCrmHeader } from "./header"
import { SalesCrmToolbar } from "./toolbar"
import { SalesCrmTable } from "./table"
import { CompanyDetail } from "./company-detail"
import { Profile } from "./profile"
import { NewCompany, type FormErrors } from "./new-company"
import { Notifications } from "./notifications"
import { SalesCrmSearch } from "./search"
import { CrmSelect } from "./controls"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"

const widthKey = "easyuseui:sales-crm:sidebar-width:v1"
let memoryWidth: number | undefined
function readWidth() {
  if (memoryWidth !== undefined) return memoryWidth
  try {
    const stored = localStorage.getItem(widthKey)
    const value = stored === null ? 254 : Number(stored)
    return Number.isFinite(value) && value >= 200 && value <= 400 ? value : 254
  } catch {
    return 254
  }
}
function subscribeWidth(listener: () => void) {
  const storage = (e: StorageEvent) => {
    if (e.key === widthKey || e.key === null) {
      memoryWidth = undefined
      listener()
    }
  }
  window.addEventListener("storage", storage)
  window.addEventListener(widthKey, listener)
  return () => {
    window.removeEventListener("storage", storage)
    window.removeEventListener(widthKey, listener)
  }
}
function changeWidth(value: number) {
  memoryWidth = Math.max(200, Math.min(400, value))
  try {
    localStorage.setItem(widthKey, String(memoryWidth))
  } catch {
    /* Layout remains usable without storage. */
  }
  window.dispatchEvent(new Event(widthKey))
}
function viewRows(rows: Company[], scenario: Scenario) {
  return ["loading", "empty", "error"].includes(scenario)
    ? []
    : scenario === "partial"
      ? rows.slice(0, 6)
      : rows
}
function readLogo(file: File, signal: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    const cleanup = () => {
      signal.removeEventListener("abort", abort)
      reader.onload = reader.onerror = reader.onabort = null
    }
    const abort = () => {
      cleanup()
      if (reader.readyState === 1) reader.abort()
      reject(new Error("aborted"))
    }
    if (signal.aborted) {
      abort()
      return
    }
    signal.addEventListener("abort", abort, { once: true })
    reader.onerror = reader.onabort = () => {
      cleanup()
      reject(new Error("logo"))
    }
    reader.onload = () => {
      const result = String(reader.result)
      cleanup()
      resolve(result)
    }
    reader.readAsDataURL(file)
  })
}
export function SalesCrmDemo() {
  const { t, locale, setLocale } = useCrmI18n()
  const [companies, setCompanies] = useState<Company[]>(() => [
    ...companiesFixture,
  ])
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [sort, setSort] = useState<Sort>({
    columnId: "pipelineValue",
    direction: "desc",
  })
  const [selectedIds, setSelectedIds] = useState<string[]>(["microsoft"])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [mobileNavigation, setMobileNavigation] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(() => [
    ...notificationsFixture,
  ])
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [draft, setDraft] = useState<CompanyDraft>(defaultDraft)
  const [errors, setErrors] = useState<FormErrors>({})
  const [pending, setPending] = useState(false)
  const [scenario, setScenario] = useState<Scenario>("success")
  const [createFailure, setCreateFailure] = useState(false)
  const [downloadFailure, setDownloadFailure] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notice, setNotice] = useState<{
    kind: "created" | "createdHidden" | "exported" | "exportError"
    name?: string
    id?: string
    count?: number
  } | null>(null)
  const sidebarWidth = useSyncExternalStore(
    subscribeWidth,
    readWidth,
    () => 254,
  )
  const scope = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const objectFocus = useRef<HTMLHeadingElement>(null)
  const newCompanyFocus = useRef<HTMLInputElement>(null)
  const submission = useRef<AbortController | null>(null)
  const nextLocalId = useRef(0)
  useEffect(() => {
    scope.current?.focus({ preventScroll: true })
    return () => submission.current?.abort()
  }, [])
  // Object navigation stays inside one controlled Sheet; focus moves with its complete snapshot.
  const objectId =
    overlay && "id" in overlay ? `${overlay.type}:${overlay.id}` : null
  useEffect(() => {
    if (objectId) objectFocus.current?.focus({ preventScroll: true })
  }, [objectId])
  const finalFocus = () =>
    opener.current?.isConnected ? opener.current : searchRef.current
  function rememberOpener() {
    if (!overlay && !searchOpen)
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : searchRef.current
  }
  function open(next: Overlay) {
    rememberOpener()
    setMobileNavigation(false)
    setNotificationOpen(false)
    setOverlay(next)
    if (next?.type === "company") setActiveId(next.id)
  }
  function openSearch() {
    rememberOpener()
    setSearchOpen(true)
  }
  const rows = viewRows(selectCompanies(companies, filters, sort), scenario)
  const company =
    overlay?.type === "company"
      ? companies.find((c) => c.id === overlay.id)
      : undefined
  const person =
    overlay?.type === "profile"
      ? [...owners, currentUser].find((p) => p.name === overlay.id)
      : undefined
  function reset() {
    submission.current?.abort()
    submission.current = null
    setPending(false)
    setCompanies([...companiesFixture])
    setFilters(defaultFilters)
    setSort({ columnId: "pipelineValue", direction: "desc" })
    setSelectedIds(["microsoft"])
    setActiveId(null)
    setOverlay(null)
    setDraft(defaultDraft)
    setErrors({})
    setScenario("success")
    setNotice(null)
    setNotifications([...notificationsFixture])
    setCreateFailure(false)
    setDownloadFailure(false)
  }
  async function create() {
    if (submission.current) return
    const nextErrors = draftErrors(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>('[data-crm-field][aria-invalid="true"]')
          ?.focus(),
      )
      return
    }
    const controller = new AbortController()
    submission.current = controller
    setPending(true)
    try {
      // Keep the submission lock through a second click in the same event turn.
      await Promise.resolve()
      if (createFailure) throw new Error("fixture failure")
      const logo = draft.logo
        ? await readLogo(draft.logo, controller.signal)
        : undefined
      if (controller.signal.aborted) return
      const next = companyFromDraft(
        draft,
        `local-${++nextLocalId.current}`,
        logo,
      )
      const all = [...companies, next]
      const visible = viewRows(
        selectCompanies(all, filters, sort),
        scenario,
      ).some((c) => c.id === next.id)
      setCompanies(all)
      setNotice({
        kind: visible ? "created" : "createdHidden",
        name: next.name,
        id: next.id,
      })
      setDraft(defaultDraft)
      setOverlay(null)
      setErrors({})
    } catch {
      if (!controller.signal.aborted) setErrors({ submit: "createError" })
    } finally {
      if (submission.current === controller) {
        submission.current = null
        setPending(false)
      }
    }
  }
  function exportView() {
    try {
      if (downloadFailure) throw new Error("fixture failure")
      downloadCsv(
        companiesCsv(rows, [
          t("crm.companyName"),
          t("crm.segmentStage"),
          t("crm.owner"),
          t("crm.openDeals"),
          t("crm.pipelineValue"),
          t("crm.winProbability"),
          t("crm.lastInteraction"),
          t("crm.interaction"),
        ]),
      )
      setNotice({ kind: "exported", count: rows.length })
    } catch {
      setNotice({ kind: "exportError" })
    }
  }
  const sidebar = (
    <SalesCrmSidebar
      count={companies.length}
      onAbout={() => {
        setAboutOpen(true)
        setMobileNavigation(false)
      }}
      onNavigate={() => setMobileNavigation(false)}
    />
  )
  return (
    <ThemeBoundary
      mode="scoped"
      theme="dark"
      legacyAliases
      className={styles.theme}
    >
      <div
        ref={scope}
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label="Sales CRM"
        className={styles.app}
        data-sales-crm
        data-locale={locale}
      >
        <WorkspaceShell
          className={styles.shell}
          sidebar={sidebar}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={changeWidth}
          sidebarResizable
          sidebarMinWidth={200}
          sidebarMaxWidth={400}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarCollapsedChange={setSidebarCollapsed}
          title={
            <SalesCrmHeader
              searchRef={searchRef}
              onNavigation={() => setMobileNavigation(true)}
              onSearch={openSearch}
              onProfile={() => open({ type: "profile", id: currentUser.name })}
              notifications={
                <Notifications
                  open={notificationOpen}
                  onOpenChange={setNotificationOpen}
                  notifications={notifications}
                  companies={companies}
                  onRead={(id) =>
                    setNotifications((before) =>
                      before.map((n) =>
                        n.id === id ? { ...n, unread: false } : n,
                      ),
                    )
                  }
                  onReadAll={() =>
                    setNotifications((before) =>
                      before.map((n) => ({ ...n, unread: false })),
                    )
                  }
                  onCompany={(id) => open({ type: "company", id })}
                />
              }
            />
          }
        >
          <div
            className={styles.viewTabs}
            role="group"
            aria-label={t("crm.companies")}
          >
            <span aria-current="page">{t("crm.companies")}</span>
            <Button variant="ghost" disabled title={t("crm.unavailable")}>
              {t("crm.deals")}
            </Button>
            <Button variant="ghost" disabled title={t("crm.unavailable")}>
              {t("crm.forecast")}
            </Button>
          </div>
          <SalesCrmToolbar
            filters={filters}
            onFilters={setFilters}
            sort={sort}
            onSort={setSort}
            onExport={exportView}
            onNew={() => open({ type: "new" })}
          />
          {notice && (
            <div
              className={styles.notice}
              role={notice.kind === "exportError" ? "alert" : "status"}
            >
              {t(`crm.${notice.kind}`, {
                name: notice.name ?? "",
                count: notice.count ?? 0,
              })}
              {notice.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => open({ type: "company", id: notice.id! })}
                >
                  {t("crm.viewNew")}
                </Button>
              )}
              {notice.kind === "createdHidden" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters(defaultFilters)
                    setScenario("success")
                  }}
                >
                  {t("crm.resetFilters")}
                </Button>
              )}
            </div>
          )}
          <SalesCrmTable
            rows={rows}
            selectedIds={selectedIds}
            onSelection={setSelectedIds}
            activeId={activeId}
            onCompany={(id) => open({ type: "company", id })}
            onPerson={(id) => open({ type: "profile", id })}
            sort={sort}
            onSort={setSort}
            data={{
              state:
                scenario === "refresh-error"
                  ? "error"
                  : scenario === "success"
                    ? rows.length
                      ? "success"
                      : "empty"
                    : scenario,
              loadingLabel: t("crm.loading"),
              emptyTitle: t(
                scenario === "empty" ? "crm.empty" : "crm.noMatches",
              ),
              emptyDescription: t("crm.emptyDescription"),
              emptyAction: (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters(defaultFilters)
                    setScenario("success")
                  }}
                >
                  {t("crm.resetFilters")}
                </Button>
              ),
              error: {
                category: "request",
                message: t("crm.readError"),
                reason: t("crm.readReason"),
              },
              onRetry: () => setScenario("success"),
              partialDescription: t("crm.partial"),
              onLoadMore: () => setScenario("success"),
            }}
          />
        </WorkspaceShell>
        <Sheet
          open={Boolean(company || person)}
          onOpenChange={(value) => {
            if (!value) setOverlay(null)
          }}
        >
          <SheetContent
            size={560}
            className={styles.objectSheet}
            initialFocus={objectFocus}
            finalFocus={finalFocus}
            data-crm-object
          >
            <SheetHeader className={styles.sheetHeading}>
              <SheetTitle ref={objectFocus} tabIndex={-1}>
                {t(
                  company
                    ? "crm.details"
                    : person?.name === currentUser.name
                      ? "crm.profile"
                      : "crm.ownerProfile",
                )}
              </SheetTitle>
              <SheetDescription className="sr-only">
                {t("crm.readonly")}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className={styles.sheetBody}>
              {company ? (
                <CompanyDetail
                  key={company.id}
                  company={company}
                  onPerson={(id) => open({ type: "profile", id })}
                />
              ) : person ? (
                <Profile
                  person={person}
                  companies={companies}
                  onCompany={(id) => open({ type: "company", id })}
                />
              ) : null}
            </SheetBody>
            <SheetFooter>
              <span className={styles.footerNote}>{t("crm.readonly")}</span>
              {person && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters((before) => ({
                      ...before,
                      owner:
                        person.name === currentUser.name ? "all" : person.name,
                    }))
                    setOverlay(null)
                  }}
                >
                  {t("crm.showAccounts")}
                </Button>
              )}
              <Button onClick={() => setOverlay(null)}>{t("crm.done")}</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <NewCompany
          open={overlay?.type === "new"}
          onOpenChange={(value) => {
            if (!value) setOverlay(null)
          }}
          draft={draft}
          onDraft={(value) => {
            setDraft(value)
            setErrors((before) => {
              const next = { ...before }
              delete next.submit
              return next
            })
          }}
          errors={errors}
          onSubmit={() => void create()}
          pending={pending}
          finalFocus={finalFocus}
          nameFocus={newCompanyFocus}
        />
        <SalesCrmSearch
          open={searchOpen}
          onOpenChange={(value) => {
            if (value && !searchOpen) rememberOpener()
            setSearchOpen(value)
          }}
          query={query}
          onQueryChange={setQuery}
          companies={companies}
          scope={scope}
          finalFocus={() =>
            newCompanyFocus.current ?? objectFocus.current ?? finalFocus()
          }
          onCompany={(id) => open({ type: "company", id })}
          onPerson={(id) => open({ type: "profile", id })}
          onNew={() => open({ type: "new" })}
        />
        <Sheet open={mobileNavigation} onOpenChange={setMobileNavigation}>
          <SheetContent side="left" size={280} className={styles.mobileSidebar}>
            <SheetHeader className="sr-only">
              <SheetTitle>{t("crm.navigation")}</SheetTitle>
              <SheetDescription>{t("crm.localOnly")}</SheetDescription>
            </SheetHeader>
            <SheetBody className={styles.navigationBody}>{sidebar}</SheetBody>
          </SheetContent>
        </Sheet>
        <Sheet open={aboutOpen} onOpenChange={setAboutOpen}>
          <SheetContent size={440}>
            <SheetHeader>
              <SheetTitle>{t("crm.about")}</SheetTitle>
              <SheetDescription>{t("crm.localOnly")}</SheetDescription>
            </SheetHeader>
            <SheetBody className={styles.about}>
              <p>{t("crm.differences")}</p>
              <p>{t("crm.selectionHint")}</p>
              <p>{t("crm.layoutPreference")}</p>
              <p>
                <Kbd>Ctrl / ⌘ K</Kbd> · {t("crm.search")}
              </p>
              <CrmSelect
                label={t("crm.locale")}
                value={locale}
                options={[
                  { value: "zh-CN", label: "简体中文" },
                  { value: "en", label: "English" },
                ]}
                onChange={(value) => setLocale(value === "en" ? "en" : "zh-CN")}
              />
              <details>
                <summary>{t("crm.scenario")}</summary>
                <div className={styles.scenarios}>
                  <CrmSelect
                    label={t("crm.scenario")}
                    value={scenario}
                    options={(
                      [
                        ["success", "success"],
                        ["loading", "initialLoading"],
                        ["empty", "emptyState"],
                        ["partial", "partialState"],
                        ["error", "initialError"],
                        ["refresh-error", "refreshError"],
                      ] as const
                    ).map(([value, key]) => ({
                      value,
                      label: t(`crm.${key}`),
                    }))}
                    onChange={(value) => setScenario(value as Scenario)}
                  />
                  <label>
                    <Checkbox
                      checked={createFailure}
                      onCheckedChange={setCreateFailure}
                    />
                    {t("crm.simulateCreateFailure")}
                  </label>
                  <label>
                    <Checkbox
                      checked={downloadFailure}
                      onCheckedChange={setDownloadFailure}
                    />
                    {t("crm.simulateDownloadFailure")}
                  </label>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setNotifications((before) =>
                        before.some((n) => n.id === "missing")
                          ? before
                          : [
                              ...before,
                              {
                                id: "missing",
                                person: currentUser.name,
                                companyId: "removed-company",
                                kind: "mention",
                                unread: true,
                              },
                            ],
                      )
                    }
                  >
                    {t("crm.missingNotification")}
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    {t("crm.resetDemo")}
                  </Button>
                </div>
              </details>
              <Link href="/blog/sales-crm-replication/">{t("crm.blog")}</Link>
              <Link href="/docs/data-table/">{t("crm.docs")}</Link>
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    </ThemeBoundary>
  )
}
