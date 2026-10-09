import type { ReactNode } from "react"
import { WorkbenchExampleProvider } from "@/components/examples/agent-workbench/provider"
export default function Layout({ children }: { children: ReactNode }) {
  return <WorkbenchExampleProvider>{children}</WorkbenchExampleProvider>
}
