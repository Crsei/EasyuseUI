import Link from "next/link"
import { ArrowDown, ArrowUpRight, Mouse } from "lucide-react"
import { ScrollPlayground } from "@/components/blocks/scroll-playground"
import { ScrollReadingProgress } from "@/components/site/scroll-reading-progress"
import styles from "./scroll.module.css"

export const metadata = {
  title: "滚动实验室",
  description:
    "亲手体验 Scroll-triggered、Scroll-linked、Parallax、Sticky、Scroll Snap 和 Horizontal Scroll 六种滚动交互。",
}

const patterns = [
  ["triggered", "Scroll-triggered"],
  ["linked", "Scroll-linked"],
  ["parallax", "Parallax"],
  ["sticky", "Sticky"],
  ["snap", "Scroll Snap"],
  ["horizontal", "Horizontal Scroll"],
]

export default function ScrollPage() {
  return (
    <main id="main-content" className={styles.page}>
      <ScrollReadingProgress />
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>
            <span /> INTERACTION LAB / 001
          </p>
          <h1>
            让滚动，
            <br />
            <span>有点意思。</span>
          </h1>
          <p className={styles.intro}>
            同一个滚轮，六种不同的回应。
            <br />
            从轻轻淡入，到横向展开，亲手试试滚动的可能。
          </p>
          <div className={styles.heroActions}>
            <a href="#scroll-triggered" className={styles.start}>
              开始探索 <ArrowDown size={15} />
            </a>
            <Link href="/docs/scroll-playground" className={styles.source}>
              获取源码 <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.orbit} />
          <span className={styles.artLabel}>THE ART OF SCROLLING</span>
          <div className={styles.artCardOne}>
            <span>01 / TRIGGER</span>
            <b>hello.</b>
            <i>↗</i>
          </div>
          <div className={styles.artCardTwo}>
            <span>02 / FOLLOW</span>
            <div>
              <i />
              <i />
              <i />
            </div>
            <b>
              go with
              <br />
              the flow.
            </b>
          </div>
          <div className={styles.artPill}>
            <Mouse size={14} /> a little scroll, a little magic
          </div>
          <span className={styles.artStar}>✳</span>
        </div>
      </section>

      <div className={styles.labBar}>
        <div>
          <span className={styles.liveDot} />
          <span>六种交互，六个现场</span>
          <span className={styles.count}>06 EXPERIMENTS</span>
        </div>
        <p>
          <Mouse size={13} aria-hidden="true" /> 将鼠标移入演示区滚动 ·
          触屏可直接滑动
        </p>
      </div>
      <nav aria-label="滚动效果导航" className={styles.patternNav}>
        {patterns.map(([id, label], index) => (
          <a key={id} href={`#scroll-${id}`}>
            <span>0{index + 1}</span>
            {label}
            <ArrowDown size={12} aria-hidden="true" />
          </a>
        ))}
      </nav>
      <ScrollPlayground idPrefix="scroll" />
      <div className={styles.closing}>
        <span className={styles.closingMark} aria-hidden="true">
          ↗
        </span>
        <div>
          <h2>把喜欢的交互，带进你的项目。</h2>
          <p>原生滚动与浏览器 API，源码可以直接安装和修改。</p>
        </div>
        <Link href="/docs/scroll-playground">
          查看用法与源码 <ArrowUpRight size={15} />
        </Link>
      </div>
      <p className={styles.accessibilityNote}>
        键盘操作：Tab 聚焦演示区，再用方向键或 Page Down
        滚动。开启系统「减少动态效果」后，淡入与视差会简化，横向卡片改为直接左右滑动。
      </p>
    </main>
  )
}
