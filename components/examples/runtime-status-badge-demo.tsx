import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { runtimeStatuses } from "@/lib/runtime-status"

export function RuntimeStatusBadgeDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      {runtimeStatuses.map((status) => (
        <RuntimeStatusBadge key={status} status={status} />
      ))}
      <RuntimeStatusBadge status="unrecognized" />
    </div>
  )
}
