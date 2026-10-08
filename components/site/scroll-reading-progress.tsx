"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useEffect, useState } from "react"

export function ScrollReadingProgress() {
  const { t } = useSiteI18n()

  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const distance =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(
        distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0,
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(document.documentElement)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  return (
    <div
      role="progressbar"
      aria-label={t("site.pageReadingProgress")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-primary"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
