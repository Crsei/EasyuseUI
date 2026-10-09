import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { componentManifest } from "../lib/component-manifest.ts"
import { uiContractEvidence } from "../lib/ui-contract-evidence.ts"
import {
  checkDictionary,
  synchronizeDictionary,
} from "./ui-contracts-model.mjs"
const root = path.resolve(import.meta.dirname, ".."),
  write = process.argv.includes("--write")
const dictionary = path.join(root, "UI-VISUAL-DICTIONARY.md")
if (write)
  fs.writeFileSync(
    dictionary,
    synchronizeDictionary(
      fs.readFileSync(dictionary, "utf8"),
      componentManifest,
    ),
  )
checkDictionary(fs.readFileSync(dictionary, "utf8"), componentManifest)
const registry = new Map(
  JSON.parse(fs.readFileSync(path.join(root, "registry.json"))).items.map(
    (item) => [item.name, item],
  ),
)
let availability =
  "# 组件可用性映射\n\n由 Manifest 与 Registry 生成，运行 `pnpm ui-contracts:build` 更新。这里表示当前源码树的可安装入口；发布与并行未提交工作的验证范围见实施记录，不能从条目数量推导发布状态。\n\n| 组件 | 源码 | 示例 | Registry | 文档 |\n| --- | --- | --- | --- | --- |\n"
let evidence =
  "# 变体与交互验收索引\n\n由 Manifest 和 `lib/ui-contract-evidence.ts` 生成。所有文档变体均由 `scripts/check-docs-snippets.mjs` 编译；编译只证明 API，不能证明视觉或交互。浏览器操作见下列命名测试，自动 axe 与强制颜色见 `tests/ui-gap-audit.spec.ts`。截图仅记录所列场景。人工读屏尚未执行，需要有读屏软件的人工环境，不把 headless axe 当成人工验收。\n\n| 组件 | 变体编译入口 | 浏览器或模型场景 |\n| --- | --- | --- |\n"
for (const entry of componentManifest) {
  const item = registry.get(entry.registryId)
  assert.ok(
    item?.files.some((file) => file.path === entry.source),
    `Registry source missing: ${entry.slug}`,
  )
  for (const file of [entry.source, entry.example])
    assert.ok(fs.existsSync(path.join(root, file)), file)
  availability += `| ${entry.name} | [源码](../${entry.source}) | [示例](../${entry.example}) | ${entry.registryId} | ${entry.docPath} |\n`
  const variants =
    entry.variants?.map((v, i) => `${i}: ${v.title["zh-CN"]}`).join("<br>") ||
    "不适用：Manifest 未声明可选文档变体；入口由 typecheck 验证"
  const cases = uiContractEvidence[entry.slug] || []
  for (const title of cases)
    assert.ok(
      ["tests/ui-gap-audit.spec.ts", "tests/ui-contract-model.spec.ts"].some(
        (file) =>
          fs
            .readFileSync(path.join(root, file), "utf8")
            .includes(`test("${title}"`),
      ),
      `Missing scenario: ${title}`,
    )
  evidence += `| ${entry.name} | ${variants} | ${cases.join("<br>") || "本索引未覆盖专属浏览器场景；既有测试保留，不能据此宣称整体验收"} |\n`
}
for (const [file, content] of Object.entries({
  "docs/component-availability.md": availability,
  "docs/ui-contract-evidence.md": evidence,
})) {
  if (write) fs.writeFileSync(path.join(root, file), content)
  else
    assert.equal(
      fs.readFileSync(path.join(root, file), "utf8"),
      content,
      `Stale ${file}; run pnpm ui-contracts:build`,
    )
}
console.log(
  `UI contracts checked: ${componentManifest.length} source/example/Registry mappings and variant records`,
)
