"use client"
import { useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { agentAppHref, independentExampleApps } from "@/lib/independent-example-apps"
import { buttonVariants } from "@/components/ui/button"

// Read only public navigation fields after hydration; no credentials/storage/transport.
function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener)
  return () => window.removeEventListener("popstate", listener)
}
export function IndependentExampleEntry() {
  const pathname = usePathname()
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "")
  const { locale } = useI18n()
  const en = locale === "en"
  const app = independentExampleApps["agent-workspace"]
  const href = agentAppHref(app.origin, pathname, new URLSearchParams(search))
  return href ? (
    <a className={buttonVariants({ variant: "secondary", size: "sm" })} href={href} data-independent-app="agent-workspace">
      {en ? "Open independent Agent Workspace" : "打开独立 Agent Workspace"}
    </a>
  ) : <span role="status" data-independent-app-unconfigured>{en ? "Example address not configured" : "尚未配置示例地址"}</span>
}
