"use client"

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import {
  AuthForm,
  AuthPageGallery,
  AuthPagePreview,
  AuthPageShell,
  ErrorPage,
  type AuthFeedback,
  type AuthFormValue,
  type AuthMode,
  type HttpErrorCode,
} from "@/components/blocks/auth-pages"
import { Button, buttonVariants } from "@/components/ui/button"
import { NativeSelect } from "@/components/ui/native-select"
import { Alert } from "@/components/ui/alert"
import { FormSection } from "@/components/blocks/form-section"
import { useI18n } from "@/lib/i18n-provider"
import { createTranslator } from "@/lib/i18n-core"
import { LocaleSwitcher } from "@/components/site/locale-switcher"
import { SitePageMetadata } from "@/components/site/site-page-metadata"
import { authExampleMessages, authScreens, type AuthScreen } from "./messages"

const base = "/examples/auth-errors/"
const links = {
  login: `${base}login/`,
  register: `${base}register/`,
  "forgot-password": `${base}forgot-password/`,
}
const initial: AuthFormValue = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  remember: false,
  acceptTerms: false,
}
const subscribeHydration = () => () => {}
const hydratedSnapshot = () => true
const serverSnapshot = () => false
function useExampleText() {
  const { locale } = useI18n()
  return createTranslator(locale, authExampleMessages)
}
function AuthToolbar({ overview }: { overview?: boolean }) {
  const t = useExampleText()
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    hydratedSnapshot,
    serverSnapshot,
  )
  return (
    <>
      <a
        className={buttonVariants({ variant: "ghost" })}
        href={overview ? "/examples/" : base}
      >
        {t(overview ? "backExamples" : "overview")}
      </a>
      <LocaleSwitcher />
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("theme")}
        disabled={!hydrated}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {hydrated && resolvedTheme === "dark" ? <Sun /> : <Moon />}
      </Button>
    </>
  )
}

