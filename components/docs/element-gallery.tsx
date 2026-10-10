"use client"

import Link from "next/link"
import { useEffect, useId, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { DataRegion } from "@/components/ui/data-region"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"
import type { DataState } from "@/lib/runtime-status"
import styles from "./element-gallery.module.css"

export type GalleryModule = {
  id: string
  title: string
  group: string
  groupId: string
  preview: ReactNode
  summary: string
  source: string
  states: string
  contract: string
  wide?: boolean
}

export type GalleryTechnology = {
  name: string
  status: string
  purpose: string
}

export function ElementGallery({
  title,
  description,
  fixtureNotice,
  controls,
  modules,
  technologies,
  selected,
  onSelect,
  navigationToken,
  view,
  onViewChange,
  dataState,
  onRetry,
  en,
}: {
  title: string
  description: string
  fixtureNotice: string
  controls: ReactNode
  modules: GalleryModule[]
  technologies: GalleryTechnology[]
  selected: string
  onSelect: (id: string) => void
  navigationToken: number
  view: string
  onViewChange: (view: string) => void
  dataState: DataState
  onRetry: () => void
  en: boolean
}) {
  const scope = useId()
  const targetId = (id: string) => `${scope}-module-${id}`

  function focusModule(id: string) {
    const target = document.getElementById(targetId(id))
    target?.scrollIntoView({ block: "start", behavior: "instant" })
    target?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (navigationToken === 0 || view !== "preview") return
    const frame = requestAnimationFrame(() => focusModule(selected))
    return () => cancelAnimationFrame(frame)
    // Heading IDs are stable for the lifetime of this gallery instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, navigationToken, selected])

  const groups = [...new Set(modules.map((module) => module.groupId))]
  return (
    <main className={styles.root} data-element-gallery>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{en ? "Development gallery" : "开发元素画廊"}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <nav className={styles.links} aria-label={en ? "Related examples" : "相关示例"}>
          <Link href="/examples/agent-workbench/regions/reference/">
            {en ? "State lab" : "精细状态实验室"}
          </Link>
          <Link href="/examples/agent-workbench/app/?template=coding&page=session">
            {en ? "Assembled workbench" : "组合工作台"}
          </Link>
        </nav>
      </header>
      <div className={styles.controls}>{controls}</div>
      <p className={styles.notice}>{fixtureNotice}</p>
      <Tabs value={view} onValueChange={(value) => onViewChange(String(value))}>
        <TabsList className={styles.tabs} aria-label={en ? "Gallery views" : "画廊视图"}>
          <TabsTab value="preview">{en ? "Presentation" : "展示效果"}</TabsTab>
          <TabsTab value="specification">{en ? "Design specification" : "设计规范"}</TabsTab>
          <TabsTab value="technology">{en ? "Technology" : "技术栈"}</TabsTab>
        </TabsList>
        <TabsPanel value="preview" keepMounted className={styles.panel}>
          <DataRegion
            state={dataState}
            hasContent={dataState === "success" || dataState === "partial" || dataState === "error"}
            error={{
              category: "request",
              message: en ? "Fixture refresh failed; previous snapshot retained." : "fixture 刷新失败；保留原快照。",
              reason: en ? "Explicit fixture source" : "显式 fixture 来源",
            }}
            onRetry={onRetry}
            emptyTitle={en ? "No source records" : "来源暂无记录"}
            emptyDescription={en ? "Choose success to load the fixture." : "切换 success 读取 fixture。"}
          >
            <span />
          </DataRegion>
          <div hidden={dataState === "loading" || dataState === "empty"}>
          <div className={styles.layout}>
            <nav className={styles.moduleNav} aria-label={en ? "Gallery modules" : "画廊模块"}>
              {groups.map((groupId) => (
                <div key={groupId} className={styles.navGroup}>
                  <span>{modules.find((module) => module.groupId === groupId)?.group}</span>
                  {modules.filter((module) => module.groupId === groupId).map((module) => (
                    <Button
                      key={module.id}
                      variant="ghost"
                      aria-current={selected === module.id ? "location" : undefined}
                      onClick={() => onSelect(module.id)}
                    >
                      {module.id} · {module.title}
                    </Button>
                  ))}
                </div>
              ))}
            </nav>
            <div className={styles.groups}>
              {groups.map((groupId) => (
                <section key={groupId} aria-label={modules.find((module) => module.groupId === groupId)?.group} className={styles.group}>
                  <h2>{modules.find((module) => module.groupId === groupId)?.group}</h2>
                  <div className={styles.grid}>
                    {modules.filter((module) => module.groupId === groupId).map((module) => (
                      <article
                        key={module.id}
                        className={`${styles.module} ${module.wide ? styles.wide : ""}`}
                        data-gallery-module={module.id}
                        data-selected={selected === module.id}
                      >
                        <div className={styles.moduleHeading}>
                          <h3 id={targetId(module.id)} tabIndex={-1}>
                            <span>{module.id}</span> {module.title}
                          </h3>
                          <p>{module.summary}</p>
                        </div>
                        <div className={styles.preview} data-preview-viewport={module.id}>
                          {module.preview}
                        </div>
                        <p className={styles.states}>{module.states}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
          </div>
        </TabsPanel>
        <TabsPanel value="specification" keepMounted className={styles.panel}>
          <p className={styles.lead}>
            {en
              ? "Each module follows the Agent Workspace V2 declarations and the shared component contract. The state lab exposes the detailed variants."
              : "各模块遵循 Agent Workspace V2 声明与共享组件合同；精细实验室提供逐项状态变体。"}
          </p>
          <div className={styles.specList}>
            {modules.map((module) => (
              <section key={module.id} className={styles.specRow}>
                <h2>{module.id} · {module.title}</h2>
                <p>{module.contract}</p>
                <p className={styles.muted}>{en ? "Source" : "组件来源"}：{module.source}</p>
                <p className={styles.muted}>{en ? "States" : "状态"}：{module.states}</p>
              </section>
            ))}
          </div>
          <Link href="/examples/agent-workbench/regions/reference/">
            {en ? "Open detailed state lab" : "打开精细状态实验室"}
          </Link>
        </TabsPanel>
        <TabsPanel value="technology" keepMounted className={styles.panel}>
          <p className={styles.lead}>
            {en
              ? "This fixture uses local state. Runtime, permissions, persistence, Git and PTY are supplied by consuming services."
              : "本页使用本地 fixture。运行、权限、持久化、Git 和 PTY 由消费服务提供。"}
          </p>
          <div className={styles.techList}>
            {technologies.map((technology) => (
              <section key={technology.name} className={styles.techRow}>
                <h2>{technology.name}</h2>
                <span>{technology.status}</span>
                <p>{technology.purpose}</p>
              </section>
            ))}
          </div>
        </TabsPanel>
      </Tabs>
    </main>
  )
}
