"use client"
import { useThemePortalContainer } from "./theme-boundary"

import type { ReactElement } from "react"
import { Tooltip } from "@base-ui/react/tooltip"

// Keep interactive tooltip handling separate from server-safe buttonVariants.
export function ButtonTooltip({
  label,
  children,
}: {
  label: string
  children: ReactElement
}) {
  const portalContainer = useThemePortalContainer()

  return (
    <Tooltip.Root
      onOpenChange={(_open, details) => {
        if (details.reason === "escape-key") details.allowPropagation()
      }}
    >
      <Tooltip.Trigger render={children} delay={300} />
      <Tooltip.Portal container={portalContainer}>
        <Tooltip.Positioner sideOffset={8} className="z-[70]">
          <Tooltip.Popup
            role="tooltip"
            className="rounded-md border bg-surface px-2 py-1 text-xs text-foreground shadow-[var(--shadow-floating)]"
          >
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
