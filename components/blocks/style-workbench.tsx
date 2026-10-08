"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import { Copy, RotateCcw, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/ui/tag"
import { Chip } from "@/components/ui/chip"
import { DataRegion } from "@/components/ui/data-region"
import { cn } from "@/lib/utils"
import {
  clampStyleNumber,
  colorStyleControls,
  numericStyleControls,
  readStyleBaseline,
  styleCSS,
  styleDeclarations,
  styleDifferences,
  stylePresets,
  styleSections,
  type NumericStyleControl,
  type StyleSection,
  type StyleValues,
} from "@/lib/style-workbench-model"
import styles from "./style-workbench.module.css"

export type StyleWorkbenchProps = {
  initialSection?: StyleSection
  className?: string
}

function NumberControl({
  control,
  value,
  baseline,
  onChange,
}: {
  control: NumericStyleControl
  value: number
  baseline: number
  onChange: (value: number) => void
}) {
  const id = useId()
  const [draft, setDraft] = useState<string>()
  function commit() {
    const number = draft?.trim() ? Number(draft) : NaN
    if (Number.isFinite(number)) onChange(clampStyleNumber(number, control))
    setDraft(undefined)
  }
  return (
    <div className={styles.numberControl}>
      <div>
        <label htmlFor={`${id}-range`}>{control.label}</label>
        <span>
          A: {baseline}
          {control.unit}
        </span>
      </div>
      <div>
        <input
          id={`${id}-range`}
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={value}
          onChange={(event) => {
            setDraft(undefined)
            onChange(Number(event.target.value))
          }}
        />
        <Input
          aria-label={`${control.label}数值`}
          type="number"
          min={control.min}
          max={control.max}
          step={control.step}
          value={draft ?? value}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              commit()
            }
            if (event.key === "Escape") setDraft(undefined)
          }}
        />
        <span>{control.unit}</span>
      </div>
    </div>
  )
}

