"use client"
import { useId, useState } from "react"
import { DataRegion } from "@/components/ui/data-region"
import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import type { DataState } from "@/lib/runtime-status"
export function DataRegionDemo() {
  const id = useId()
  const [state, setState] = useState<DataState>("success")
  return (
    <div className="space-y-4">
      <label htmlFor={id} className="text-xs">
        数据状态{" "}
      </label>
      <select
        id={id}
        value={state}
        onChange={(event) => setState(event.target.value as DataState)}
        className="h-8 max-w-full rounded-md border bg-surface px-2 text-xs"
      >
        {["loading", "empty", "partial", "error", "success"].map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <DataRegion
        state={state}
        hasContent={state === "error"}
        error={{
          category: "network",
          message: "刷新失败",
          reason: "演示连接不可用。",
        }}
        updatedAt="16:42:08"
        onRetry={() => setState("success")}
        onLoadMore={() => setState("success")}
        emptyDescription="尚未创建 Session，可以恢复本地演示数据。"
        emptyAction={
          <Button onClick={() => setState("success")}>恢复数据</Button>
        }
      >
        <Item
          title="已读取的 Session"
          description="刷新失败仍然可见 · 本地演示"
        />
      </DataRegion>
    </div>
  )
}