export function AuthFormFixture({
  mode,
  preview = false,
}: {
  mode: AuthMode
  preview?: boolean
}) {
  const t = useExampleText()
  const id = useId()
  const [value, setValue] = useState(initial)
  const [outcome, setOutcome] = useState<"success" | "error" | "unknown">(
    "success",
  )
  const [state, setState] = useState<AuthFeedback["state"]>("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef(false)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  const feedbackKey =
    state === "submitting"
      ? "submitting"
      : state === "unknown"
        ? "unknownResult"
        : state === "success"
          ? mode === "login"
            ? "loginSuccess"
            : mode === "register"
              ? "registerSuccess"
              : "forgotSuccess"
          : state === "error"
            ? mode === "login"
              ? "loginError"
              : mode === "register"
                ? "registerError"
                : "forgotError"
            : undefined
  const reset = () => {
    pending.current = false
    setState("idle")
  }
  const content = (
    <AuthForm
      mode={mode}
      value={value}
      onChange={setValue}
      links={links}
      headingLevel={preview ? "h2" : "h1"}
      terms={
        <details>
          <summary>{t("terms")}</summary>
          <p>{t("termsBody")}</p>
        </details>
      }
      feedback={{
        state,
        message: feedbackKey && t(feedbackKey),
        actions:
          preview && (state === "success" || state === "unknown") ? (
            <Button variant="ghost" onClick={reset}>
              {t("resetFixture")}
            </Button>
          ) : undefined,
      }}
      onSubmit={() => {
        if (pending.current) return
        pending.current = true
        setState("submitting")
        const submittedOutcome = outcome
        timer.current = setTimeout(() => {
          pending.current = false
          setState(submittedOutcome)
          if (submittedOutcome === "success")
            setValue((current) => ({
              ...current,
              password: "",
              confirmPassword: "",
            }))
        }, 500)
      }}
    />
  )
  if (!preview) return content
  return (
    <AuthPagePreview
      title={t(mode)}
      href={links[mode]}
      controls={
        <>
          <label htmlFor={`${id}-outcome`}>{t("scenario")}</label>
          <NativeSelect
            id={`${id}-outcome`}
            value={outcome}
            disabled={state === "submitting" || state === "unknown"}
            onChange={(event) => {
              setOutcome(event.target.value as typeof outcome)
              setState("idle")
            }}
          >
            <option value="success">{t("success")}</option>
            <option value="error">{t("error")}</option>
            <option value="unknown">{t("unknown")}</option>
          </NativeSelect>
        </>
      }
    >
      {content}
    </AuthPagePreview>
  )
}
function ErrorFixture({
  code,
  preview = false,
}: {
  code: HttpErrorCode
  preview?: boolean
}) {
  const t = useExampleText()
  const [retrying, setRetrying] = useState(false)
  const [retried, setRetried] = useState(false)
  const pending = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  const actions =
    code === 401
      ? [
          { href: links.login, label: t("signIn") },
          { href: links.register, label: t("registerAction") },
        ]
      : code === 403
        ? [
            { href: links.login, label: t("switchAccount") },
            { href: base, label: t("home") },
          ]
        : [{ href: base, label: t("home") }]
  const content = (
    <ErrorPage
      code={code}
      actions={actions}
      compact={preview}
      headingLevel={preview ? "h2" : "h1"}
      requestId={code >= 500 ? `DEMO-AE-${code}` : undefined}
      feedback={retried && t("retryFixture")}
      retrying={retrying}
      onRetry={
        code >= 500
          ? () => {
              if (pending.current) return
              pending.current = true
              setRetrying(true)
              timer.current = setTimeout(() => {
                pending.current = false
                setRetrying(false)
                setRetried(true)
              }, 500)
            }
          : undefined
      }
    />
  )
  return preview ? (
    <AuthPagePreview
      title={t(String(code) as AuthScreen)}
      href={`${base}${code}/`}
    >
      {content}
    </AuthPagePreview>
  ) : (
    content
  )
}
export function AuthErrorsDemo({
  headingLevel = "h1",
}: {
  headingLevel?: "h1" | "h2"
}) {
  const t = useExampleText()
  return (
    <AuthPageGallery
      headingLevel={headingLevel}
      title={t("title")}
      description={t("description")}
      details={
        <details>
          <summary>{t("technical")}</summary>
          <FormSection title="Auth & errors">
            <p>{t("stack")}</p>
            <p>{t("mapping")}</p>
            <p>{t("boundary")}</p>
            <Link
              prefetch={false}
              className={buttonVariants({ variant: "secondary" })}
              href="/docs/auth-pages/"
            >
              {t("docs")}
            </Link>
          </FormSection>
        </details>
      }
    >
      <AuthFormFixture mode="login" preview />
      <AuthFormFixture mode="register" preview />
      <AuthFormFixture mode="forgot-password" preview />
      {([401, 403, 404, 500, 503] as const).map((code) => (
        <ErrorFixture key={code} code={code} preview />
      ))}
    </AuthPageGallery>
  )
}
export function AuthErrorsPage({ screen }: { screen?: AuthScreen }) {
  const t = useExampleText()
  const isAuth =
    screen === "login" || screen === "register" || screen === "forgot-password"
  const pageTitle = screen
    ? {
        "zh-CN": authExampleMessages["zh-CN"][screen].replace(/^\d+ \/ /, ""),
        en: authExampleMessages.en[screen].replace(/^\d+ \/ /, ""),
      }
    : {
        "zh-CN": authExampleMessages["zh-CN"].title,
        en: authExampleMessages.en.title,
      }
  return (
    <>
      <SitePageMetadata
        pathname={screen ? `${base}${screen}` : base.slice(0, -1)}
        title={pageTitle}
        description={{
          "zh-CN": authExampleMessages["zh-CN"].description,
          en: authExampleMessages.en.description,
        }}
      />
      <AuthPageShell
        variant={!screen ? "gallery" : isAuth ? "auth" : "error"}
        brandHref={base}
        toolbar={<AuthToolbar overview={!screen} />}
        footer={<span>{t("fixture")}</span>}
      >
        {!screen ? (
          <AuthErrorsDemo />
        ) : isAuth ? (
          <AuthFormFixture mode={screen} />
        ) : (
          <ErrorFixture code={Number(screen) as HttpErrorCode} />
        )}
      </AuthPageShell>
    </>
  )
}

/** Small catalog demo; the linked gallery mounts all eight page modules. */
export function AuthPagesDemo() {
  const t = useExampleText()
  return (
    <>
      <Alert>
        {t("fixture")} <a href={base}>{t("overview")}</a>
      </Alert>
      <AuthErrorsDemo headingLevel="h2" />
    </>
  )
}
export { authScreens }
