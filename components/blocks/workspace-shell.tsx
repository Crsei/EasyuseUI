"use client"

import { Dialog } from "@base-ui/react/dialog"
import { PanelLeftClose, PanelLeftOpen, PanelRight, X } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import styles from "./workspace-shell.module.css"

export type WorkspaceShellProps = {
  title: ReactNode
  sidebar: ReactNode
  children: ReactNode
  toolbar?: ReactNode
  inspector?: ReactNode
  inspectorTitle?: ReactNode
  inspectorFooter?: ReactNode
  bottomPanel?: ReactNode
  bottomPanelResizable?: boolean
  bottomPanelCollapsed?: boolean
  className?: string
}

export function WorkspaceShell({
  title,
  sidebar,
  children,
  toolbar,
  inspector,
  inspectorTitle = "Inspector",
  inspectorFooter,
  bottomPanel,
  bottomPanelResizable = false,
  bottomPanelCollapsed = false,
  className,
}: WorkspaceShellProps) {
  const ref = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; width: number } | null>(null)
  const [wide, setWide] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [inspectorWidth, setInspectorWidth] = useState<number | null>(null)
  const [bottomHeight, setBottomHeight] = useState(240)
  const bottomDrag = useRef<{ y: number; height: number } | null>(null)
  const [limits, setLimits] = useState({ min: 300, max: 360, initial: 320 })

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => {
      const isWide = entry.contentRect.width >= 1280
      setWide(isWide)
      if (isWide) setOverlayOpen(false)
      if (ref.current) {
        const css = getComputedStyle(ref.current)
        setLimits({
          min:
            Number.parseFloat(
              css.getPropertyValue("--workspace-inspector-min"),
            ) || 300,
          max:
            Number.parseFloat(
              css.getPropertyValue("--workspace-inspector-max"),
            ) || 360,
          initial:
            Number.parseFloat(
              css.getPropertyValue("--workspace-inspector-width"),
            ) || 320,
        })
      }
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  function resize(width: number) {
    const { min, max } = limits
    setInspectorWidth(Math.min(max, Math.max(min, width)))
  }
  const docked = wide && !inspectorCollapsed && inspector !== undefined
  const panelBody = <div className={styles.inspectorBody}>{inspector}</div>
  return (
    <div
      ref={ref}
      className={cn(styles.shell, className)}
      data-sidebar-collapsed={sidebarCollapsed}
      style={
        inspectorWidth === null
          ? undefined
          : ({
              "--inspector-current-width": `${inspectorWidth}px`,
            } as CSSProperties)
      }
    >
      <header className={styles.header}>
        <Button
          variant="ghost"
          size="icon"
          className={styles.sidebarToggle}
          aria-label={sidebarCollapsed ? "展开侧栏" : "折叠侧栏"}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
        <div className={styles.title}>{title}</div>
        {inspector !== undefined && (
          <Button
            ref={openerRef}
            variant="ghost"
            size="icon"
            aria-label={docked ? "收起 Inspector" : "打开 Inspector"}
            aria-expanded={wide ? docked : overlayOpen}
            onClick={() =>
              wide
                ? setInspectorCollapsed(!inspectorCollapsed)
                : setOverlayOpen(true)
            }
          >
            <PanelRight />
          </Button>
        )}
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="工作区导航">
          {sidebar}
        </aside>
        <div className={styles.main}>
          {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
          <div className={styles.content}>{children}</div>
        </div>
        {docked && (
          <aside
            ref={panelRef}
            className={styles.inspector}
            aria-label="Inspector"
            data-inspector-docked
          >
            <div
              role="separator"
              tabIndex={0}
              aria-label="调整 Inspector 宽度"
              aria-orientation="vertical"
              aria-valuemin={limits.min}
              aria-valuemax={limits.max}
              aria-valuenow={inspectorWidth ?? limits.initial}
              className={styles.resizeHandle}
              onPointerDown={(event) => {
                event.currentTarget.focus()
                event.currentTarget.setPointerCapture(event.pointerId)
                drag.current = {
                  x: event.clientX,
                  width: panelRef.current?.getBoundingClientRect().width ?? 320,
                }
              }}
              onPointerMove={(event) => {
                if (drag.current)
                  resize(drag.current.width + drag.current.x - event.clientX)
              }}
              onPointerUp={(event) => {
                drag.current = null
                event.currentTarget.releasePointerCapture(event.pointerId)
              }}
              onPointerCancel={() => {
                drag.current = null
              }}
              onKeyDown={(event) => {
                const current =
                  panelRef.current?.getBoundingClientRect().width ?? 320
                const { min, max } = limits
                if (event.key === "ArrowLeft") resize(current + 8)
                else if (event.key === "ArrowRight") resize(current - 8)
                else if (event.key === "Home") resize(min)
                else if (event.key === "End") resize(max)
                else return
                event.preventDefault()
              }}
            />
            <div className={styles.inspectorHeader}>
              <h2>{inspectorTitle}</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="关闭 Inspector"
                onClick={() => {
                  setInspectorCollapsed(true)
                  openerRef.current?.focus()
                }}
              >
                <X />
              </Button>
            </div>
            {panelBody}
            {inspectorFooter && (
              <div className={styles.inspectorFooter}>{inspectorFooter}</div>
            )}
          </aside>
        )}
      </div>
      {bottomPanel && (
        <section
          className={styles.bottom}
          aria-label="底部工作面板"
          data-collapsed={bottomPanelCollapsed}
          style={
            bottomPanelResizable && !bottomPanelCollapsed
              ? { height: bottomHeight }
              : undefined
          }
        >
          {bottomPanelResizable && !bottomPanelCollapsed && (
            <div
              role="separator"
              tabIndex={0}
              aria-label="调整底部面板高度"
              aria-orientation="horizontal"
              aria-valuemin={200}
              aria-valuemax={400}
              aria-valuenow={bottomHeight}
              className={styles.bottomResize}
              onPointerDown={(event) => {
                event.currentTarget.focus()
                event.currentTarget.setPointerCapture(event.pointerId)
                bottomDrag.current = { y: event.clientY, height: bottomHeight }
              }}
              onPointerMove={(event) => {
                if (bottomDrag.current)
                  setBottomHeight(
                    Math.max(
                      200,
                      Math.min(
                        400,
                        bottomDrag.current.height +
                          bottomDrag.current.y -
                          event.clientY,
                      ),
                    ),
                  )
              }}
              onPointerUp={(event) => {
                bottomDrag.current = null
                event.currentTarget.releasePointerCapture(event.pointerId)
              }}
              onPointerCancel={() => {
                bottomDrag.current = null
              }}
              onKeyDown={(event) => {
                if (
                  !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
                )
                  return
                event.preventDefault()
                setBottomHeight((height) =>
                  event.key === "Home"
                    ? 200
                    : event.key === "End"
                      ? 400
                      : Math.max(
                          200,
                          Math.min(
                            400,
                            height + (event.key === "ArrowUp" ? 8 : -8),
                          ),
                        ),
                )
              }}
            />
          )}
          {bottomPanel}
        </section>
      )}
      <Dialog.Root open={!wide && overlayOpen} onOpenChange={setOverlayOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className={styles.backdrop} />
          <Dialog.Popup className={styles.drawer} finalFocus={openerRef}>
            <div className={styles.inspectorHeader}>
              <Dialog.Title>{inspectorTitle}</Dialog.Title>
              <Button
                variant="ghost"
                size="icon"
                aria-label="关闭 Inspector"
                onClick={() => setOverlayOpen(false)}
              >
                <X />
              </Button>
            </div>
            <Dialog.Description className="sr-only">
              当前选中对象的状态、元数据与操作。
            </Dialog.Description>
            {panelBody}
            {inspectorFooter && (
              <div className={styles.inspectorFooter}>{inspectorFooter}</div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
