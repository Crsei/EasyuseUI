"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-provider"
import { uiMessage, type UiMessage } from "@/lib/i18n-core"
import {
  createSelectionDraft,
  createSelectionHandoff,
  parseSelectionDraft,
  selectionImportLimit,
  type ComponentSelectionDraft,
  type SelectionCandidate,
} from "@/lib/component-selection-model"
import { ComponentSelectionWorkbench } from "@/components/blocks/component-selection-workbench"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Item } from "@/components/ui/item"
import { DataRegion } from "@/components/ui/data-region"
import { Tree } from "@/components/ui/tree"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/blocks/data-table"
import { Inspector } from "@/components/blocks/inspector"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { componentSelectionTemplate as template } from "./template"
import { selectionMarkdown } from "./handoff"

export const selectionStorageKey = `easyuseui:component-selection:${template.id}@${template.revision}`
const subscribe = () => () => {}
function readSaved() {
  try {
    const stored = localStorage.getItem(selectionStorageKey)
    if (stored === null)
      return {
        draft: createSelectionDraft(template),
        saved: "",
        error: undefined,
      }
    const result = parseSelectionDraft(stored, template)
    if (!result.ok)
      return {
        draft: createSelectionDraft(template),
        saved: "",
        error: uiMessage(`selection.${result.error}`),
      }
    return {
      draft: result.draft,
      saved: JSON.stringify(result.draft),
      error: undefined,
    }
  } catch {
    return {
      draft: createSelectionDraft(template),
      saved: "",
      error: uiMessage("selection.storageError"),
    }
  }
}
function CandidatePreview({ candidate }: { candidate: SelectionCandidate }) {
  const { t } = useI18n()
  const [active, setActive] = useState("overview")
  const [selected, setSelected] = useState("alpha")
  const [checked, setChecked] = useState<string[]>([])
  const sections = [
    { id: "overview", label: t("selection.demoOverview") },
    { id: "tasks", label: t("selection.demoTasks") },
    { id: "resources", label: t("selection.demoResources") },
  ]
  const rows = [
    { id: "alpha", name: "Alpha", owner: "Lin" },
    { id: "beta", name: "Beta", owner: "Chen" },
    { id: "gamma", name: "Gamma", owner: "Wang" },
  ]
  if (candidate.id === "tree")
    return (
      <>
        <Tree
          label={t("selection.demoNavigation")}
          defaultExpandedIds={["project"]}
          selectedId={active}
          onSelect={(node) => setActive(node.id)}
          nodes={[{ id: "project", label: "Project", children: sections }]}
        />
        <p>
          {t("selection.demoCurrent")}:{" "}
          {sections.find((section) => section.id === active)?.label ??
            "Project"}
        </p>
      </>
    )
  if (candidate.id === "tabs")
    return (
      <Tabs value={active} onValueChange={(value) => setActive(String(value))}>
        <TabsList aria-label={t("selection.demoNavigation")}>
          {sections.map((section) => (
            <TabsTab key={section.id} value={section.id}>
              {section.label}
            </TabsTab>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsPanel key={section.id} value={section.id}>
            {t("selection.demoCurrent")}: {section.label}
          </TabsPanel>
        ))}
      </Tabs>
    )
  if (candidate.id === "item")
    return (
      <ul aria-label={t("selection.demoRecords")}>
        {rows.map((row) => (
          <li key={row.id}>
            <Item
              title={row.name}
              description={`${t("selection.demoOwner")}: ${row.owner}`}
              selected={selected === row.id}
              onSelect={() => setSelected(row.id)}
            />
          </li>
        ))}
      </ul>
    )
  if (candidate.id === "data-table")
    return (
      <DataTable
        rows={rows}
        columns={[
          {
            id: "name",
            header: t("selection.demoName"),
            cell: (row) => row.name,
            primary: true,
          },
          {
            id: "owner",
            header: t("selection.demoOwner"),
            cell: (row) => row.owner,
          },
        ]}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        caption={t("selection.demoRecords")}
        selectedIds={checked}
        onSelectionChange={setChecked}
        activeRowId={selected}
        onActivateRow={(row) => setSelected(row.id)}
      />
    )
  if (candidate.id === "inspector")
    return (
      <Inspector
        object={{
          id: "alpha",
          title: "Alpha",
          kind: t("selection.demoObject"),
          metadata: [
            { label: t("selection.demoOwner"), value: "Lin" },
            { label: "ID", value: "alpha" },
          ],
        }}
      />
    )
  if (candidate.id === "card")
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alpha</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("selection.demoOwner")}: Lin</p>
          <p>ID: alpha</p>
        </CardContent>
      </Card>
    )
  return <DataRegion state="empty" />
}
function download(
  content: string,
  format: "markdown" | "json",
  filename: string,
) {
  const url = URL.createObjectURL(
    new Blob([content], {
      type:
        format === "json"
          ? "application/json;charset=utf-8"
          : "text/markdown;charset=utf-8",
    }),
  )
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function ComponentSelectionDemo() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  return hydrated ? <SelectionAdapter /> : <DataRegion state="loading" />
}
function SelectionAdapter() {
  const { locale, t, resolve } = useI18n()
  const [initial] = useState(readSaved)
  const [draft, setDraft] = useState(initial.draft)
  const [saved, setSaved] = useState(initial.saved)
  const [error, setError] = useState<UiMessage | undefined>(initial.error)
  const [notice, setNotice] = useState<UiMessage>()
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<ComponentSelectionDraft | null>(null)
  const importRequest = useRef(0)
  useEffect(
    () => () => {
      importRequest.current += 1
    },
    [],
  )
  const markdown = selectionMarkdown(draft, template, locale)
  const savedCurrent = saved === JSON.stringify(draft)
  function change(value: ComponentSelectionDraft) {
    setDraft(value)
    setNotice(undefined)
  }
  function save() {
    try {
      const value = JSON.stringify(draft)
      localStorage.setItem(selectionStorageKey, value)
      setSaved(value)
      setError(undefined)
      setNotice(uiMessage("selection.saved"))
    } catch {
      setError(uiMessage("selection.storageError"))
    }
  }
  function restore() {
    const stored = readSaved()
    if (stored.error) {
      setError(stored.error)
      return
    }
    if (!stored.saved) {
      setNotice(uiMessage("selection.noSaved"))
      return
    }
    setPending(stored.draft)
    setSaved(stored.saved)
  }
  async function importFile(file: File | undefined) {
    if (!file) return
    const request = ++importRequest.current
    setError(undefined)
    if (file.size > selectionImportLimit) {
      setError(uiMessage("selection.tooLarge"))
      return
    }
    setBusy(true)
    try {
      const result = parseSelectionDraft(await file.text(), template)
      if (request !== importRequest.current) return
      if (!result.ok) {
        setError(uiMessage(`selection.${result.error}`))
        return
      }
      setPending(result.draft)
    } catch {
      if (request === importRequest.current)
        setError(uiMessage("selection.invalid"))
    } finally {
      if (request === importRequest.current) setBusy(false)
    }
  }
  function exportFile(format: "markdown" | "json") {
    try {
      const filename =
        draft.projectName
          .trim()
          .replace(/[^\p{L}\p{N}_-]+/gu, "-")
          .slice(0, 80) || "new-project"
      download(
        format === "markdown"
          ? markdown
          : JSON.stringify(createSelectionHandoff(draft, template), null, 2),
        format,
        `${filename}.component-selection.${format === "json" ? "json" : "md"}`,
      )
      setNotice(uiMessage("selection.downloadStarted"))
      setError(undefined)
    } catch {
      setError(uiMessage("selection.exportError"))
    }
  }
  return (
    <>
      <ComponentSelectionWorkbench
        specification={
          <>
            <p>{t("selection.stack")}</p>
            <p>{t("selection.loadingBoundary")}</p>
            <Button
              variant="ghost"
              render={
                <Link
                  prefetch={false}
                  href="/docs/component-selection-workbench/"
                />
              }
            >
              {t("selection.api")}
            </Button>
          </>
        }
        template={template}
        value={draft}
        onChange={change}
        renderPreview={(candidate) => (
          <CandidatePreview candidate={candidate} />
        )}
        handoff={markdown}
        busy={busy}
        feedback={
          <>
            {t(savedCurrent ? "selection.saved" : "selection.unsaved")}
            {notice && <> · {resolve(notice)}</>}
          </>
        }
        error={error && resolve(error)}
        onExport={exportFile}
        onCopy={async () => {
          try {
            await navigator.clipboard.writeText(markdown)
            setNotice(uiMessage("selection.copied"))
            setError(undefined)
          } catch {
            setError(uiMessage("selection.copyError"))
          }
        }}
        actions={
          <>
            <Button variant="secondary" onClick={save}>
              {t("selection.save")}
            </Button>
            <Button variant="ghost" onClick={restore}>
              {t("selection.restore")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPending(createSelectionDraft(template))}
            >
              {t("selection.new")}
            </Button>
            <Field label={t("selection.import")}>
              {(props) => (
                <Input
                  {...props}
                  type="file"
                  accept=".json,application/json"
                  disabled={busy}
                  onChange={(event) => {
                    void importFile(event.target.files?.[0])
                    event.target.value = ""
                  }}
                />
              )}
            </Field>
          </>
        }
      />
      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
      >
        <DialogContent>
          <DialogTitle>{t("selection.replaceTitle")}</DialogTitle>
          <DialogDescription>
            {t("selection.replaceDescription", {
              name: pending?.projectName || t("selection.blank"),
            })}
          </DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPending(null)}>
              {t("selection.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (pending) {
                  setDraft(pending)
                  setNotice(uiMessage("selection.replaced"))
                  setError(undefined)
                }
                setPending(null)
              }}
            >
              {t("selection.replace")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
