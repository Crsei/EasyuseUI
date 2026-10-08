"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CanvasNodeDefinition } from "@/lib/canvas-model"
import { cn } from "@/lib/utils"
import styles from "./canvas-controls.module.css"

export type NodePaletteProps = {
  definitions: CanvasNodeDefinition[]
  onAdd: (definition: CanvasNodeDefinition) => void
  readOnly?: boolean
  recentTypes?: string[]
  className?: string
}
export function NodePalette({
  definitions,
  onAdd,
  readOnly,
  className,
  recentTypes = [],
}: NodePaletteProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const visible = definitions.filter(
    (item) =>
      (!category || item.category === category) &&
      `${item.label} ${item.type} ${item.category}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  return (
    <section className={cn(styles.palette, className)} aria-label="节点目录">
      <label className={styles.field}>
        <span>
          <Search size={14} />
          搜索节点类型
        </span>
        <Input
          aria-label="搜索节点类型"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="名称或类型"
        />
      </label>
      <label className={styles.field}>
        节点分类
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">全部分类</option>
          {[...new Set(definitions.map((item) => item.category))].map(
            (value) => (
              <option key={value}>{value}</option>
            ),
          )}
        </select>
      </label>
      {recentTypes.length > 0 && !query && !category && (
        <div className={styles.actions} aria-label="最近使用节点">
          <span className={styles.muted}>最近使用</span>
          {recentTypes.map((type) => {
            const definition = definitions.find((def) => def.type === type)
            return definition ? (
              <Button
                key={type}
                size="sm"
                variant="outline"
                disabled={readOnly}
                onClick={() => onAdd(definition)}
              >
                最近：{definition.label}
              </Button>
            ) : null
          })}
        </div>
      )}
      <ul className={styles.list}>
        {visible.map((definition) => (
          <li key={definition.type}>
            <Button
              variant="ghost"
              className={styles.paletteItem}
              disabled={readOnly}
              aria-label={`添加 ${definition.label}`}
              draggable={!readOnly}
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "application/easyuseui-node",
                  definition.type,
                )
                event.dataTransfer.effectAllowed = "copy"
              }}
              onClick={() => onAdd(definition)}
            >
              {definition.icon ?? <Plus size={16} />}
              <span>
                {definition.label}
                <small>{definition.type}</small>
              </span>
              <Plus size={14} />
            </Button>
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <p role="status" className={styles.muted}>
          没有匹配的节点类型。尝试其他名称或分类。
        </p>
      )}
      {readOnly && <p className={styles.muted}>只读画布仍可浏览节点目录。</p>}
    </section>
  )
}
