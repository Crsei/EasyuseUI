"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useState } from "react"
import { Tree, moveTreeNode, type TreeNode } from "@/components/ui/tree"
const initial: TreeNode[] = [
  {
    id: "idea",
    label: "Idea / 工作台设计",
    children: [
      {
        id: "session",
        label: "Session / 组件实现",
        status: "running",
        children: [
          { id: "run-1", label: "Run / 检查规范", status: "completed" },
          { id: "run-2", label: "Run / 实现组件", status: "running" },
        ],
      },
    ],
  },
  {
    id: "inbox",
    label: "Inbox",
    children: [{ id: "unorganized", label: "未归类 Session", status: "idle" }],
  },
  { id: "locked", label: "受保护的节点", disabled: true },
  {
    id: "lazy",
    label: "尚未加载的分支",
    hasChildren: true,
    childrenState: "error",
    childrenError: "本地演示读取失败，可以重试。",
  },
]
export function TreeDemo() {
  const { t } = useSiteI18n()

  const [nodes, setNodes] = useState(initial)
  const [selected, setSelected] = useState("session")
  return (
    <div>
      <p className="mb-3 text-xs text-text-secondary">
        {t("site.localHierarchyNavigateExpandSpaceSelectsDragOrUse")}
      </p>
      <Tree
        label={t("site.sessionHierarchyDemo")}
        nodes={nodes}
        selectedId={selected}
        onSelect={(node) => setSelected(node.id)}
        defaultExpandedIds={["idea", "session", "inbox"]}
        onMove={(move) => setNodes((current) => moveTreeNode(current, move))}
        onLoadChildren={(node) =>
          setNodes((current) =>
            current.map((entry) =>
              entry.id === node.id
                ? {
                    ...entry,
                    childrenState: "success",
                    children: [
                      {
                        id: "loaded-run",
                        label: t("site.loadedRun"),
                        status: "completed",
                      },
                    ],
                  }
                : entry,
            ),
          )
        }
      />
    </div>
  )
}
