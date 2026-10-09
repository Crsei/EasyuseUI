"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { InputOTP } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function ButtonGroupDemo() {
  const { t } = useSiteI18n()
  const [action, setAction] = useState("")
  return (
    <div className="grid gap-3">
      <ButtonGroup aria-label={t("site.completion.actions")}>
        <Button variant="secondary" onClick={() => setAction("previous")}>
          {t("site.completion.previous")}
        </Button>
        <Button variant="secondary" onClick={() => setAction("next")}>
          {t("site.completion.next")}
        </Button>
        <Button disabled>{t("site.completion.disabled")}</Button>
      </ButtonGroup>
      <output>{action}</output>
    </div>
  )
}
export function InputGroupDemo() {
  const { t } = useSiteI18n()
  const [draft, setDraft] = useState("")
  const [receipt, setReceipt] = useState("")
  return (
    <form
      className="grid max-w-md gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setReceipt(String(new FormData(e.currentTarget).get("draft")))
      }}
    >
      <Label htmlFor="group-draft">{t("site.completion.draft")}</Label>
      <InputGroup>
        <InputGroupAddon aria-hidden="true">@</InputGroupAddon>
        <InputGroupInput
          id="group-draft"
          name="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <InputGroupAddon>
          <Button type="submit" variant="ghost">
            {t("site.completion.read")}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <output>{receipt}</output>
    </form>
  )
}
export function ToggleDemo() {
  const { t } = useSiteI18n()
  const [pressed, setPressed] = useState(false)
  return (
    <div className="flex gap-2">
      <Toggle pressed={pressed} onPressedChange={setPressed}>
        {t("site.completion.bold")}
      </Toggle>
      <Toggle defaultPressed>{t("site.completion.italic")}</Toggle>
      <Toggle disabled>{t("site.completion.disabled")}</Toggle>
    </div>
  )
}
export function ToggleGroupDemo() {
  const { t } = useSiteI18n()
  const [single, setSingle] = useState<string[]>(["bold"])
  const [multi, setMulti] = useState<string[]>([])
  return (
    <div className="grid gap-3">
      <ToggleGroup
        aria-label={t("site.completion.single")}
        value={single}
        onValueChange={setSingle}
      >
        <ToggleGroupItem value="bold">
          {t("site.completion.bold")}
        </ToggleGroupItem>
        <ToggleGroupItem value="italic">
          {t("site.completion.italic")}
        </ToggleGroupItem>
        <ToggleGroupItem value="code" disabled>
          {t("site.completion.disabled")}
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        multiple
        aria-label={t("site.completion.multiple")}
        value={multi}
        onValueChange={setMulti}
      >
        <ToggleGroupItem value="bold">
          {t("site.completion.bold")}
        </ToggleGroupItem>
        <ToggleGroupItem value="italic">
          {t("site.completion.italic")}
        </ToggleGroupItem>
      </ToggleGroup>
      <output>{JSON.stringify({ single, multi })}</output>
    </div>
  )
}
export function InputOTPDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState("")
  const [receipt, setReceipt] = useState("")
  return (
    <form
      className="grid justify-items-start gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setReceipt(String(new FormData(e.currentTarget).get("otp")))
      }}
    >
      <Label htmlFor="demo-otp">{t("site.completion.otp")}</Label>
      <InputOTP
        id="demo-otp"
        name="otp"
        length={6}
        required
        pattern="[0-9]{6}"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <InputOTP disabled aria-label={t("site.completion.disabled")} />
      <InputOTP
        readOnly
        value="123456"
        aria-label={t("site.shadcnForms.readonlySwitch")}
      />
      <Button type="submit">{t("site.completion.read")}</Button>
      <output>{receipt}</output>
    </form>
  )
}
