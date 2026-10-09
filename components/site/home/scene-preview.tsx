"use client"

import dynamic from "next/dynamic"

// Keep the homepage gallery and its example metadata out of catalog bundles.
const ScenePreviewContent = dynamic(() =>
  import("./scene-preview-content").then((module) => module.ScenePreview),
)

export function ScenePreview() {
  return <ScenePreviewContent />
}
