import { buildCanvasIndexes } from "../lib/canvas-index.ts"
import { readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import os from "node:os"
const [beforeFile, output] = process.argv.slice(2)
if (!beforeFile || !output)
  throw new Error(
    "Usage: capture-canvas-construction.mjs <before workflow-canvas.tsx> <report.json>",
  )
const hash = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex")
// Equivalent pure projections of the frozen source's find/filter/flatMap/some.
// React and engine initialization are measured separately, never inferred here.
function reference(document, definitions, issues) {
  const nodes = document.nodes.map((record) => ({
    definition: definitions.find(
      (definition) => definition.type === record.type,
    ),
    issues: issues.filter((issue) => issue.nodeId === record.id),
    ports: [
      ...new Map(
        document.edges
          .flatMap((edge) =>
            edge.source === record.id
              ? [{ id: edge.sourcePort, direction: "output" }]
              : edge.target === record.id
                ? [{ id: edge.targetPort, direction: "input" }]
                : [],
          )
          .map((port) => [port.id, port]),
      ).values(),
    ],
  }))
  const hidden = document.edges.map((edge) =>
    document.nodes.some(
      (node) =>
        (node.id === edge.source || node.id === edge.target) && !!node.parentId,
    ),
  )
  return nodes.length + hidden.length
}
function indexed(document, definitions, issues) {
  const indexes = buildCanvasIndexes(document, definitions, issues)
  for (const record of document.nodes) {
    indexes.definitionByType.get(record.type)
    indexes.issuesByNodeId.get(record.id)
    indexes.fallbackPortsByNodeId.get(record.id)
  }
  const hidden = document.edges.map(
    (edge) =>
      !!indexes.nodeById.get(edge.source)?.parentId ||
      !!indexes.nodeById.get(edge.target)?.parentId,
  )
  return document.nodes.length + hidden.length
}
const samples = []
for (const count of [50, 200, 500, 1000]) {
  const nodes = Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    type: `type-${i % 10}`,
    title: `${i}`,
    position: { x: i * 320, y: 80 },
    config: {},
  }))
  const edges = nodes
    .slice(1)
    .map((node, i) => ({
      id: `chain-${i}`,
      source: nodes[i].id,
      sourcePort: "yes",
      target: node.id,
      targetPort: "input",
    }))
  for (let i = 0; i < count / 2 - 1; i++)
    edges.push({
      id: `branch-${i}`,
      source: nodes[i].id,
      sourcePort: "no",
      target: nodes[i + count / 2].id,
      targetPort: "extra",
    })
  const document = { nodes, edges, frames: [] },
    definitions = Array.from({ length: 10 }, (_, i) => ({
      type: `type-${i}`,
      label: `${i}`,
      ports: [],
      defaults: {},
      category: "fixture",
    })),
    issues = nodes.map((node) => ({
      nodeId: node.id,
      code: "fixture",
      severity: "warning",
      message: "fixture",
    }))
  for (let i = 0; i < 5; i++) {
    reference(document, definitions, issues)
    indexed(document, definitions, issues)
  }
  for (let round = 0; round < 3; round++)
    for (const [phase, project] of round % 2
      ? [
          ["after", indexed],
          ["before", reference],
        ]
      : [
          ["before", reference],
          ["after", indexed],
        ]) {
      const values = []
      for (let i = 0; i < 30; i++) {
        const start = performance.now()
        const checksum = project(document, definitions, issues)
        if (checksum !== nodes.length + edges.length)
          throw new Error("Projection mismatch")
        values.push(performance.now() - start)
      }
      samples.push({
        count,
        edges: edges.length,
        issues: issues.length,
        definitions: definitions.length,
        round,
        phase,
        ms: values,
      })
    }
}
await writeFile(
  output,
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      hashes: {
        beforeWorkflow: await hash(beforeFile),
        afterIndex: await hash(
          new URL("../lib/canvas-index.ts", import.meta.url),
        ),
      },
      environment: {
        node: process.version,
        os: os.type(),
        release: os.release(),
        arch: os.arch(),
        sharedHost: true,
      },
      method:
        "Pure equivalent projections, 5 warmups, 3 alternating rounds, 30 builds/round. N nodes, 1.5N-2 forward edges, N issues, 10 definitions; no React, DOM or browser. No inference about end-user interaction latency.",
      samples,
    },
    null,
    2,
  ) + "\n",
)
