import { Tag } from "@/components/ui/tag"

export function TagDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Tag leading="#">Backend</Tag>
        <Tag>TypeScript</Tag>
        <Tag size="sm">本地示例</Tag>
      </div>
      <p className="text-xs leading-5 text-text-secondary">
        Tag 展示分类，不进入 Tab 顺序。筛选或删除使用 Chip。
      </p>
    </div>
  )
}
