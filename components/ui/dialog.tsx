"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({
  className,
  children,
  ...props
}: Omit<DialogPrimitive.Popup.Props, "className"> & { className?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Popup
        {...props}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-xl outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
          className,
        )}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="关闭弹窗"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [@media(pointer:coarse)]:size-11"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export function DialogTitle({
  className,
  ...props
}: Omit<DialogPrimitive.Title.Props, "className"> & { className?: string }) {
  return (
    <DialogPrimitive.Title
      {...props}
      className={cn("pr-8 text-lg font-semibold tracking-tight", className)}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: Omit<DialogPrimitive.Description.Props, "className"> & {
  className?: string
}) {
  return (
    <DialogPrimitive.Description
      {...props}
      className={cn("mt-2 text-sm leading-6 text-muted-foreground", className)}
    />
  )
}
