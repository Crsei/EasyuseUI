"use client"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"

export function ChipDemo() {
  const [selected, setSelected] = useState(false)
  const [languageSelected, setLanguageSelected] = useState(false)
  const [removed, setRemoved] = useState(false)
  const reset = useRef<HTMLButtonElement>(null)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          label="仅看活跃"
          selected={selected}
          onSelectedChange={setSelected}
        />
        {!removed && (
          <Chip
            label="TypeScript"
            selected={languageSelected}
            onSelectedChange={setLanguageSelected}
            onRemove={() => {
              setRemoved(true)
              reset.current?.focus()
            }}
          />
        )}
        <Chip
          label="不可用"
          disabled
          onSelectedChange={() => {}}
          onRemove={() => {}}
        />
        <Chip
          label="保存中"
          busy
          onSelectedChange={() => {}}
          onRemove={() => {}}
        />
      </div>
      <p role="status" className="text-xs leading-5 text-text-secondary">
        {removed
          ? "已移除 TypeScript。"
          : selected
            ? "已选择活跃筛选。"
            : "尚未选择活跃筛选。"}{" "}
        本地交互示例。
      </p>
      <Button
        ref={reset}
        size="sm"
        variant="secondary"
        onClick={() => {
          setSelected(false)
          setLanguageSelected(false)
          setRemoved(false)
        }}
      >
        重置示例
      </Button>
    </div>
  )
}
