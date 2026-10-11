import type { ReactNode } from "react"
import styles from "./desktop-frame.module.css"

/** Keeps the application's desktop canvas stable while the window is resized. */
export function DesktopFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewport} data-desktop-viewport>
      <div className={styles.canvas} data-desktop-canvas>
        {children}
      </div>
    </div>
  )
}
