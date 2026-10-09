"use client"
import type { RefObject } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { FormSection } from "@/components/blocks/form-section"
import { ImageUpload } from "@/components/blocks/image-upload"
import { owners, SEGMENTS, STAGES } from "./fixtures"
import type { CompanyDraft } from "./model"
import { draftErrors } from "./selectors"
import { CrmSelect } from "./controls"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export type FormErrors = ReturnType<typeof draftErrors> & {
  submit?: "createError"
}
export function NewCompany({
  open,
  onOpenChange,
  draft,
  onDraft,
  errors,
  onSubmit,
  pending,
  finalFocus,
  nameFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: CompanyDraft
  onDraft: (draft: CompanyDraft) => void
  errors: FormErrors
  onSubmit: () => void
  pending: boolean
  finalFocus: () => HTMLElement | null
  nameFocus: RefObject<HTMLInputElement | null>
}) {
  const { t } = useCrmI18n()
  const field = (
    key:
      | "name"
      | "openDeals"
      | "pipelineValue"
      | "winProbability"
      | "date"
      | "interaction",
    label: string,
    required = true,
  ) => (
    <Field
      label={label}
      required={required}
      error={errors[key] ? t(`crm.${errors[key]}`) : undefined}
    >
      {(props) => (
        <Input
          {...props}
          ref={key === "name" ? nameFocus : undefined}
          data-crm-field={key}
          value={draft[key]}
          maxLength={
            key === "name" ? 120 : key === "interaction" ? 80 : undefined
          }
          type={key === "date" ? "date" : "text"}
          inputMode={
            ["openDeals", "pipelineValue", "winProbability"].includes(key)
              ? "decimal"
              : undefined
          }
          onChange={(event) => onDraft({ ...draft, [key]: event.target.value })}
        />
      )}
    </Field>
  )
  const select = (
    key: "owner" | "segment" | "stage",
    label: string,
    options: readonly string[],
  ) => (
    <Field
      label={label}
      required
      error={errors[key] ? t(`crm.${errors[key]}`) : undefined}
    >
      {(props) => (
        <CrmSelect
          id={props.id}
          described={props["aria-describedby"]}
          invalid={props["aria-invalid"]}
          label={label}
          value={draft[key]}
          options={options.map((value) => ({ value, label: value }))}
          onChange={(value) => onDraft({ ...draft, [key]: value })}
        />
      )}
    </Field>
  )
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) onOpenChange(value)
      }}
    >
      <DialogContent
        className={styles.newDialog}
        finalFocus={finalFocus}
        initialFocus={nameFocus}
      >
        <header className={styles.dialogHeading}>
          <DialogTitle>{t("crm.newCompany")}</DialogTitle>
          <DialogDescription>{t("crm.localOnly")}</DialogDescription>
        </header>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
          className={styles.newForm}
        >
          <div className={styles.formScroll}>
            <FormSection
              title={t("crm.basicInfo")}
              disabled={pending}
              className={styles.formSection}
            >
              <ImageUpload
                className={styles.logoUpload}
                label={t("crm.logo")}
                value={draft.logo}
                onValueChange={(logo) => onDraft({ ...draft, logo })}
                accept="image/png,image/jpeg,image/webp"
                maxBytes={2 * 1024 * 1024}
                disabled={pending}
              />
              <p className={styles.logoHint}>{t("crm.logoDescription")}</p>
              {errors.logo && <p role="alert">{t(`crm.${errors.logo}`)}</p>}
              {field("name", t("crm.companyName"))}
              <div className={styles.formColumns}>
                {select("segment", t("crm.segment"), SEGMENTS)}
                {select("stage", t("crm.stage"), STAGES)}
              </div>
            </FormSection>
            <FormSection
              title={t("crm.dealInfo")}
              disabled={pending}
              className={styles.formSection}
            >
              {select(
                "owner",
                t("crm.owner"),
                owners.map((p) => p.name),
              )}
              <div className={styles.formColumns}>
                {field("pipelineValue", t("crm.pipelineValue"))}
                {field("openDeals", t("crm.openDeals"))}
              </div>
              <div className={styles.probabilityInput}>
                {field("winProbability", t("crm.winProbability"))}
              </div>
              <Slider
                label={t("crm.winProbability")}
                value={Number(draft.winProbability)}
                onChange={(value) =>
                  onDraft({ ...draft, winProbability: String(value) })
                }
                valueText={(v) => `${v}%`}
              />
            </FormSection>
            <FormSection
              title={t("crm.activityInfo")}
              disabled={pending}
              className={styles.formSection}
            >
              <div className={styles.formColumns}>
                {field("date", t("crm.lastInteraction"))}
                {field("interaction", t("crm.interaction"))}
              </div>
            </FormSection>
            {Object.keys(errors).length > 0 && (
              <p role="alert" className={styles.formError}>
                {t(errors.submit ? "crm.createError" : "crm.validationError")}
              </p>
            )}
          </div>
          <footer className={styles.formFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {t("crm.cancel")}
            </Button>
            <Button type="submit" loading={pending}>
              {t(pending ? "crm.creating" : "crm.create")}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  )
}
