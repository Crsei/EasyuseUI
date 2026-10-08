"use client"
import type { CSSProperties, ComponentProps } from "react"
import { Dialog as Base } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { Button } from "./button"
import { useThemePortalContainer } from "./theme-boundary"
import { useI18n } from "@/lib/i18n-provider"
import { cn } from "@/lib/utils"
import styles from "./sheet.module.css"
export const Sheet = Base.Root
export const SheetTrigger = Base.Trigger
export const SheetClose = Base.Close
export const SheetTitle = Base.Title
export const SheetDescription = Base.Description
export type SheetContentProps = Omit<
  Base.Popup.Props,
  "className" | "style"
> & {
  className?: string
  style?: CSSProperties
  side?: "left" | "right" | "bottom"
  size?: number
}
export function SheetContent({
  side = "right",
  size = 352,
  className,
  children,
  ...props
}: SheetContentProps) {
  const container = useThemePortalContainer()
  const { t } = useI18n()
  return (
    <Base.Portal container={container}>
      <Base.Backdrop className={styles.backdrop} />
      <Base.Popup
        {...props}
        data-side={side}
        className={cn(styles.content, className)}
        style={
          {
            "--sheet-size": `${Number.isFinite(size) ? Math.max(200, size) : 352}px`,
            ...props.style,
          } as CSSProperties
        }
      >
        {children}
        <Base.Close
          render={
            <Button
              size="icon"
              variant="ghost"
              className={styles.close}
              aria-label={t("dialog.closeDialog")}
            />
          }
        >
          <X size={16} />
        </Base.Close>
      </Base.Popup>
    </Base.Portal>
  )
}
export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn(styles.header, className)} />
}
export function SheetBody({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn(styles.body, className)} />
}
export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn(styles.footer, className)} />
}
