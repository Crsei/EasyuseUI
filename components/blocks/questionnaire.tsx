"use client"
import { useEffect, useId, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
export type QuestionnaireOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}
export type QuestionnaireQuestion = {
  id: string
  title: string
  description?: string
  required?: boolean
  disabled?: boolean
} & (
  | { type: "text"; placeholder?: string }
  | { type: "single" | "multiple"; options: QuestionnaireOption[] }
)
export type QuestionnaireAnswers = Record<string, string | string[] | null>
export type QuestionnaireProps = {
  questions: QuestionnaireQuestion[]
  value: QuestionnaireAnswers
  onValueChange: (answers: QuestionnaireAnswers) => void
  activeId?: string
  defaultActiveId?: string
  onActiveIdChange?: (id: string) => void
  onSubmit?: (answers: QuestionnaireAnswers) => void
  busy?: boolean
  error?: string
  className?: string
}
function answered(
  question: QuestionnaireQuestion,
  value: QuestionnaireAnswers[string],
) {
  if (question.type === "text")
    return typeof value === "string" && value.trim().length > 0
  const choices = question.options
    .filter((o) => !o.disabled)
    .map((o) => o.value)
  return question.type === "single"
    ? typeof value === "string" && choices.includes(value)
    : Array.isArray(value) && value.some((v) => choices.includes(v))
}
export function Questionnaire({
  questions,
  value,
  onValueChange,
  activeId,
  defaultActiveId,
  onActiveIdChange,
  onSubmit,
  busy = false,
  error,
  className,
}: QuestionnaireProps) {
  const { t } = useI18n()
  const generated = useId()
  const [localId, setLocalId] = useState(defaultActiveId ?? questions[0]?.id)
  const [invalid, setInvalid] = useState(false)
  const title = useRef<HTMLLegendElement>(null)
  const requestedFocus = useRef(false)
  const requested = activeId ?? localId
  const index = Math.max(
    0,
    questions.findIndex((q) => q.id === requested),
  )
  const question = questions[index]
  useEffect(() => {
    if (requestedFocus.current) {
      title.current?.focus()
      requestedFocus.current = false
    }
  }, [question?.id])
  if (!question) return <p role="status">{t("questionnaire.empty")}</p>
  const changeStep = (next: number) => {
    const q = questions[next]
    if (!q) return
    setInvalid(false)
    requestedFocus.current = true
    if (activeId === undefined) setLocalId(q.id)
    onActiveIdChange?.(q.id)
  }
  const setAnswer = (answer: string | string[] | null) => {
    setInvalid(false)
    onValueChange({ ...value, [question.id]: answer })
  }
  const next = () => {
    if (
      question.required &&
      !question.disabled &&
      !answered(question, value[question.id])
    ) {
      setInvalid(true)
      return
    }
    changeStep(index + 1)
  }
  const descriptionId = question.description
    ? `${generated}-description`
    : undefined
  const errorId = invalid || error ? `${generated}-error` : undefined
  const described =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined
  const locked = busy || question.disabled
  return (
    <form
      className={cn("grid max-w-lg gap-3", className)}
      aria-busy={busy || undefined}
      onSubmit={(event) => {
        event.preventDefault()
        if (busy || !onSubmit) return
        const missing = questions.findIndex(
          (q) => q.required && !q.disabled && !answered(q, value[q.id]),
        )
        if (missing >= 0) {
          changeStep(missing)
          setInvalid(true)
          return
        }
        onSubmit({ ...value })
      }}
    >
      <p role="status" className="text-xs tabular-nums text-muted-foreground">
        {t("questionnaire.step", {
          current: index + 1,
          total: questions.length,
        })}
      </p>
      <fieldset disabled={locked} className="grid gap-2" key={question.id}>
        <legend
          ref={title}
          tabIndex={-1}
          id={`${generated}-title`}
          className="mb-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {question.title}
          {question.required && <span aria-hidden="true"> *</span>}
        </legend>
        {question.description && (
          <p id={descriptionId} className="text-[13px] text-muted-foreground">
            {question.description}
          </p>
        )}
        {question.type === "text" ? (
          <Textarea
            aria-labelledby={`${generated}-title`}
            aria-describedby={described}
            aria-invalid={invalid || !!error || undefined}
            value={
              typeof value[question.id] === "string"
                ? (value[question.id] as string)
                : ""
            }
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder}
          />
        ) : question.type === "single" ? (
          <RadioGroup
            aria-labelledby={`${generated}-title`}
            aria-describedby={described}
            aria-invalid={invalid || !!error || undefined}
            value={
              typeof value[question.id] === "string"
                ? (value[question.id] as string)
                : null
            }
            onValueChange={setAnswer}
            disabled={locked}
          >
            <>
              {question.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <RadioGroupItem
                    value={option.value}
                    disabled={option.disabled}
                  />
                  <span>
                    {option.label}
                    {option.description && (
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </>
          </RadioGroup>
        ) : (
          <div
            role="group"
            aria-labelledby={`${generated}-title`}
            aria-describedby={described}
          >
            {question.options.map((option) => {
              const selected = Array.isArray(value[question.id])
                ? (value[question.id] as string[])
                : []
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <Checkbox
                    disabled={locked || option.disabled}
                    checked={selected.includes(option.value)}
                    onCheckedChange={(checked) =>
                      setAnswer(
                        checked
                          ? [...selected, option.value]
                          : selected.filter((v) => v !== option.value),
                      )
                    }
                  />
                  <span>
                    {option.label}
                    {option.description && (
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        )}
        {(invalid || error) && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error ?? t("questionnaire.required")}
          </p>
        )}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={busy || index === 0}
          onClick={() => changeStep(index - 1)}
        >
          {t("questionnaire.back")}
        </Button>
        {!question.required && index < questions.length - 1 && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setAnswer(null)
              changeStep(index + 1)
            }}
          >
            {t("questionnaire.skip")}
          </Button>
        )}
        {index < questions.length - 1 ? (
          <Button type="button" disabled={busy} onClick={next}>
            {t("questionnaire.next")}
          </Button>
        ) : (
          onSubmit && (
            <Button type="submit" loading={busy}>
              {t("questionnaire.submit")}
            </Button>
          )
        )}
      </div>
    </form>
  )
}
