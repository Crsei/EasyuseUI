import type { ReactNode } from "react"
import { AppProviders } from "@/providers"
import { DesktopFrame } from "@/components/desktop-frame"
import "./globals.css"
export const metadata = { title: "Agent Workspace", description: "EasyuseUI Agent Workspace independent application" }
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="zh-CN" suppressHydrationWarning><body className="h-dvh min-h-0 overflow-hidden"><AppProviders><DesktopFrame>{children}</DesktopFrame></AppProviders></body></html>
}
