import { SiteText } from "@/components/site/site-i18n"
import { Badge } from "@/components/ui/badge"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"

export function BadgeDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          <SiteText messageKey="site.default2" />
        </Badge>
        <Badge tone="info" shape="pill">
          <SiteText messageKey="site.readOnlyInformation" />
        </Badge>
        <Badge tone="success">
          <SiteText messageKey="site.validationPassed" />
        </Badge>
        <Badge tone="warning">
          <SiteText messageKey="site.needsAttention" />
        </Badge>
        <Badge tone="danger">
          <SiteText messageKey="site.validationFailed" />
        </Badge>
        <Badge tone="agent" size="sm">
          AI
        </Badge>
      </div>
      <p className="text-xs leading-5 text-text-secondary">
        <SiteText messageKey="site.badgeDoesNotExecuteActionsRuntimeStatesContinueTo" />
      </p>
      <RuntimeStatusBadge status="running" />
    </div>
  )
}