function PreviewSample({
  label,
  values,
  value,
  selected,
  onValueChange,
  onSelectedChange,
}: {
  label: string
  values: StyleValues
  value: string
  selected: boolean
  onValueChange: (value: string) => void
  onSelectedChange: (selected: boolean) => void
}) {
  const id = useId()
  return (
    <section className={styles.previewPane} aria-label={label}>
      <header>
        <span>{label}</span>
        <span>
          {values.radius}px 圆角 · {values.controlHeight}px 控件
        </span>
      </header>
      <div className={styles.stage}>
        <span className={styles.backdropMark} aria-hidden="true">
          Aa
          <br />
          SURFACE
          <br />
          012345
        </span>
        <div
          className={styles.sample}
          data-style-sample={label.startsWith("A") ? "baseline" : "modified"}
          style={styleDeclarations(values) as CSSProperties}
        >
          <div className={styles.sampleHeading}>
            <span>设计系统检查</span>
            <Tag>样例</Tag>
          </div>
          <p>用相同内容比较边界、密度和阅读感受。修改参数，观察视觉差距。</p>
          <div className={styles.sampleRows}>
            <div>
              <span>基础样式</span>
              <span>12 项</span>
            </div>
            <div>
              <span>组件规范</span>
              <span>已整理</span>
            </div>
          </div>
          <div className={styles.sampleField}>
            <label htmlFor={id}>示例输入</label>
            <Input
              id={id}
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
            />
          </div>
          <div className={styles.sampleActions}>
            <Button
              aria-pressed={selected}
              onClick={() => onSelectedChange(!selected)}
            >
              示例按钮
            </Button>
            <Chip
              label="筛选值"
              selected={selected}
              onSelectedChange={onSelectedChange}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function StyleWorkbench({
  initialSection = "geometry",
  className,
}: StyleWorkbenchProps) {
  const probe = useRef<HTMLDivElement>(null)
  const [themeBaseline, setThemeBaseline] = useState<StyleValues>()
  const [pinnedBaseline, setPinnedBaseline] = useState<StyleValues>()
  const [edits, setEdits] = useState<Partial<StyleValues>>({})
  const [section, setSection] = useState<StyleSection>(initialSection)
  const [retry, setRetry] = useState(0)
  const [readError, setReadError] = useState<string>()
  const [feedback, setFeedback] = useState("")
  const [output, setOutput] = useState<"css" | "json">("css")
  const [sampleValue, setSampleValue] = useState("视觉参数实验")
  const [sampleSelected, setSampleSelected] = useState(false)
  const baseline = pinnedBaseline ?? themeBaseline
  const current = baseline ? { ...baseline, ...edits } : undefined
  const differences =
    baseline && current ? styleDifferences(baseline, current) : []
  const code =
    baseline && current
      ? output === "css"
        ? styleCSS(current)
        : JSON.stringify({ version: 1, baseline, modified: current }, null, 2)
      : ""

  useEffect(() => {
    let frame = 0
    const read = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        try {
          if (!probe.current) return
          const values = readStyleBaseline(probe.current)
          setThemeBaseline((previous) =>
            JSON.stringify(previous) === JSON.stringify(values)
              ? previous
              : values,
          )
          setReadError(undefined)
        } catch (error) {
          setReadError(
            error instanceof Error ? error.message : "当前主题尚未完整加载。",
          )
        }
      })
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [retry])

  function update<Key extends keyof StyleValues>(
    key: Key,
    value: StyleValues[Key],
  ) {
    setEdits((previous) => {
      const next = { ...previous, [key]: value }
      if (baseline?.[key] === value) delete next[key]
      return next
    })
    setFeedback("")
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setFeedback(
        output === "css" ? "已复制 B 的 CSS。" : "已复制 A/B 参数 JSON。",
      )
    } catch {
      setFeedback("无法访问剪贴板，请手动选择下面的代码复制。")
    }
  }
  return (
    <div className={cn(styles.workbench, className)}>
      <div
        ref={probe}
        className={`${styles.sample} ${styles.probe}`}
        aria-hidden="true"
      />
      <DataRegion
        state={readError ? "error" : baseline ? "success" : "loading"}
        hasContent={Boolean(baseline)}
        loadingLabel="正在读取主题基准"
        error={
          readError
            ? {
                category: "validation",
                message: "无法读取样式基准",
                reason: readError,
              }
            : undefined
        }
        onRetry={() => setRetry((value) => value + 1)}
      >
        {baseline && current && (
          <>
            <div className={styles.toolbar}>
              <div>
                <Badge tone="info">A / B</Badge>
                <span>{pinnedBaseline ? "A 已固定" : "A 跟随当前主题"}</span>
                <span>{differences.length} 项差异</span>
              </div>
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setPinnedBaseline({ ...current })
                    setEdits({})
                    setFeedback("已将 B 固定为基准 A。")
                  }}
                >
                  <ArrowLeftRight />B 设为基准 A
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!differences.length}
                  onClick={() => {
                    setEdits({})
                    setFeedback("B 已重置为基准 A。")
                  }}
                >
                  <RotateCcw />
                  重置 B
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPinnedBaseline(undefined)
                    setEdits({})
                    setFeedback("已恢复当前项目主题基准。")
                  }}
                >
                  恢复项目默认
                </Button>
              </div>
            </div>
            <div className={styles.body}>
              <aside className={styles.controls} aria-label="样式参数">
                <nav className={styles.sectionNav} aria-label="参数分类">
                  {styleSections.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={section === item.id}
                      onClick={() => setSection(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <section
                  className={styles.fields}
                  aria-label={`${styleSections.find((item) => item.id === section)?.label}参数`}
                >
                  {section === "shadow" && (
                    <div className={styles.checks}>
                      <label>
                        <input
                          type="checkbox"
                          checked={current.shadowEnabled}
                          onChange={(event) =>
                            update("shadowEnabled", event.target.checked)
                          }
                        />
                        启用阴影
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={current.shadowInset}
                          disabled={!current.shadowEnabled}
                          onChange={(event) =>
                            update("shadowInset", event.target.checked)
                          }
                        />
                        内阴影
                      </label>
                    </div>
                  )}
                  {numericStyleControls
                    .filter((control) => control.section === section)
                    .map((control) => (
                      <NumberControl
                        key={control.key}
                        control={control}
                        value={current[control.key]}
                        baseline={baseline[control.key]}
                        onChange={(value) => update(control.key, value)}
                      />
                    ))}
                  {colorStyleControls
                    .filter((control) => control.section === section)
                    .map((control) => (
                      <label key={control.key} className={styles.colorControl}>
                        <span>{control.label}</span>
                        <Input
                          type="color"
                          aria-label={control.label}
                          value={current[control.key]}
                          onChange={(event) =>
                            update(control.key, event.target.value)
                          }
                        />
                        <code>{current[control.key]}</code>
                      </label>
                    ))}
                </section>
                <section className={styles.presets} aria-label="样式预设">
                  <h3>试试预设</h3>
                  <div>
                    {stylePresets.map((preset) => (
                      <Button
                        key={preset.id}
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEdits(preset.values)
                          setSection(preset.section)
                          setFeedback(`已应用「${preset.name}」到 B。`)
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  <p>预设用于局部实验；触屏控件保留至少44px点击区域。</p>
                </section>
              </aside>
              <div className={styles.results}>
                <div className={styles.comparison}>
                  <PreviewSample
                    label="A · 基准"
                    values={baseline}
                    value={sampleValue}
                    selected={sampleSelected}
                    onValueChange={setSampleValue}
                    onSelectedChange={setSampleSelected}
                  />
                  <PreviewSample
                    label="B · 当前调整"
                    values={current}
                    value={sampleValue}
                    selected={sampleSelected}
                    onValueChange={setSampleValue}
                    onSelectedChange={setSampleSelected}
                  />
                </div>
                <section className={styles.differences} aria-label="参数差异">
                  <h3>
                    参数差异 <span>{differences.length} 项</span>
                  </h3>
                  {differences.length ? (
                    <div className={styles.tableScroll}>
                      <table>
                        <thead>
                          <tr>
                            <th scope="col">参数</th>
                            <th scope="col">A · 基准</th>
                            <th scope="col">B · 当前</th>
                            <th scope="col">差值</th>
                          </tr>
                        </thead>
                        <tbody>
                          {differences.map((item) => (
                            <tr key={item.key}>
                              <th scope="row">{item.label}</th>
                              <td>{item.baseline}</td>
                              <td>{item.current}</td>
                              <td>{item.delta}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>当前 A 与 B 相同。调整左侧参数，观察变化。</p>
                  )}
                </section>
                <section className={styles.export} aria-label="导出样式">
                  <div>
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-pressed={output === "css"}
                        onClick={() => {
                          setOutput("css")
                          setFeedback("")
                        }}
                      >
                        CSS
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-pressed={output === "json"}
                        onClick={() => {
                          setOutput("json")
                          setFeedback("")
                        }}
                      >
                        参数 JSON
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        output === "css" ? "复制 CSS" : "复制参数 JSON"
                      }
                      onClick={copy}
                    >
                      <Copy />
                    </Button>
                  </div>
                  <pre
                    tabIndex={0}
                    aria-label={output === "css" ? "当前 CSS" : "当前参数 JSON"}
                  >
                    <code>{code}</code>
                  </pre>
                </section>
              </div>
            </div>
          </>
        )}
      </DataRegion>
      <p role="status" className={styles.feedback}>
        {feedback}
      </p>
    </div>
  )
}
