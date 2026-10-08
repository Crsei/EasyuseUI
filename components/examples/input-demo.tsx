"use client"

import { useId, useState } from "react"
import { Input } from "@/components/ui/input"

export function InputDemo() {
  const id = useId()
  const [name, setName] = useState("")
  const invalid = name.length > 0 && name.trim().length < 2

  return (
    <div className="w-full max-w-sm space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        项目名称
      </label>
      <Input
        id={id}
        placeholder="例如：我的工作台"
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={`${id}-hint`}
      />
      <p
        id={`${id}-hint`}
        className={`text-xs ${invalid ? "text-destructive" : "text-muted-foreground"}`}
      >
        {invalid
          ? "名称至少需要 2 个字符。"
          : name
            ? `即将创建：${name}`
            : "一个清楚的名字，方便之后找到它。"}
      </p>
    </div>
  )
}
