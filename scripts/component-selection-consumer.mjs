import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"

export async function createSelectionConsumer(fixture) {
  await mkdir(path.join(fixture, "app/component-selection"), {
    recursive: true,
  })
  await writeFile(
    path.join(fixture, "app/component-selection/page.tsx"),
    `"use client"
import { useState } from "react"
import { ComponentSelectionWorkbench } from "@/components/blocks/component-selection-workbench"
import { createSelectionDraft, createSelectionHandoff, parseSelectionDraft, type SelectionTemplate } from "@/lib/component-selection-model"
import { I18nProvider } from "@/lib/i18n-provider"
import { Item } from "@/components/ui/item"
const template: SelectionTemplate = { id: "consumer", revision: "1", groups: [{ id: "records", title: "Records", purpose: "Select a records pattern", candidates: ["one", "two"].map(id => ({ id, name: id, description: "Installed preview", suitableFor: "Records", limitation: "Caller-owned data", source: "consumer.tsx", origin: "Consumer", version: "1", license: "Fixture" })) }] }
export default function Page() {
  const [draft, setDraft] = useState(() => createSelectionDraft(template))
  const [locale, setLocale] = useState<"zh-CN" | "en">("zh-CN")
  return <I18nProvider locale={locale}><button onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}>Switch locale</button>
    <ComponentSelectionWorkbench template={template} value={draft} onChange={setDraft} renderPreview={candidate => <Item title={candidate.name} />} handoff={JSON.stringify(createSelectionHandoff(draft, template))} />
    <output data-valid>{String(parseSelectionDraft(JSON.stringify(draft), template).ok)}</output>
  </I18nProvider>
}
`,
  )
}
export async function verifySelectionConsumer(page, origin) {
  await page.goto(`${origin}/component-selection/`)
  await page
    .getByRole("textbox", { name: "one 批注", exact: true })
    .fill("Installed note")
  await page
    .getByRole("combobox", { name: "one 选择", exact: true })
    .selectOption("preferred")
  await page
    .getByRole("combobox", { name: "two 选择", exact: true })
    .selectOption("preferred")
  assert.equal(
    await page
      .getByRole("combobox", { name: "one 选择", exact: true })
      .inputValue(),
    "alternative",
  )
  await page.getByRole("button", { name: "Switch locale", exact: true }).click()
  assert.equal(
    await page
      .getByRole("textbox", { name: "one annotation", exact: true })
      .inputValue(),
    "Installed note",
  )
  assert.equal(
    await page
      .getByRole("combobox", { name: "two decision", exact: true })
      .inputValue(),
    "preferred",
  )
  assert.equal(await page.locator("output[data-valid]").textContent(), "true")
  assert.equal(await page.locator("[data-candidate]").count(), 2)
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 })
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    )
  }
  console.log(
    "PASS: installed ComponentSelectionWorkbench, model, CSS, controlled decisions, retained annotations, locale and responsive layout",
  )
}
