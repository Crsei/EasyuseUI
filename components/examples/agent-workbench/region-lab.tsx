"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { useI18n } from "@/lib/i18n-provider"
import { regionDefinitions } from "./showcase-model"
import styles from "./region-lab.module.css"

export function RegionLab({
  region,
  scenario,
  narrow,
  onRegionChange,
  navigation,
  controls,
  preview,
  layoutHref,
}: {
  region: string
  scenario: string
  narrow: boolean
  onRegionChange: (id: string) => void
  navigation: ReactNode
  controls: ReactNode
  preview: ReactNode
  layoutHref: string
}) {
  const { locale } = useI18n()
  const en = locale === "en"
  const definition =
    regionDefinitions.find((r) => r.id === region) ?? regionDefinitions[0]
  const [controlsOpen, setControlsOpen] = useState(true)
  const label = en ? "Scenario controls" : "场景与回执"
  return (
    <main
      className={styles.root}
      data-region-lab
      data-region={region}
      data-scenario={scenario}
    >
      <div className={styles.navigation}>
        {navigation}
        <span className={styles.meta}>
          {en ? "Local interactive example" : "本地交互示例"}
        </span>
      </div>
      <div className={styles.mobileToolbar}>
        <label>
          {en ? "Region laboratory" : "区域实验室"}
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
          >
            {regionDefinitions.map((r, i) => (
              <option key={r.id} value={r.id}>
                R{i + 1} {r.title[locale]}
              </option>
            ))}
          </select>
        </label>
        <Sheet>
          <SheetTrigger render={<Button variant="secondary" size="sm" />}>
            {en ? "Example settings" : "示例设置"}
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle>{label}</SheetTitle>
            {controls}
          </SheetContent>
        </Sheet>
      </div>
      <div className={styles.grid} data-controls-open={controlsOpen}>
        <nav
          className={styles.directory}
          aria-label={en ? "Region laboratory" : "区域实验室"}
        >
          {regionDefinitions.map((r, i) => (
            <Button
              key={r.id}
              variant="ghost"
              aria-current={region === r.id ? "page" : undefined}
              onClick={() => onRegionChange(r.id)}
            >
              R{i + 1} {r.title[locale]}
            </Button>
          ))}
        </nav>
        <section
          className={styles.preview}
          aria-labelledby="region-preview-title"
        >
          <header className={styles.previewHeader}>
            <h1 id="region-preview-title">{definition.title[locale]}</h1>
            <Link prefetch={false} href={layoutHref}>
              {en ? "View in a composed layout" : "在组合布局查看"}
            </Link>
          </header>
          <div
            className={styles.previewViewport}
            data-preview-container
            data-narrow={narrow}
          >
            {preview}
          </div>
        </section>
        <aside className={styles.scenarios} aria-label={label}>
          <div className={styles.controlHeader}>
            <h2 hidden={!controlsOpen}>{label}</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                en
                  ? controlsOpen
                    ? "Collapse scenario controls"
                    : "Expand scenario controls"
                  : controlsOpen
                    ? "收起场景控制"
                    : "展开场景控制"
              }
              aria-expanded={controlsOpen}
              onClick={() => setControlsOpen(!controlsOpen)}
            >
              {controlsOpen ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </Button>
          </div>
          <div hidden={!controlsOpen} className={styles.controlBody}>
            {controls}
          </div>
        </aside>
      </div>
      <footer
        className={styles.contracts}
        aria-label={en ? "Components and data contracts" : "组件与数据合同"}
      >
        <details>
          <summary>{en ? "Component mapping" : "组件映射"}</summary>
          <ul>
            {definition.components.map((slug) => (
              <li key={slug}>
                <Link prefetch={false} href={`/docs/${slug}/`}>
                  {slug}
                </Link>
              </li>
            ))}
          </ul>
        </details>
        <details>
          <summary>{en ? "Data contracts" : "数据合同"}</summary>
          <p>{definition.contract[locale]}</p>
          <p>
            {en
              ? "Changing a fixture case prepares this session's local source snapshot. Unsaved message text and other sessions are retained. Refresh resets business data; navigation parameters contain no drafts or credentials."
              : "切换示例场景会准备当前会话的本地来源快照，保留未发送正文和其他会话。刷新重置业务数据；导航参数不包含草稿或凭据。"}
          </p>
        </details>
        <details>
          <summary>{en ? "Acceptance checklist" : "验收说明"}</summary>
          <p>{definition.acceptance[locale]}</p>
          <Link prefetch={false} href="/blog/agent-workbench-showcase/">
            {en ? "Screenshots and verification" : "截图与验证记录"}
          </Link>
        </details>
      </footer>
    </main>
  )
}
