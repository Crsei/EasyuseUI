"use client"

import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DialogDemo() {
  const id = useId()
  const [name, setName] = useState("")
  const [created, setCreated] = useState("")

  return (
    <div className="flex flex-col items-center gap-4">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          创建项目
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>创建一个新项目</DialogTitle>
          <DialogDescription>
            给项目取个名字。这里的操作仅用于组件演示。
          </DialogDescription>
          <div className="my-6 space-y-2">
            <label htmlFor={id} className="text-sm font-medium">
              项目名称
            </label>
            <Input
              id={id}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="我的新项目"
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="ghost" />}>取消</DialogClose>
            <DialogClose
              disabled={!name.trim()}
              render={<Button />}
              onClick={() => setCreated(name.trim())}
            >
              确认创建
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      <p role="status" className="text-xs text-muted-foreground">
        {created
          ? `演示项目「${created}」已创建。`
          : "支持键盘操作、Escape 关闭和焦点恢复。"}
      </p>
    </div>
  )
}
