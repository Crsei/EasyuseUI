import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
import { loadSvgModules } from "./svg-workbench-module-loader.mjs"
export async function createSvgConsumer(fixture) {
  const { model, parser } = await loadSvgModules()
  const reference = parser.parseSvg(
    '<svg viewBox="0 0 24 24" aria-labelledby="caption"><title id="caption">Installed artwork</title><defs><linearGradient id="paint"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient><path id="shape" d="M2 2L20 20"/></defs><use href="#shape" stroke="url(#paint)" stroke-width="2"/></svg>',
  ).document
  const directory = path.join(fixture, "app/svg-installed")
  await mkdir(directory, { recursive: true })
  await writeFile(
    path.join(directory, "artwork.tsx"),
    model.svgToTsx(reference),
  )
  await writeFile(
    path.join(directory, "page.tsx"),
    `"use client"
import {useEffect,useState} from "react"
import {SvgWorkbench} from "@/components/blocks/svg-workbench"
import {useSvgWorkbenchEditor} from "@/lib/use-svg-workbench-editor"
import {loadSvgCollection,type SvgIconAsset} from "@/lib/svg-workbench-assets"
import {I18nProvider} from "@/lib/i18n-provider"
import Artwork from "./artwork"
export default function InstalledSvg(){
 const editor=useSvgWorkbenchEditor(); const [assets,setAssets]=useState<SvgIconAsset[]>([]); const [mode,setMode]=useState("failure");
 useEffect(()=>{void loadSvgCollection("lucide").then(setAssets)},[])
 return <I18nProvider><main style={{height:"100dvh"}}><div data-exported-artwork><Artwork/><Artwork/></div><button onClick={()=>setMode("pending")}>Pending export</button><div style={{height:"calc(100dvh - 80px)"}}><SvgWorkbench {...editor} layout="fill" library={{assets,collection:"lucide",onCollectionChange:()=>{},state:assets.length?"success":"loading"}} onExport={async (_file,signal)=>{if(mode==="failure")throw new Error("Installed export failed");await new Promise<void>((_resolve,reject)=>{signal.addEventListener("abort",()=>reject(new DOMException("Cancelled","AbortError")),{once:true})})}}/></div></main></I18nProvider>
}
`,
  )
}
export async function verifySvgConsumer(page, origin) {
  await page.goto(`${origin}/svg-installed/`, { waitUntil: "domcontentloaded" })
  const artwork = page.locator("[data-exported-artwork]")
  const ids = await artwork
    .locator("[id]")
    .evaluateAll((nodes) => nodes.map((n) => n.id))
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(await artwork.locator("svg").count(), 2)
  for (const svg of await artwork.locator("svg").all()) {
    const caption = await svg.getAttribute("aria-labelledby")
    assert.equal(await svg.locator(`[id="${caption}"]`).count(), 1)
  }
  await page
    .locator('[data-svg-workbench] [data-data-state="success"]')
    .first()
    .waitFor()
  for (const use of await artwork.locator("use").all()) {
    const ref = await use.getAttribute("href")
    assert.ok(ref.startsWith("#"))
    assert.equal(await artwork.locator(`[id="${ref.slice(1)}"]`).count(), 1)
  }
  await page.getByRole("button", { name: "lucide:check", exact: true }).click()
  await page.getByRole("button", { name: "插入副本", exact: true }).click()
  await page.getByRole("button", { name: "导出", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("tab", { name: "TSX", exact: true }).click()
  await page.waitForFunction(() =>
    document
      .querySelector('[role="dialog"] textarea')
      ?.value.includes("function SvgArtwork"),
  )
  await dialog.getByRole("button", { name: "下载文件", exact: true }).click()
  await dialog.getByText("导出失败；文档保留，请重试。").waitFor()
  await page.keyboard.press("Escape")
  assert.equal(
    await page
      .getByRole("group", { name: "画布", exact: true })
      .locator("path")
      .getAttribute("d"),
    "M20 6 9 17l-5-5",
  )
  await page.getByRole("button", { name: "Pending export" }).click()
  await page.getByRole("button", { name: "导出", exact: true }).click()
  await dialog.getByRole("button", { name: "下载文件", exact: true }).click()
  await dialog.getByRole("button", { name: "取消任务", exact: true }).click()
  await dialog.getByText("已取消；当前文档和草稿保留。").waitFor()
  await page.keyboard.press("Escape")
  assert.equal(
    await page.locator("[data-svg-workbench]").getAttribute("data-revision"),
    "1",
  )
  console.log(
    "PASS: installed SVG Workbench, worker TSX export, export failure/cancellation and independently compiled artwork with collision-free references.",
  )
}
