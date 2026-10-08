import { CanvasWorkspaceDemo } from "@/components/examples/canvas-workspace-demo"
import { notFound } from "next/navigation"

export const dynamicParams = false
export function generateStaticParams() {
  return [50, 200, 500, 1000].map((size) => ({ size: String(size) }))
}
export default async function CanvasBenchmark({
  params,
}: {
  params: Promise<{ size: string }>
}) {
  const size = Number((await params).size)
  if (size !== 50 && size !== 200 && size !== 500 && size !== 1000) notFound()
  return (
    <div style={{ height: 800, minHeight: 0 }}>
      <CanvasWorkspaceDemo stressSize={size} layout="fill" />
    </div>
  )
}
