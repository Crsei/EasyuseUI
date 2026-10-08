"use client"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { cn } from "@/lib/utils"
import { useThemePortalContainer } from "./theme-boundary"

export const Combobox = ComboboxPrimitive.Root
export const ComboboxList = ComboboxPrimitive.List
export const ComboboxEmpty = ComboboxPrimitive.Empty
export const ComboboxTrigger = ComboboxPrimitive.Trigger

export function ComboboxContent({
  className,
  children,
  ...props
}: Omit<ComboboxPrimitive.Popup.Props, "className"> & { className?: string }) {
  const container = useThemePortalContainer()
  return (
    <ComboboxPrimitive.Portal container={container}>
      <ComboboxPrimitive.Positioner sideOffset={6} className="z-[60]">
        <ComboboxPrimitive.Popup
          {...props}
          className={cn(
            "z-[60] min-w-40 rounded-lg border bg-surface p-1 text-foreground shadow-[var(--shadow-floating)] outline-none",
            className,
          )}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}
export function ComboboxItem({
  className,
  children,
  ...props
}: Omit<ComboboxPrimitive.Item.Props, "className"> & { className?: string }) {
  return (
    <ComboboxPrimitive.Item
      {...props}
      className={cn(
        "flex min-h-8 cursor-default items-center gap-2 rounded-sm px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring data-highlighted:bg-surface-hover data-highlighted:text-foreground data-disabled:opacity-50 [@media(pointer:coarse)]:min-h-11",
        className,
      )}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator className="ml-auto" aria-hidden="true">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m3 8 3 3 7-7" />
        </svg>
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}
export function ComboboxInput({
  className,
  ...props
}: Omit<ComboboxPrimitive.Input.Props, "className"> & { className?: string }) {
  return (
    <ComboboxPrimitive.Input
      {...props}
      className={cn(
        "h-control rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring data-disabled:opacity-50 [@media(pointer:coarse)]:min-h-11",
        className,
      )}
    />
  )
}
