"use client"
import type { ReactNode, RefObject } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogBody,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n-provider"
import type { WorkbenchViewProps } from "./view-props"
import { SettingsForm } from "./settings-form"
import styles from "./enhancement.module.css"
export function SettingsDialog({
  open,
  onOpenChange,
  finalFocus,
  ...props
}: WorkbenchViewProps & {
  preferences: ReactNode
  open: boolean
  onOpenChange: (value: boolean) => void
  finalFocus: RefObject<HTMLElement | null>
}) {
  const { locale, t } = useI18n()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.settingsDialog} finalFocus={finalFocus}>
        <DialogHeader>
          <DialogTitle>{t("resource.settings")}</DialogTitle>
          <DialogDescription>
            {locale === "en"
              ? "Unapplied configuration is retained when closing this window."
              : "关闭窗口保留未应用配置；“取消修改”可丢弃。"}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <SettingsForm {...props} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
