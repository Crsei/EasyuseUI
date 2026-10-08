"use client"
import { Children, isValidElement } from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/lib/utils"
import { useThemePortalContainer } from "./theme-boundary"

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value
export const SelectItemText = SelectPrimitive.ItemText
export const SelectGroup = SelectPrimitive.Group
export const SelectGroupLabel = SelectPrimitive.GroupLabel
export const SelectSeparator = SelectPrimitive.Separator

export function SelectContent({
  className,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  ...props
}: Omit<SelectPrimitive.Popup.Props, "className"> & {
  className?: string
  side?: SelectPrimitive.Positioner.Props["side"]
  align?: SelectPrimitive.Positioner.Props["align"]
  sideOffset?: number
}) {
  const container = useThemePortalContainer()
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-[70]"
      >
        <SelectPrimitive.Popup
          {...props}
          className={cn(
            "z-[70] max-h-[var(--available-height)] max-w-[var(--available-width)] overflow-auto min-w-40 rounded-lg border bg-surface p-1 text-foreground shadow-[var(--shadow-floating)] outline-none",
            className,
          )}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}
export function SelectItem({
  className,
  children,
  ...props
}: Omit<SelectPrimitive.Item.Props, "className"> & { className?: string }) {
  return (
    <SelectPrimitive.Item
      {...props}
      className={cn(
        "flex min-h-8 cursor-default items-center gap-2 rounded-sm px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring data-highlighted:bg-surface-hover data-highlighted:text-foreground data-disabled:opacity-50 [@media(pointer:coarse)]:min-h-11",
        className,
      )}
    >
      {Children.toArray(children).some(
        (child) =>
          isValidElement(child) && child.type === SelectPrimitive.ItemText,
      ) ? (
        children
      ) : (
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      )}
      <SelectPrimitive.ItemIndicator className="ml-auto" aria-hidden="true">
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
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
export function SelectTrigger({
  className,
  ...props
}: Omit<SelectPrimitive.Trigger.Props, "className"> & { className?: string }) {
  return (
    <SelectPrimitive.Trigger
      {...props}
      className={cn(
        "h-control rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring data-disabled:opacity-50 [@media(pointer:coarse)]:min-h-11",
        className,
      )}
    />
  )
}
