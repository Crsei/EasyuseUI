"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Attachment } from "@/components/ui/attachment"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Bubble,
  BubbleContent,
  BubbleAttribution,
} from "@/components/ui/bubble"
import {
  Questionnaire,
  type QuestionnaireAnswers,
} from "@/components/blocks/questionnaire"
import { Button } from "@/components/ui/button"
export function AttachmentDemo() {
  const { t } = useSiteI18n()
  const [present, setPresent] = useState(true)
  const [opened, setOpened] = useState(false)
  return (
    <div className="grid w-full max-w-md gap-3">
      {present ? (
        <Attachment
          name={t("site.completion.attachment")}
          description="2 KiB · text/plain"
          onOpen={() => setOpened(true)}
          onRemove={() => setPresent(false)}
        />
      ) : (
        <Button variant="secondary" onClick={() => setPresent(true)}>
          {t("site.completion.back")}
        </Button>
      )}
      <Attachment name="pending.txt" status="unknown" onRemove={() => {}} />
      <Attachment name="upload.txt" status="uploading" onRemove={() => {}} />
      <Attachment
        name="error.txt"
        status="error"
        error={t("site.completion.error")}
      />
      <output>{opened ? "opened" : ""}</output>
    </div>
  )
}
export function MarkerDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="grid w-full gap-3">
      <p className="text-sm">{t("site.completion.content")}</p>
      <Marker variant="separator">
        <MarkerContent>2026-10-09</MarkerContent>
      </Marker>
      <p className="text-sm">{t("site.completion.hint")}</p>
    </div>
  )
}
export function BubbleDemo() {
  const { t } = useSiteI18n()
  return (
    <figure className="grid gap-2">
      <Bubble>
        <BubbleContent>{t("site.completion.content")}</BubbleContent>
        <BubbleAttribution>README.md:12</BubbleAttribution>
      </Bubble>
      <figcaption className="text-xs text-muted-foreground">
        {t("site.completion.hint")}
      </figcaption>
    </figure>
  )
}
export function QuestionnaireDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState<QuestionnaireAnswers>({})
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="grid gap-3">
      <Questionnaire
        questions={[
          {
            id: "mode",
            type: "single",
            title: t("site.completion.single"),
            required: true,
            options: [
              { value: "manual", label: t("site.shadcnForms.manual") },
              { value: "automatic", label: t("site.shadcnForms.automatic") },
              {
                value: "locked",
                label: t("site.completion.disabled"),
                disabled: true,
              },
            ],
          },
          {
            id: "features",
            type: "multiple",
            title: t("site.completion.question"),
            options: [
              { value: "bold", label: t("site.completion.bold") },
              { value: "italic", label: t("site.completion.italic") },
            ],
          },
          { id: "notes", type: "text", title: t("site.completion.answer") },
        ]}
        value={value}
        onValueChange={setValue}
        onSubmit={() => setSubmitted(true)}
        busy={submitted}
      />
      <output data-answers>{JSON.stringify(value)}</output>
      {submitted && <p role="status">{t("site.completion.pending")}</p>}
    </div>
  )
}
