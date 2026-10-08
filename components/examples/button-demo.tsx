"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle")
  const [selected, setSelected] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  function save() {
    setStatus("loading")
    timer.current = setTimeout(() => setStatus("saved"), 800)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button loading={status === "loading"} onClick={save}>
          {status === "loading"
            ? "保存中…"
            : status === "saved"
              ? "已保存，重新保存"
              : "保存更改"}
        </Button>
        <Button variant="outline">次要操作</Button>
        <Button variant="ghost">轻量操作</Button>
        <Button disabled>不可用</Button>
      </div>
      <div
        aria-label="按钮尺寸与选中状态"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <Button size="sm" variant="secondary">
          小号 28
        </Button>
        <Button variant="secondary">标准 32</Button>
        <Button size="lg" variant="secondary">
          大号 36
        </Button>
        <Button
          variant="ghost"
          aria-pressed={selected}
          onClick={() => setSelected(!selected)}
        >
          切换选中状态
        </Button>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {status === "saved"
          ? "演示设置已保存。"
          : "点击保存，体验加载与禁用状态。"}
      </p>
    </div>
  )
}
