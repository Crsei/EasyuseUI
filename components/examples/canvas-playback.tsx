"use client"

import {
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
} from "react"
import { Pause, Play, SlidersHorizontal, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSiteI18n } from "@/components/site/site-i18n"
import { canvasRuntimeUnknown } from "@/lib/canvas-runtime"
import type { CanvasDocument, CanvasExecutionVisuals } from "@/lib/canvas-model"
import type { CanvasRuntimeController } from "@/lib/use-canvas-runtime"
import type { createCanvasRuntimeFixture } from "./canvas-runtime-fixture"
import styles from "./canvas-playback.module.css"

type Fixture = ReturnType<typeof createCanvasRuntimeFixture>
function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify)
  return () => document.removeEventListener("visibilitychange", notify)
}
function visible() {
  return document.visibilityState !== "hidden"
}

/** Owns the local demonstration clock. Portable runtime/graph components never own this clock. */
export function useCanvasPlayback(
  document: CanvasDocument,
  runtime: CanvasRuntimeController,
  fixture: Fixture,
) {
  const [pause, setPause] = useState<{ runId?: string; paused: boolean }>({
    paused: false,
  })
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1)
  const [edgeEffect, setEdgeEffect] = useState<"flow" | "particles" | "none">(
    "flow",
  )
  const isVisible = useSyncExternalStore(
    subscribeVisibility,
    visible,
    () => true,
  )
  const { state } = runtime,
    snapshot = state.snapshot
  const paused = pause.runId === snapshot?.runId && pause.paused
  const active =
    !!snapshot &&
    !["completed", "failed", "cancelled"].includes(snapshot.status)
  const blocked =
    !!state.uncertain ||
    !!state.readError ||
    canvasRuntimeUnknown(snapshot) ||
    state.transport === "disconnected" ||
    snapshot?.status === "waiting" ||
    snapshot?.status === "paused" ||
    snapshot?.documentId !== document.id ||
    snapshot?.documentRevision !== document.revision
  const stopping = !!snapshot && fixture.stopPending(snapshot.runId)
  const canAdvance = active && !state.pending && !blocked && isVisible
  const tick = useEffectEvent((runId: string, sequence: number) => {
    if (
      runtime.state.snapshot?.runId !== runId ||
      runtime.state.snapshot.sequence !== sequence ||
      runtime.state.pending
    )
      return
    try {
      const next = fixture.advance(runId, sequence)
      if (next) runtime.receive(next)
    } catch {
      // The fixture's authoritative read reports transport failure through the ordinary controller.
      void runtime.query()
    }
  })
  const runId = snapshot?.runId,
    sequence = snapshot?.sequence
  useEffect(() => {
    if (
      ((!canAdvance || paused) && !stopping) ||
      state.pending ||
      !isVisible ||
      !runId ||
      sequence === undefined
    )
      return
    const timer = setTimeout(() => tick(runId, sequence), 1000 / speed)
    return () => clearTimeout(timer)
  }, [
    canAdvance,
    paused,
    stopping,
    state.pending,
    isVisible,
    runId,
    sequence,
    speed,
    document.id,
    document.revision,
  ])
  function step() {
    if (!canAdvance || !paused || !snapshot) return
    try {
      const next = fixture.advance(snapshot.runId, snapshot.sequence)
      if (next) runtime.receive(next)
    } catch {
      void runtime.query()
    }
  }
  const status: "idle" | "finished" | "blocked" | "paused" | "playing" = !active
    ? snapshot
      ? "finished"
      : "idle"
    : blocked
      ? "blocked"
      : paused || !isVisible
        ? "paused"
        : "playing"
  const visuals: CanvasExecutionVisuals = {
    edgeEffect,
    speed,
    paused: paused || blocked || !isVisible,
  }
  return {
    visuals,
    speed,
    edgeEffect,
    setSpeed,
    setEdgeEffect,
    paused,
    active,
    blocked,
    canPause: active && !blocked && !state.pending && !stopping,
    canStep: canAdvance && paused && !stopping,
    toggle: () => setPause({ runId, paused: !paused }),
    step,
    status,
    runId,
    sequence,
  }
}
export function CanvasPlaybackToolbar({
  playback,
}: {
  playback: ReturnType<typeof useCanvasPlayback>
}) {
  const { t } = useSiteI18n()
  const [open, setOpen] = useState(false)
  return (
    <div
      className={styles.toolbar}
      aria-label={t("site.playbackControls")}
      data-canvas-playback={playback.status}
      data-playback-sequence={playback.sequence}
      data-playback-run={playback.runId}
    >
      <Button
        size="icon"
        variant="outline"
        aria-label={t(playback.paused ? "site.resumeDemo" : "site.pauseDemo")}
        disabled={!playback.canPause}
        onClick={playback.toggle}
      >
        {playback.paused ? <Play /> : <Pause />}
      </Button>
      <Button
        size="icon"
        variant="outline"
        aria-label={t("site.playbackSettings")}
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal />
      </Button>
      <span className={styles.state} role="status">
        {t(`site.playback_${playback.status}`)}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.popup}>
          <DialogTitle>{t("site.playbackSettings")}</DialogTitle>
          <DialogDescription>{t("site.playbackDescription")}</DialogDescription>
          <div className={styles.settings}>
            <label>
              {t("site.playbackSpeed")}
              <select
                aria-label={t("site.playbackSpeed")}
                value={playback.speed}
                onChange={(e) =>
                  playback.setSpeed(Number(e.target.value) as 0.5 | 1 | 2)
                }
              >
                <option value={0.5}>0.5×</option>
                <option value={1}>1×</option>
                <option value={2}>2×</option>
              </select>
            </label>
            <label>
              {t("site.edgeEffect")}
              <select
                aria-label={t("site.edgeEffect")}
                value={playback.edgeEffect}
                onChange={(e) =>
                  playback.setEdgeEffect(
                    e.target.value as typeof playback.edgeEffect,
                  )
                }
              >
                <option value="flow">{t("site.flowEffect")}</option>
                <option value="particles">{t("site.particleEffect")}</option>
                <option value="none">{t("site.noEffect")}</option>
              </select>
            </label>
            <Button
              variant="outline"
              disabled={!playback.canStep}
              onClick={playback.step}
            >
              <StepForward />
              {t("site.stepDemo")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
