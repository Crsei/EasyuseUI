"use client"

import { useEffect, useState } from "react"
import { TaskPanel, type Task } from "@/components/blocks/task-panel"

const initialTasks: Task[] = [
  {
    id: "design",
    title: "整理设计规范",
    description: "颜色、间距和深浅主题已准备好",
    status: "completed",
  },
  {
    id: "components",
    title: "构建基础组件",
    description: "让每一种状态都有合适的反馈",
    status: "completed",
  },
  {
    id: "publish",
    title: "发布组件清单",
    description: "模拟发布失败，点击重试继续",
    status: "failed",
  },
]

export function TaskPanelDemo() {
  const [tasks, setTasks] = useState(initialTasks)
  const runningId = tasks.find((task) => task.status === "running")?.id

  useEffect(() => {
    if (!runningId) return
    const timer = setTimeout(
      () =>
        setTasks((current) =>
          current.map((task) =>
            task.id === runningId
              ? {
                  ...task,
                  status: "completed",
                  description: "组件清单已准备就绪",
                }
              : task,
          ),
        ),
      1000,
    )
    return () => clearTimeout(timer)
  }, [runningId])

  return (
    <TaskPanel
      title="从想法到好用"
      tasks={tasks}
      onRetry={(id) =>
        setTasks((current) =>
          current.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: "running",
                  description: "正在重新生成组件清单…",
                }
              : task,
          ),
        )
      }
    />
  )
}
