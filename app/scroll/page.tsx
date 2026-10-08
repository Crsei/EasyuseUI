import { SiteText, SiteElement } from "@/components/site/site-i18n"
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
            <SiteText messageKey="site.giveScrolling" />
            <br />
            <span>
              <SiteText messageKey="site.aLittleCharacter" />
            </span>
          </h1>
          <p className={styles.intro}>
            <SiteText messageKey="site.oneWheelSixDifferentResponses" />
            <br />
            <SiteText messageKey="site.fromGentleFadesToHorizontalMovementExploreThePossibilities" />
          </p>
          <div className={styles.heroActions}>
            <a href="#scroll-triggered" className={styles.start}>
              <SiteText messageKey="site.startExploring" />
              <ArrowDown size={15} />
            </a>
            <Link href="/docs/scroll-playground" className={styles.source}>
              <SiteText messageKey="site.getTheSource" />
              <ArrowUpRight size={14} />
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
          <span>
            <SiteText messageKey="site.sixInteractionsSixLiveDemos" />
          </span>
          <span className={styles.count}>06 EXPERIMENTS</span>
        </div>
        <p>
          <Mouse size={13} aria-hidden="true" />{" "}
          <SiteText messageKey="site.scrollInsideADemoSwipeDirectlyOnTouchScreens" />
        </p>
      </div>
      <SiteElement
        as="nav"
        textProps={{ "aria-label": { key: "site.scrollEffectNavigation" } }}
        className={styles.patternNav}
      >
        {patterns.map(([id, label], index) => (
          <a key={id} href={`#scroll-${id}`}>
            <span>0{index + 1}</span>
            {label}
            <ArrowDown size={12} aria-hidden="true" />
          </a>
        ))}
      </SiteElement>
      <ScrollPlayground idPrefix="scroll" />
      <div className={styles.closing}>
        <span className={styles.closingMark} aria-hidden="true">
          ↗
        </span>
        <div>
          <h2>
            <SiteText messageKey="site.bringTheInteractionsYouLikeIntoYourProject" />
          </h2>
          <p>
            <SiteText messageKey="site.nativeScrollingAndBrowserApisWithSourceYouCan" />
          </p>
        </div>
        <Link href="/docs/scroll-playground">
          <SiteText messageKey="site.viewUsageAndSource" />
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <p className={styles.accessibilityNote}>
        <SiteText messageKey="site.keyboardTabIntoADemoThenUseArrowKeys" />
      </p>
    </main>
  )
}
