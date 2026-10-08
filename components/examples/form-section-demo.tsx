"use client"
import { FormSection } from "@/components/blocks/form-section"
import { FieldDemo } from "./field-demo"
import { useSiteI18n } from "@/components/site/site-i18n"
export function FormSectionDemo() {
  const { t } = useSiteI18n()
  return (
    <FormSection
      title={t("site.commonComponents.form")}
      description={t("site.commonComponents.description")}
    >
      <FieldDemo />
    </FormSection>
  )
}
