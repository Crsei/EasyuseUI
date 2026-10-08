import { expect, test } from "@playwright/test"
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
// The CLI is plain ESM and is also the implementation exercised by this test.
import { snapshotRegistry } from "../scripts/snapshot-registry.mjs"
test("Registry release locks recursive dependencies and rejects different bytes under an existing version", async () => {
  const fixture = await mkdtemp(
    path.join(os.tmpdir(), "easyuseui-registry-freeze-"),
  )
  const source = path.join(fixture, "source"),
    output = path.join(fixture, "output")
  for (const mode of ["", "host", "scoped"]) {
    await mkdir(path.join(source, mode), { recursive: true })
    await writeFile(
      path.join(source, mode, "button.json"),
      JSON.stringify({
        name: "button",
        registryDependencies: [
          `http://localhost:3010/r/${mode ? `${mode}/` : ""}theme.json`,
        ],
        files: [{ path: "button.tsx", content: "first" }],
      }),
    )
  }
  const options = {
    source,
    output,
    origin: "https://registry.example.test",
    version: "0.1.0-preview.1",
  }
  await snapshotRegistry(options)
  await snapshotRegistry(options)
  const original = await readFile(
    path.join(output, options.version, "scoped/button.json"),
    "utf8",
  )
  expect(JSON.parse(original).registryDependencies).toEqual([
    "https://registry.example.test/r/0.1.0-preview.1/scoped/theme.json",
  ])
  await writeFile(
    path.join(source, "scoped/button.json"),
    JSON.stringify({
      name: "button",
      files: [{ path: "button.tsx", content: "changed" }],
    }),
  )
  await expect(snapshotRegistry(options)).rejects.toThrow(
    "Immutable Registry collision",
  )
  expect(
    await readFile(
      path.join(output, options.version, "scoped/button.json"),
      "utf8",
    ),
  ).toBe(original)
})
