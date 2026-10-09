"use client"
import { useState } from "react"
import { Tree, type TreeNode } from "@/components/ui/tree"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataRegion } from "@/components/ui/data-region"
import { useI18n } from "@/lib/i18n-provider"
import type { ResourceSnapshot } from "@/lib/workbench-resource-model"
import styles from "./enhancement.module.css"
export function FileNavigation({
  resources,
  selectedId,
  onOpen,
  onPin,
}: {
  resources: readonly ResourceSnapshot[]
  selectedId?: string
  onOpen: (resource: ResourceSnapshot) => void
  onPin: (resource: ResourceSnapshot) => void
}) {
  const { locale, t } = useI18n(),
    en = locale === "en"
  const [search, setSearch] = useState("")
  const filtered = resources.filter((resource) =>
    resource.path.toLowerCase().includes(search.toLowerCase()),
  )
  const nodes: TreeNode[] = []
  for (const resource of filtered) {
    const folder = resource.path.split("/").slice(0, -1).join("/") || "/"
    let parent = nodes.find((node) => node.id === `folder:${folder}`)
    if (!parent) {
      parent = { id: `folder:${folder}`, label: folder, children: [] }
      nodes.push(parent)
    }
    parent.children!.push({
      id: resource.resourceId,
      label: resource.name,
      metadata: resource.revision,
    })
  }
  const selected = resources.find(
    (resource) => resource.resourceId === selectedId,
  )
  return (
    <div className={styles.fileNavigation}>
      <h2>{t("workbench.files")}</h2>
      <Input
        aria-label={en ? "Search project files" : "搜索项目文件"}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <p className={styles.meta}>
        {en
          ? "Local fixture project files; select to preview, activate to pin"
          : "本地 fixture 项目文件；选择预览，激活固定标签"}
      </p>
      <DataRegion
        state={filtered.length ? "success" : "empty"}
        hasContent={filtered.length > 0}
      >
        <Tree
          label={en ? "Project files" : "项目文件"}
          nodes={nodes}
          defaultExpandedIds={nodes.map((node) => node.id)}
          selectedId={selectedId}
          onSelect={(node) => {
            const resource = resources.find((r) => r.resourceId === node.id)
            if (resource) onOpen(resource)
          }}
          onActivate={(node) => {
            const resource = resources.find((r) => r.resourceId === node.id)
            if (resource) onPin(resource)
          }}
        />
      </DataRegion>
      {selected && (
        <Button
          variant="secondary"
          onClick={() => onPin(selected)}
          data-navigation-close
        >
          {t("resource.pin")}
        </Button>
      )}
    </div>
  )
}
