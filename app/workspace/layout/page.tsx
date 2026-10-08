import { ControlledWorkspaceDemo } from "@/components/examples/controlled-workspace-demo"
import { SiteText } from "@/components/site/site-i18n"
export const metadata = { title: "受控布局示例" }
export default function LayoutExamplePage() {
  return (
    <main id="main-content" className="mx-auto w-full px-5 py-8">
      <h1 className="mb-6 text-xl font-semibold">
        <SiteText messageKey="site.optimization.controlledLayoutDemo" />
      </h1>
      <ControlledWorkspaceDemo />
    </main>
  )
}
