"use client"
import { useEffect, useRef, useState } from "react"
import {
  SvgWorkbench,
  type SvgWorkbenchProps,
} from "@/components/blocks/svg-workbench"
import { SvgCanvas } from "@/components/blocks/svg-canvas"
import { SvgIconLibrary } from "@/components/blocks/svg-icon-library"
import { SvgProperties } from "@/components/blocks/svg-properties"
import { NativeSelect } from "@/components/ui/native-select"
import { useSvgI18n as useI18n } from "@/lib/i18n-svg"
import {
  loadSvgCollection,
  type SvgCollection,
  type SvgIconAsset,
} from "@/lib/svg-workbench-assets"
import { blankSvgDocument } from "@/lib/svg-workbench-model"
import { useSvgWorkbenchEditor } from "@/lib/use-svg-workbench-editor"
import type { DataState } from "@/lib/runtime-status"
function useLocalLibrary() {
  const [collection, setCollection] = useState<SvgCollection>("lucide"),
    [generation, setGeneration] = useState(0),
    [snapshot, setSnapshot] = useState<{
      collection: SvgCollection
      state: DataState
      assets: SvgIconAsset[]
      error?: string
    }>({ collection: "lucide", state: "loading", assets: [] }),
    cache = useRef(new Map<SvgCollection, SvgIconAsset[]>())
  useEffect(() => {
    let active = true
    const previous = cache.current.get(collection) ?? []
    setSnapshot({ collection, assets: previous, state: "loading" })
    void loadSvgCollection(collection)
      .then((assets) => {
        if (!active) return
        cache.current.set(collection, assets)
        setSnapshot({ collection, assets, state: "success" })
      })
      .catch((error) => {
        if (active)
          setSnapshot({
            collection,
            assets: previous,
            state: "error",
            error: error instanceof Error ? error.message : String(error),
          })
      })
    return () => {
      active = false
    }
  }, [collection, generation])
  return {
    collection,
    onCollectionChange: setCollection,
    assets: snapshot.collection === collection ? snapshot.assets : [],
    state:
      snapshot.collection === collection
        ? snapshot.state
        : ("loading" as DataState),
    error: snapshot.error,
    onRetry: () => setGeneration((n) => n + 1),
  }
}
const demoDocument = () => {
  const d = blankSvgDocument("svg-demo")
  d.nodes = [
    {
      id: "rectangle",
      tag: "rect",
      attrs: { x: "4", y: "4", width: "16", height: "16", rx: "2" },
      children: [],
    },
  ]
  return d
}
export function SvgWorkbenchDemo({
  layout = "preview",
}: Pick<SvgWorkbenchProps, "layout">) {
  const editor = useSvgWorkbenchEditor(),
    library = useLocalLibrary()
  return <SvgWorkbench {...editor} library={library} layout={layout} />
}
export function SvgCanvasDemo() {
  const editor = useSvgWorkbenchEditor(demoDocument()),
    [zoom, setZoom] = useState(1)
  return (
    <div style={{ height: 400, display: "flex" }}>
      <SvgCanvas {...editor} tool="select" zoom={zoom} onZoomChange={setZoom} />
    </div>
  )
}
export function SvgPropertiesDemo() {
  const editor = useSvgWorkbenchEditor(demoDocument())
  return <SvgProperties {...editor} selectedIds={["rectangle"]} />
}
export function SvgIconLibraryDemo() {
  const library = useLocalLibrary(),
    { t } = useI18n(),
    [state, setState] = useState<DataState>("success"),
    [inserted, setInserted] = useState("")
  return (
    <div style={{ maxWidth: 400 }}>
      <NativeSelect
        aria-label="Data state"
        value={state}
        onChange={(e) => setState(e.target.value as DataState)}
      >
        {["loading", "empty", "partial", "error", "success"].map((value) => (
          <option key={value}>{value}</option>
        ))}
      </NativeSelect>
      <SvgIconLibrary
        {...library}
        state={state}
        assets={state === "empty" ? [] : library.assets}
        error="Local state demonstration"
        onInsert={(asset) => setInserted(asset.id)}
      />
      <p role="status">
        {t("svg.insert")}: {inserted}
      </p>
    </div>
  )
}
