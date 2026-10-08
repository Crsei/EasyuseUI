import { SiteText } from "@/components/site/site-i18n"
import { Tag } from "@/components/ui/tag"

export function TagDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Tag leading="#">Backend</Tag>
        <Tag>TypeScript</Tag>
        <Tag size="sm">
          <SiteText messageKey="site.localExample" />
        </Tag>
      </div>
      <p className="text-xs leading-5 text-text-secondary">
        <SiteText messageKey="site.tagDisplaysACategoryAndStaysOutOfThe" />
      </p>
    </div>
  )
}
