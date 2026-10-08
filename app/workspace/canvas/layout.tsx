import type { ReactNode } from "react"
import { CanvasPageShell } from "@/components/site/canvas-page-shell"

export default function CanvasLayout({ children }: { children: ReactNode }) {
  return <CanvasPageShell>{children}</CanvasPageShell>
}
