"use client"
import { useI18n } from "@/lib/i18n-provider"
import { createTranslator } from "@/lib/i18n-core"
import { siteCrmMessages } from "@/lib/site-crm-messages"
export function useCrmI18n() {
  const context = useI18n()
  return { ...context, t: createTranslator(context.locale, siteCrmMessages) }
}
export type CrmTranslator = ReturnType<typeof useCrmI18n>["t"]
