import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"

export async function createAuthPagesConsumer(root) {
  await mkdir(path.join(root, "app/auth-pages"), { recursive: true })
  await writeFile(
    path.join(root, "app/auth-pages/page.tsx"),
    `"use client"
import { useState } from "react"
import { AuthForm, AuthPageShell, ErrorPage, type AuthFormValue, type AuthFeedback } from "@/components/blocks/auth-pages"
import { I18nProvider, useI18n } from "@/lib/i18n-provider"
import { Button } from "@/components/ui/button"
function Content() {
  const { locale, setLocale } = useI18n()
  const [value, setValue] = useState<AuthFormValue>({ name: "", email: "", password: "", confirmPassword: "", remember: false, acceptTerms: false })
  const [feedback, setFeedback] = useState<AuthFeedback>({ state: "idle" })
  const [submits, setSubmits] = useState(0)
  const [reads, setReads] = useState(0)
  return <AuthPageShell variant="gallery" toolbar={<Button onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}>Switch installed locale</Button>}>
    <AuthForm mode="register" value={value} onChange={setValue} feedback={feedback} onSubmit={() => { setSubmits(submits + 1); setFeedback({ state: "unknown", message: "Installed unknown fixture" }) }} />
    <Button onClick={() => setFeedback({ state: "error", message: "Installed receipt confirms no write" })}>Reconcile installed request</Button>
    <output data-submits>{submits}</output>
    <ErrorPage code={503} onRetry={() => setReads(reads + 1)} actions={[{ href: "/", label: "Installed home" }]} />
    <output data-reads>{reads}</output>
  </AuthPageShell>
}
export default function InstalledAuthPages() { return <I18nProvider><Content /></I18nProvider> }
`,
  )
}

export async function verifyAuthPagesConsumer(page, origin) {
  await page.goto(`${origin}/auth-pages/`)
  await page.getByRole("button", { name: "创建账户", exact: true }).click()
  await page.getByText("请输入姓名。", { exact: true }).waitFor()
  await page.getByLabel(/^姓名/).fill("Installed 中文 name")
  await page.getByLabel(/^邮箱/).fill("installed@example.com")
  await page.getByLabel(/^密码/).fill("installed-password")
  await page.getByLabel(/^确认密码/).fill("installed-password")
  await page.getByRole("checkbox", { name: "我已阅读并接受使用条款" }).check()
  await page.getByRole("button", { name: "创建账户", exact: true }).click()
  await page.getByText("Installed unknown fixture", { exact: true }).waitFor()
  assert.equal(await page.locator("output[data-submits]").textContent(), "1")
  assert.equal(
    await page
      .getByRole("button", { name: "创建账户", exact: true })
      .isEnabled(),
    false,
  )
  await page.getByRole("button", { name: "Switch installed locale" }).click()
  assert.equal(
    await page.getByLabel(/^Name/).inputValue(),
    "Installed 中文 name",
  )
  assert.equal(
    await page.getByLabel(/^Password/).inputValue(),
    "installed-password",
  )
  assert.equal(
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .isEnabled(),
    false,
  )
  await page
    .getByRole("button", { name: "Reconcile installed request" })
    .click()
  assert.equal(
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .isEnabled(),
    true,
  )
  await page.getByRole("button", { name: "Try again", exact: true }).click()
  assert.equal(await page.locator("output[data-reads]").textContent(), "1")
  await page
    .getByRole("heading", { name: "Temporarily unavailable", exact: true })
    .waitFor()
  console.log(
    "PASS: installed Auth pages mount, validate, retain bilingual drafts, lock unknown submission, reconcile and request error recovery",
  )
}
