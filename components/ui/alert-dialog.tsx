"use client"
import { AlertDialog as Base } from "@base-ui/react/alert-dialog"
import { cn } from "@/lib/utils"
import { useThemePortalContainer } from "./theme-boundary"
export const AlertDialog = Base.Root
export const AlertDialogTrigger = Base.Trigger
export const AlertDialogCancel = Base.Close
export const AlertDialogTitle = Base.Title
export const AlertDialogDescription = Base.Description
/** Confirmation actions are ordinary caller buttons; resolution does not close or imply success. */
export function AlertDialogContent({
  className,
  ...props
}: Omit<Base.Popup.Props, "className"> & { className?: string }) {
  const container = useThemePortalContainer()
  return (
    <Base.Portal container={container}>
      <Base.Backdrop className="fixed inset-0 z-[70] bg-black/40" />
      <Base.Popup
        {...props}
        className={cn(
          "fixed left-1/2 top-1/2 z-[70] grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-3 rounded-panel border bg-surface p-4 text-sm text-foreground shadow-[var(--shadow-floating)] outline-none",
          className,
        )}
      />
    </Base.Portal>
  )
}
