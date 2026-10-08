import type { CSSProperties } from "react"
import type { DictionaryEntry } from "@/lib/visual-dictionary"
import styles from "./dictionary.module.css"

export function DictionaryPreview({
  entry,
  mini = false,
}: {
  entry: DictionaryEntry
  mini?: boolean
}) {
  const kind = entry.preview
  const lines = (
    <>
      <span />
      <span />
      <span />
    </>
  )
  let content
  if (kind === "color")
    content = (
      <span className={styles.swatches}>
        {[
          "surface",
          "primary",
          "info",
          "success",
          "warning",
          "destructive",
        ].map((token) => (
          <span key={token} style={{ background: `var(--${token})` }} />
        ))}
      </span>
    )
  else if (kind === "type")
    content = (
      <span className={styles.typeSample}>
        <strong>Aa 字体</strong>
        <span>清晰的正文层级</span>
        <small>Metadata · 12px</small>
      </span>
    )
  else if (kind === "spacing")
    content = (
      <span className={styles.spacingSample}>
        {[4, 8, 12, 16, 24].map((value) => (
          <span
            key={value}
            style={{ "--sample-size": `${value}px` } as CSSProperties}
          >
            <i />
            {value}
          </span>
        ))}
      </span>
    )
  else if (kind === "radius")
    content = (
      <span className={styles.radiusSample}>
        {[
          "calc(var(--radius) - 4px)",
          "var(--control-radius)",
          "var(--radius)",
          "var(--pill-radius)",
        ].map((value) => (
          <span key={value} style={{ borderRadius: value }} />
        ))}
      </span>
    )
  else if (
    [
      "shadow",
      "inset",
      "glow",
      "glass",
      "blur",
      "gradient",
      "noise",
      "border",
      "card",
      "shape",
    ].includes(kind)
  )
    content = (
      <span
        className={`${styles.effectSample} ${styles[kind] ?? ""} ${entry.slug === "hard-shadow" ? styles.hardShadow : ""} ${entry.slug === "layered-shadow" ? styles.layeredShadow : ""}`}
      >
        <span>Surface</span>
      </span>
    )
  else if (["pill", "badge", "chip", "button", "choice"].includes(kind))
    content = (
      <span
        className={`${styles.capsules} ${kind === "button" ? styles.buttonSample : ""}`}
      >
        <span>
          {kind === "badge"
            ? "Info"
            : kind === "chip"
              ? "TypeScript"
              : kind === "choice"
                ? "✓ 选项"
                : "Label"}
          {kind === "chip" && <i>×</i>}
        </span>
        <span>{kind === "chip" ? "Selected ✓" : "Neutral"}</span>
      </span>
    )
  else if (kind === "circle" || kind === "avatar")
    content = (
      <span className={styles.avatars}>
        <span>AC</span>
        <span>UI</span>
        <span>AI</span>
      </span>
    )
  else if (kind === "divider")
    content = (
      <span className={styles.dividerSample}>
        <span>Section A</span>
        <i />
        <span>Section B</span>
      </span>
    )
  else if (kind === "tabs" || kind === "navigation")
    content = (
      <span className={styles.tabsSample}>
        <span>Overview</span>
        <span>Activity</span>
        <span>Files</span>
      </span>
    )
  else if (kind === "input" || kind === "command")
    content = (
      <span className={styles.inputSample}>
        {kind === "command" ? "⌕ 搜索命令或选项…" : "输入内容…"}
      </span>
    )
  else if (kind === "tree")
    content = (
      <span className={styles.treeSample}>
        <span>▾ Project</span>
        <span>　▾ Session</span>
        <span>　　Run</span>
      </span>
    )
  else if (kind === "table")
    content = (
      <span className={styles.tableSample}>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i}>{i < 3 ? ["Name", "State", "Time"][i] : "—"}</span>
        ))}
      </span>
    )
  else if (kind === "timeline")
    content = (
      <span className={styles.timelineSample}>
        <span>09:41 · Read file</span>
        <span>09:42 · Run tests</span>
        <span>09:43 · Review</span>
      </span>
    )
  else if (kind === "metadata")
    content = (
      <span className={styles.metadataSample}>
        <span>
          Model <b>Configured</b>
        </span>
        <span>
          Duration <b>01:42</b>
        </span>
        <span>
          Tokens <b>12.4k</b>
        </span>
      </span>
    )
  else if (kind === "tooltip" || kind === "floating" || kind === "disclosure")
    content = (
      <span className={styles.floatingSample}>
        <span>
          {kind === "tooltip"
            ? "短解释"
            : kind === "disclosure"
              ? "▾ Details"
              : "Action"}
        </span>
        <span>{kind === "disclosure" ? "Arguments / Output" : "补充内容"}</span>
      </span>
    )
  else if (kind === "dialog" || kind === "drawer")
    content = (
      <span className={styles.overlaySample} data-drawer={kind === "drawer"}>
        <span>
          <b>Details</b>
          <span>Content</span>
          <i />
        </span>
      </span>
    )
  else if (kind === "layout")
    content = (
      <span className={styles.layoutSample}>
        <span>Nav</span>
        <span>Workspace</span>
        <span>Info</span>
      </span>
    )
  else if (kind === "conversation")
    content = (
      <span className={styles.conversationSample}>
        <span>你 · 查看这个文件</span>
        <span>Agent · 已读取内容</span>
        <i>输入消息…</i>
      </span>
    )
  else if (kind === "progress")
    content = (
      <span className={styles.progressSample}>
        <span />
      </span>
    )
  else if (kind === "spinner")
    content = <span className={styles.spinnerSample} />
  else if (kind === "feedback")
    content = <span className={styles.feedbackSample}>ⓘ 需要关注的信息</span>
  else
    content = (
      <span
        className={
          kind === "skeleton" ? styles.skeletonSample : styles.listSample
        }
      >
        {lines}
      </span>
    )
  return (
    <span className={styles.preview} data-mini={mini} aria-hidden="true">
      {content}
    </span>
  )
}

export function FoundationPreview({ entry }: { entry: DictionaryEntry }) {
  if (
    [
      "shadow",
      "elevation",
      "inset-shadow",
      "hard-shadow",
      "layered-shadow",
      "glow",
    ].includes(entry.slug)
  ) {
    return (
      <>
        <DictionaryPreview entry={entry} />
        <div className={styles.shadowComparison}>
          {[
            { label: "无阴影", hint: "常驻区域", className: styles.noShadow },
            { label: "浮层投影", hint: "共享 token", className: styles.shadow },
            { label: "内阴影", hint: "视觉参考", className: styles.inset },
            { label: "发光", hint: "视觉参考", className: styles.glow },
          ].map((sample) => (
            <div key={sample.label}>
              <span className={`${styles.effectSample} ${sample.className}`}>
                <span>Surface</span>
              </span>
              <strong>{sample.label}</strong>
              <small>{sample.hint}</small>
            </div>
          ))}
        </div>
      </>
    )
  }
  return (
    <div className={styles.foundationPreview}>
      <DictionaryPreview entry={entry} />
    </div>
  )
}
