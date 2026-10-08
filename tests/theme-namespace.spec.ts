import { expect, test } from "@playwright/test"
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { themeModes } from "../scripts/theme-modes.mjs"
test("theme variants keep private variable names intact and resolve dynamic status colors", async () => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "easyuseui-theme-transform-"),
  )
  await mkdir(path.join(root, "styles"))
  await writeFile(
    path.join(root, "styles/theme.css"),
    await readFile(path.resolve("styles/theme.css")),
  )
  const modes = await themeModes(root)
  const result = modes.namespace(
    "text-muted bg-surface-hover/50 shadow-[var(--shadow-floating)] var(--text-muted) var(--${meta.token})",
  )
  expect(result).toBe(
    "text-eu-muted bg-eu-surface-hover/50 shadow-[var(--eu-shadow-floating)] var(--eu-text-muted) var(--eu-${meta.token})",
  )
  const css = await readFile(
    path.join(root, "styles/theme-boundary.css"),
    "utf8",
  )
  expect(css).not.toMatch(/:root\s*\{/)
  expect(css).toContain("--eu-background: var(--background, inherit)")
  expect(css).toContain('[data-eu-mode="scoped"][data-eu-theme="dark"]')
})
