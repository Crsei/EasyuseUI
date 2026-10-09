"use client"

import { useId, useState, type FormEvent } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
} from "@/components/ui/native-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

function useFormReceipt() {
  const [receipt, setReceipt] = useState("")
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReceipt(
      JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    )
  }
  return { receipt, submit }
}

export function TextareaDemo() {
  const { t } = useSiteI18n()
  const [draft, setDraft] = useState("")
  const [invalid, setInvalid] = useState(false)
  const { receipt, submit } = useFormReceipt()
  return (
    <form onSubmit={submit} className="grid w-full max-w-md gap-3">
      <Field
        label={t("site.shadcnForms.draft")}
        description={t("site.shadcnForms.draftHint")}
        error={invalid ? t("site.shadcnForms.draftError") : undefined}
      >
        {(props) => (
          <Textarea
            {...props}
            name="draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        )}
      </Field>
      <Textarea disabled aria-label={t("site.shadcnForms.disabledDraft")} />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setInvalid(!invalid)}>
          {t("site.shadcnForms.toggleError")}
        </Button>
        <Button type="submit">{t("site.shadcnForms.readForm")}</Button>
      </div>
      <output
        className="break-all text-xs"
        aria-label={t("site.shadcnForms.formValues")}
      >
        {receipt}
      </output>
    </form>
  )
}

export function LabelDemo() {
  const { t } = useSiteI18n()
  const id = useId()
  return (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor={id}>{t("site.shadcnForms.projectName")}</Label>
      <Input id={id} defaultValue="workspace-alpha" />
      <p className="text-xs text-muted-foreground">
        {t("site.shadcnForms.labelHint")}
      </p>
    </div>
  )
}

export function NativeSelectDemo() {
  const { t } = useSiteI18n()
  const [scope, setScope] = useState("project")
  const { receipt, submit } = useFormReceipt()
  return (
    <form onSubmit={submit} className="grid w-full max-w-md gap-3">
      <Field label={t("site.shadcnForms.scope")}>
        {(props) => (
          <NativeSelect
            {...props}
            name="scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
          >
            <NativeSelectOptGroup label={t("site.shadcnForms.availableScopes")}>
              <NativeSelectOption value="project">
                {t("site.shadcnForms.project")}
              </NativeSelectOption>
              <NativeSelectOption value="workspace">
                {t("site.shadcnForms.workspace")}
              </NativeSelectOption>
              <NativeSelectOption value="unavailable" disabled>
                {t("site.shadcnForms.unavailable")}
              </NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
        )}
      </Field>
      <NativeSelect
        disabled
        aria-label={t("site.shadcnForms.disabledScope")}
        defaultValue="project"
      >
        <NativeSelectOption value="project">
          {t("site.shadcnForms.project")}
        </NativeSelectOption>
      </NativeSelect>
      <Button type="submit">{t("site.shadcnForms.readForm")}</Button>
      <output aria-label={t("site.shadcnForms.formValues")} className="text-xs">
        {receipt}
      </output>
    </form>
  )
}

export function SwitchDemo() {
  const { t } = useSiteI18n()
  const [checked, setChecked] = useState(false)
  const id = useId()
  const { receipt, submit } = useFormReceipt()
  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id={id}
          name="notifications"
          value="enabled"
          uncheckedValue="disabled"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label htmlFor={id}>{t("site.shadcnForms.notifications")}</Label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Switch
          defaultChecked
          aria-label={t("site.shadcnForms.uncontrolledSwitch")}
        />
        <Switch
          defaultChecked
          disabled
          aria-label={t("site.shadcnForms.disabledSwitch")}
        />
        <Switch
          defaultChecked
          readOnly
          aria-label={t("site.shadcnForms.readonlySwitch")}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("site.shadcnForms.localOnly")}
      </p>
      <Button type="submit">{t("site.shadcnForms.readForm")}</Button>
      <output aria-label={t("site.shadcnForms.formValues")} className="text-xs">
        {receipt}
      </output>
    </form>
  )
}

export function RadioGroupDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState("manual")
  const labelId = useId()
  const { receipt, submit } = useFormReceipt()
  return (
    <form onSubmit={submit} className="grid gap-3">
      <p id={labelId} className="text-[13px] font-medium">
        {t("site.shadcnForms.mode")}
      </p>
      <RadioGroup
        aria-labelledby={labelId}
        name="mode"
        value={value}
        onValueChange={setValue}
      >
        {(["manual", "automatic", "unavailable"] as const).map((mode) => (
          <label key={mode} className="flex items-center gap-2 text-[13px]">
            <RadioGroupItem value={mode} disabled={mode === "unavailable"} />
            {t(`site.shadcnForms.${mode}`)}
          </label>
        ))}
      </RadioGroup>
      <RadioGroup
        aria-label={t("site.shadcnForms.disabledGroup")}
        defaultValue="locked"
        disabled
      >
        <label className="flex items-center gap-2 text-[13px]">
          <RadioGroupItem value="locked" />
          {t("site.shadcnForms.unavailable")}
        </label>
      </RadioGroup>
      <Button type="submit">{t("site.shadcnForms.readForm")}</Button>
      <output aria-label={t("site.shadcnForms.formValues")} className="text-xs">
        {receipt}
      </output>
    </form>
  )
}
