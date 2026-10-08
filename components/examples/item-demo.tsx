"use client"

import { useState } from "react"
import { FileText, MoreHorizontal } from "lucide-react"
import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"

export function ItemDemo() {
  const [selected, setSelected] = useState("spec")
  const [message, setMessage] = useState("")
  return (
    <div className="w-full space-y-2">
      <Item
        title="Component Specification"
        description="双行 Item · 56px"
        leading={<FileText />}
        selected={selected === "spec"}
        onSelect={() => setSelected("spec")}
        trailing={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="查看规范操作"
            onClick={() => setMessage("这是独立的尾部操作，不会触发行选择。")}
          >
            <MoreHorizontal />
          </Button>
        }
      />
      <Item
        title="Design Rules"
        leading={<FileText />}
        selected={selected === "rules"}
        onSelect={() => setSelected("rules")}
      />
      <Item title="静态信息，不接收点击" density="compact" />
      <Item
        title="不可选择"
        onSelect={() => setSelected("disabled")}
        disabled
      />
      <Item
        title="正在读取对象"
        loading
        onSelect={() => setSelected("loading")}
      />
      <Item
        title="保留已读取内容"
        error="请求错误：演示读取中断。已有内容保留，请重新读取。"
        onSelect={() => setSelected("error")}
      />
      <p role="status" className="text-xs text-muted-foreground">
        {message || `当前选择：${selected}`}
      </p>
    </div>
  )
}
