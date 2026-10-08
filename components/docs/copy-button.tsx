"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CopyButton({ value }: { value: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setStatus("copied")
    } catch {
      setStatus("failed")
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus("idle"), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span role="status" className="text-xs text-muted-foreground">
        {status === "copied"
          ? "已复制"
          : status === "failed"
            ? "复制失败，请手动选择代码"
            : ""}
      </span>
      <Button variant="ghost" size="icon" aria-label="复制代码" onClick={copy}>
        {status === "copied" ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
