import { Badge } from "@/components/ui/badge"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"

export function BadgeDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>默认</Badge>
        <Badge tone="info" shape="pill">
          只读信息
        </Badge>
        <Badge tone="success">校验通过</Badge>
        <Badge tone="warning">需要关注</Badge>
        <Badge tone="danger">校验失败</Badge>
        <Badge tone="agent" size="sm">
          AI
        </Badge>
      </div>
      <p className="text-xs leading-5 text-text-secondary">
        Badge 不执行动作。真实运行状态继续使用统一组件：
      </p>
      <RuntimeStatusBadge status="running" />
    </div>
  )
}
