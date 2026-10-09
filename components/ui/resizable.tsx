"use client"
import { useId, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
export type ResizableHandleProps = {
  value: number
  min: number
  max: number
  onValueChange: (value: number) => void
  label: string
  axis?: "horizontal" | "vertical"
  reverse?: boolean
  step?: number
  controls?: string
  disabled?: boolean
  className?: string
  unstyled?: boolean
}
export function ResizableHandle({
  value,
  min,
  max,
  onValueChange,
  label,
  axis = "horizontal",
  reverse = false,
  step = 8,
  controls,
  disabled,
  className,
  unstyled = false,
}: ResizableHandleProps) {
  const drag = useRef<{
    id: number
    position: number
    value: number
    sign: number
  } | null>(null)
  const lo = Number.isFinite(min) ? min : 0
  const hi = Number.isFinite(max) ? Math.max(lo, max) : Math.max(lo, 1000)
  const current = Number.isFinite(value)
    ? Math.max(lo, Math.min(hi, value))
    : lo
  const increment = Number.isFinite(step) && step > 0 ? step : 8
  const change = (next: number) => {
    if (!disabled) onValueChange(Math.max(lo, Math.min(hi, next)))
  }
  return (
    <div
      role="separator"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-controls={controls}
      aria-disabled={disabled || undefined}
      aria-orientation={axis === "horizontal" ? "vertical" : "horizontal"}
      aria-valuemin={lo}
      aria-valuemax={hi}
      aria-valuenow={current}
      className={cn(
        "shrink-0 touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !unstyled &&
          (axis === "horizontal"
            ? "w-1 cursor-col-resize bg-border [@media(pointer:coarse)]:w-11"
            : "h-1 cursor-row-resize bg-border [@media(pointer:coarse)]:h-11"),
        className,
      )}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0 || drag.current) return
        event.preventDefault()
        event.currentTarget.focus()
        event.currentTarget.setPointerCapture(event.pointerId)
        const rtl =
          axis === "horizontal" &&
          getComputedStyle(event.currentTarget).direction === "rtl"
        drag.current = {
          id: event.pointerId,
          position: axis === "horizontal" ? event.clientX : event.clientY,
          value: current,
          sign: (reverse ? -1 : 1) * (rtl ? -1 : 1),
        }
      }}
      onPointerMove={(event) => {
        if (!drag.current || drag.current.id !== event.pointerId) return
        const position = axis === "horizontal" ? event.clientX : event.clientY
        change(
          drag.current.value +
            (position - drag.current.position) * drag.current.sign,
        )
      }}
      onPointerUp={(event) => {
        if (drag.current?.id !== event.pointerId) return
        drag.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={(event) => {
        if (drag.current?.id === event.pointerId) drag.current = null
      }}
      onLostPointerCapture={(event) => {
        if (drag.current?.id === event.pointerId) drag.current = null
      }}
      onKeyDown={(event) => {
        const rtl =
          axis === "horizontal" &&
          getComputedStyle(event.currentTarget).direction === "rtl"
        const sign = (reverse ? -1 : 1) * (rtl ? -1 : 1)
        if (event.key === "Home") change(lo)
        else if (event.key === "End") change(hi)
        else if (
          event.key === (axis === "horizontal" ? "ArrowLeft" : "ArrowUp")
        )
          change(current - increment * sign)
        else if (
          event.key === (axis === "horizontal" ? "ArrowRight" : "ArrowDown")
        )
          change(current + increment * sign)
        else return
        event.preventDefault()
      }}
    />
  )
}
export type ResizableProps = {
  first: ReactNode
  second: ReactNode
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  axis?: "horizontal" | "vertical"
  disabled?: boolean
  className?: string
}
export function Resizable({
  first,
  second,
  label,
  value: provided,
  defaultValue = 256,
  onValueChange,
  min = 160,
  max = 480,
  axis = "horizontal",
  disabled,
  className,
}: ResizableProps) {
  const id = useId()
  const [internal, setInternal] = useState(defaultValue)
  const lo = Number.isFinite(min) ? Math.max(0, min) : 160
  const hi = Number.isFinite(max) ? Math.max(lo, max) : Math.max(lo, 480)
  const requested = provided ?? internal
  const value = Number.isFinite(requested)
    ? Math.max(lo, Math.min(hi, requested))
    : lo
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 overflow-auto",
        axis === "vertical" && "flex-col",
        className,
      )}
    >
      <div
        id={id}
        className="min-h-0 min-w-0 overflow-auto"
        style={{ flex: `0 0 ${value}px` }}
      >
        {first}
      </div>
      <ResizableHandle
        label={label}
        controls={id}
        axis={axis}
        value={value}
        min={lo}
        max={hi}
        disabled={disabled}
        onValueChange={(next) => {
          if (provided === undefined) setInternal(next)
          onValueChange?.(next)
        }}
      />
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{second}</div>
    </div>
  )
}
