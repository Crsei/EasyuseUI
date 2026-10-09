"use client"
import { useThemePortalContainer } from "@/components/ui/theme-boundary"
import { useI18n } from "@/lib/i18n-provider"

import { Dialog } from "@base-ui/react/dialog"
import { PanelLeftClose, PanelLeftOpen, PanelRight, X } from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ResizableHandle } from "@/components/ui/resizable"
import styles from "./workspace-shell.module.css"

function useLayoutValue<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(initial)
  const current = value === undefined ? internal : value
  function change(next: T | ((before: T) => T)) {
    const resolved =
      typeof next === "function" ? (next as (before: T) => T)(current) : next
    if (Object.is(current, resolved)) return
    if (value === undefined) setInternal(resolved)
    onChange?.(resolved)
  }
  return [current, change] as const
}

export type WorkspaceShellProps = {
  sidebarWidth?: number
  defaultSidebarWidth?: number
  onSidebarWidthChange?: (width: number) => void
  sidebarMinWidth?: number
  sidebarMaxWidth?: number
  sidebarResizable?: boolean
  sidebarCollapsed?: boolean
  defaultSidebarCollapsed?: boolean
  onSidebarCollapsedChange?: (collapsed: boolean) => void
  inspectorOpen?: boolean
  defaultInspectorOpen?: boolean
  onInspectorOpenChange?: (open: boolean) => void
  inspectorOverlayOpen?: boolean
  defaultInspectorOverlayOpen?: boolean
  onInspectorOverlayOpenChange?: (open: boolean) => void
  inspectorWidth?: number
  defaultInspectorWidth?: number
  onInspectorWidthChange?: (width: number) => void
  bottomPanelOpen?: boolean
  defaultBottomPanelOpen?: boolean
  onBottomPanelOpenChange?: (open: boolean) => void
  bottomPanelHeight?: number
  defaultBottomPanelHeight?: number
  onBottomPanelHeightChange?: (height: number) => void
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
  bottomPanelCollapsed,
  sidebarWidth: controlledSidebarWidth,
  defaultSidebarWidth = 256,
  onSidebarWidthChange,
  sidebarMinWidth = 200,
  sidebarMaxWidth = 400,
  sidebarResizable = false,
  sidebarCollapsed: controlledSidebar,
  defaultSidebarCollapsed = false,
  onSidebarCollapsedChange,
  inspectorOpen: controlledInspector,
  defaultInspectorOpen = true,
  onInspectorOpenChange,
  inspectorOverlayOpen: controlledOverlay,
  defaultInspectorOverlayOpen = false,
  onInspectorOverlayOpenChange,
  inspectorWidth: controlledWidth,
  defaultInspectorWidth,
  onInspectorWidthChange,
  bottomPanelOpen: controlledBottom,
  defaultBottomPanelOpen = true,
  onBottomPanelOpenChange,
  bottomPanelHeight: controlledHeight,
  defaultBottomPanelHeight = 240,
  onBottomPanelHeightChange,
  className,
}: WorkspaceShellProps) {
  const { t } = useI18n()
  const portalContainer = useThemePortalContainer()

  const sidebarId = useId()
  const sidebarRef = useRef<HTMLElement>(null)
  const [requestedSidebarWidth, setSidebarWidth] = useLayoutValue(
    controlledSidebarWidth,
    defaultSidebarWidth,
    onSidebarWidthChange,
  )
  const sidebarMin = Number.isFinite(sidebarMinWidth)
    ? Math.max(48, sidebarMinWidth)
    : 200
  const sidebarMax = Number.isFinite(sidebarMaxWidth)
    ? Math.max(sidebarMin, sidebarMaxWidth)
    : Math.max(sidebarMin, 400)
  const sidebarWidth = Math.max(
    sidebarMin,
    Math.min(
      sidebarMax,
      Number.isFinite(requestedSidebarWidth) ? requestedSidebarWidth : 256,
    ),
  )
  function resizeSidebar(width: number) {
    setSidebarWidth(Math.max(sidebarMin, Math.min(sidebarMax, width)))
  }
  const ref = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; width: number } | null>(null)
  const [wide, setWide] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useLayoutValue(
    controlledSidebar,
    defaultSidebarCollapsed,
    onSidebarCollapsedChange,
  )
  const [inspectorOpen, setInspectorOpen] = useLayoutValue(
    controlledInspector,
    defaultInspectorOpen,
    onInspectorOpenChange,
  )
  const [overlayOpen, setOverlayOpen] = useLayoutValue(
    controlledOverlay,
    defaultInspectorOverlayOpen,
    onInspectorOverlayOpenChange,
  )
  const [requestedWidth, setInspectorWidth] = useLayoutValue<number | null>(
    controlledWidth,
    defaultInspectorWidth ?? null,
    onInspectorWidthChange
      ? (value) => {
          if (value !== null) onInspectorWidthChange(value)
        }
      : undefined,
  )
  const [requestedHeight, setBottomHeight] = useLayoutValue(
    controlledHeight,
    defaultBottomPanelHeight,
    onBottomPanelHeightChange,
  )
  const [bottomOpen, setBottomOpen] = useLayoutValue(
    controlledBottom ??
      (bottomPanelCollapsed === undefined ? undefined : !bottomPanelCollapsed),
    defaultBottomPanelOpen,
    onBottomPanelOpenChange,
  )
  const bottomHeight = Math.min(
    400,
    Math.max(200, Number.isFinite(requestedHeight) ? requestedHeight : 240),
  )
  const bottomDrag = useRef<{ y: number; height: number } | null>(null)
  const [limits, setLimits] = useState({ min: 300, max: 360, initial: 320 })

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => {
      const isWide = entry.contentRect.width >= 1280
      setWide(isWide)
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

  const inspectorWidth =
    requestedWidth === null
      ? null
      : Math.min(
          limits.max,
          Math.max(
            limits.min,
            Number.isFinite(requestedWidth) ? requestedWidth : limits.initial,
          ),
        )

  function resize(width: number) {
    const { min, max } = limits
    setInspectorWidth(Math.min(max, Math.max(min, width)))
  }
  const docked = wide && inspectorOpen && inspector !== undefined
  const panelBody = <div className={styles.inspectorBody}>{inspector}</div>
  return (
    <div
      ref={ref}
      className={cn(styles.shell, className)}
      data-sidebar-collapsed={sidebarCollapsed}
      style={
        {
          ...(inspectorWidth === null
            ? {}
            : { "--inspector-current-width": `${inspectorWidth}px` }),
          "--sidebar-current-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <header className={styles.header}>
        <Button
          variant="ghost"
          size="icon"
          className={styles.sidebarToggle}
          aria-label={
            sidebarCollapsed
              ? t("workspaceShell.expandSidebar")
              : t("workspaceShell.collapseSidebar")
          }
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
            aria-label={
              docked
                ? t("workspaceShell.collapseInspector")
                : t("workspaceShell.openInspector")
            }
            aria-expanded={wide ? docked : overlayOpen}
            onClick={() =>
              wide ? setInspectorOpen(!inspectorOpen) : setOverlayOpen(true)
            }
          >
            <PanelRight />
          </Button>
        )}
      </header>
      <div className={styles.layout}>
        <aside
          id={sidebarId}
          ref={sidebarRef}
          className={styles.sidebar}
          aria-label={t("workspaceShell.workspaceNavigation")}
        >
          {sidebar}
        </aside>
        {sidebarResizable && !sidebarCollapsed && (
          <ResizableHandle
            unstyled
            label={t("commonComponents.resizeSidebar")}
            controls={sidebarId}
            value={sidebarWidth}
            min={sidebarMin}
            max={sidebarMax}
            onValueChange={resizeSidebar}
            className={styles.sidebarResize}
          />
        )}
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
              aria-label={t("workspaceShell.resizeInspectorWidth")}
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
                aria-label={t("workspaceShell.closeInspector")}
                onClick={() => {
                  setInspectorOpen(false)
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
          aria-label={t("workspaceShell.bottomWorkspacePanel")}
          data-collapsed={!bottomOpen}
          style={
            bottomPanelResizable && bottomOpen
              ? { height: bottomHeight }
              : undefined
          }
        >
          {bottomPanelResizable && bottomOpen && (
            <div
              role="separator"
              tabIndex={0}
              aria-label={t("workspaceShell.resizeBottomPanelHeight")}
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
          {bottomPanelCollapsed === undefined && (
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={bottomOpen}
              onClick={() => setBottomOpen(!bottomOpen)}
            >
              {t(
                bottomOpen
                  ? "workspaceShell.collapseBottomPanel"
                  : "workspaceShell.expandBottomPanel",
              )}
            </Button>
          )}
          {bottomPanelCollapsed !== undefined || bottomOpen
            ? bottomPanel
            : null}
        </section>
      )}
      <Dialog.Root open={!wide && overlayOpen} onOpenChange={setOverlayOpen}>
        <Dialog.Portal container={portalContainer}>
          <Dialog.Backdrop className={styles.backdrop} />
          <Dialog.Popup className={styles.drawer} finalFocus={openerRef}>
            <div className={styles.inspectorHeader}>
              <Dialog.Title>{inspectorTitle}</Dialog.Title>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("workspaceShell.closeInspector")}
                onClick={() => setOverlayOpen(false)}
              >
                <X />
              </Button>
            </div>
            <Dialog.Description className="sr-only">
              {t("workspaceShell.statusMetadataAndActionsForTheSelectedObject")}
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
