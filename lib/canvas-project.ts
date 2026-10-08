import type {
  CanvasDocument,
  CanvasNodeDefinition,
  CanvasPortType,
} from "@/lib/canvas-model"
import { canvasLimits } from "@/lib/canvas-model"
import { redact } from "@/lib/redact"
import {
  exportCanvasDocument,
  parseCanvasDocument,
  validateCanvasDocument,
} from "@/lib/canvas-validation"

export type CanvasFlowBoundary = {
  id: string
  label: string
  type: CanvasPortType
  nodeId: string
  portId: string
}
export type CanvasFlow = {
  id: string
  title: string
  document: CanvasDocument
  inputs: CanvasFlowBoundary[]
  outputs: CanvasFlowBoundary[]
}
export type CanvasProject = {
  schemaVersion: 1
  rootId: string
  flows: CanvasFlow[]
}
export type CanvasInvocationKind = "subflow" | "loop" | "iteration"
export function canvasInvocation(
  type: string,
): { kind: CanvasInvocationKind; flowId: string } | undefined {
  const match = /^(subflow|loop|iteration):([\w-]+)$/.exec(type)
  return match
    ? { kind: match[1] as CanvasInvocationKind, flowId: match[2] }
    : undefined
}
export const canvasBoundaryDefinitions: CanvasNodeDefinition[] = [
  {
    type: "flow-input",
    label: "Flow Input",
    category: "子流程边界",
    defaults: {},
    ports: [
      { id: "value", label: "作用域输入", direction: "output", type: "string" },
    ],
  },
  {
    type: "flow-output",
    label: "Flow Output",
    category: "子流程边界",
    defaults: {},
    ports: [
      {
        id: "value",
        label: "作用域输出",
        direction: "input",
        type: "string",
        required: true,
        maxConnections: 1,
      },
    ],
  },
]
/** Explicit invocation ports prevent variables from reaching into another document. */
const boundaryTypes: CanvasPortType[] = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "message",
  "tool",
  "model",
]
export function canvasProjectDefinitions(
  project: CanvasProject,
  base: CanvasNodeDefinition[],
): CanvasNodeDefinition[] {
  return [
    ...base,
    ...boundaryTypes.flatMap((type) =>
      canvasBoundaryDefinitions.map((def) => ({
        ...def,
        type: `${def.type}:${type}`,
        label: `${def.label} · ${type}`,
        ports: def.ports.map((port) => ({ ...port, type })),
      })),
    ),
    ...canvasBoundaryDefinitions.filter(
      (def) => !base.some((item) => item.type === def.type),
    ),
    ...project.flows.flatMap((flow) =>
      (["subflow", "loop", "iteration"] as const).flatMap<CanvasNodeDefinition>(
        (kind) => {
          if (
            kind !== "subflow" &&
            (flow.inputs.length !== 1 ||
              flow.outputs.length !== 1 ||
              (kind === "loop" && flow.inputs[0].type !== flow.outputs[0].type))
          )
            return []
          return [
            {
              type: `${kind}:${flow.id}`,
              label: `${kind === "subflow" ? "Subflow" : kind === "loop" ? "Loop" : "Iteration"} · ${flow.title}`,
              category: "子流程与容器",
              defaults: (kind === "loop"
                ? { maxIterations: 10, condition: "由执行器解释终止条件" }
                : kind === "iteration"
                  ? { concurrency: 1 }
                  : {}) as CanvasNodeDefinition["defaults"],
              ports: [
                ...flow.inputs.map((port) => ({
                  id: port.id,
                  label: port.label,
                  direction: "input" as const,
                  type: kind === "iteration" ? ("array" as const) : port.type,
                  required: true,
                  maxConnections: 1,
                })),
                ...flow.outputs.map((port) => ({
                  id: port.id,
                  label: port.label,
                  direction: "output" as const,
                  type: kind === "iteration" ? ("array" as const) : port.type,
                })),
              ],
              fields:
                kind === "loop"
                  ? [
                      {
                        key: "maxIterations",
                        label: "最大迭代次数",
                        kind: "number" as const,
                        min: 1,
                        max: 1000,
                        required: true,
                      },
                      {
                        key: "condition",
                        label: "终止表达式",
                        kind: "expression" as const,
                        required: true,
                      },
                    ]
                  : kind === "iteration"
                    ? [
                        {
                          key: "concurrency",
                          label: "并发项数",
                          kind: "number" as const,
                          min: 1,
                          max: 32,
                          required: true,
                        },
                      ]
                    : [],
              summary: () =>
                kind === "iteration"
                  ? "逐项独立作用域 · 结果按输入索引归属"
                  : kind === "loop"
                    ? "状态反馈限于容器 · 有界迭代，不允许图回路"
                    : "仅通过显式输入输出交换数据",
            },
          ]
        },
      ),
    ),
  ]
}
export function validateCanvasProject(
  project: CanvasProject,
  base: CanvasNodeDefinition[],
): string[] {
  const problems: string[] = []
  if (
    project.schemaVersion !== 1 ||
    !project.flows.length ||
    project.flows.length > 20 ||
    !project.flows.some((flow) => flow.id === project.rootId)
  )
    return ["项目版本、流程数量或入口无效。"]
  if (
    new Set(project.flows.map((flow) => flow.id)).size !== project.flows.length
  )
    return ["流程 ID 重复。"]
  const definitions = canvasProjectDefinitions(project, base)
  const links = new Map<string, string[]>()
  let count = 0
  for (const flow of project.flows) {
    count += flow.document.nodes.length
    if (flow.document.id !== flow.id)
      problems.push(`${flow.title}：文档与流程 ID 必须一致。`)
    for (const direction of ["inputs", "outputs"] as const) {
      if (
        new Set(flow[direction].map((port) => port.id)).size !==
        flow[direction].length
      )
        problems.push(`${flow.title}：边界 ID 重复。`)
      for (const port of flow[direction]) {
        const node = flow.document.nodes.find((node) => node.id === port.nodeId)
        const definition = definitions.find((def) => def.type === node?.type)
        const endpoint = definition?.ports.find(
          (item) => item.id === port.portId,
        )
        if (
          !node?.type.startsWith(
            direction === "inputs" ? "flow-input" : "flow-output",
          ) ||
          endpoint?.type !== port.type ||
          endpoint.direction !== (direction === "inputs" ? "output" : "input")
        )
          problems.push(`${flow.title} / ${port.label}：边界映射无效。`)
      }
    }
    links.set(flow.id, [])
    for (const node of flow.document.nodes) {
      const invocation = canvasInvocation(node.type)
      if (!invocation) continue
      links.get(flow.id)!.push(invocation.flowId)
      if (!definitions.some((def) => def.type === node.type))
        problems.push(`${node.title}：目标流程不存在或不符合容器输入输出约束。`)
    }
    for (const issue of validateCanvasDocument(flow.document, definitions))
      if (issue.severity === "error" || issue.code === "unknown-type")
        problems.push(`${flow.title}：${issue.message}`)
  }
  if (count > canvasLimits.nodes) problems.push("项目节点总数超过 500。")
  const visiting = new Set<string>(),
    done = new Set<string>()
  function visit(id: string) {
    if (visiting.has(id)) {
      problems.push(`禁止递归流程引用：${id}`)
      return
    }
    if (done.has(id)) return
    visiting.add(id)
    for (const target of links.get(id) ?? []) visit(target)
    visiting.delete(id)
    done.add(id)
  }
  for (const flow of project.flows) visit(flow.id)
  return [...new Set(problems)]
}
export function exportCanvasProject(project: CanvasProject) {
  return redact({
    schemaVersion: 1,
    rootId: project.rootId,
    flows: project.flows.map((flow) => ({
      id: flow.id,
      title: flow.title,
      inputs: flow.inputs,
      outputs: flow.outputs,
      document: JSON.parse(exportCanvasDocument(flow.document)),
    })),
  })
}
export function parseCanvasProject(
  text: string,
  base: CanvasNodeDefinition[],
): CanvasProject {
  if (new TextEncoder().encode(text).length > canvasLimits.bytes)
    throw new Error("项目文件超过 512KiB。")
  const value: unknown = JSON.parse(text)
  const record = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === "object" && !Array.isArray(value)
  if (
    !record(value) ||
    Object.keys(value).some(
      (key) => !["schemaVersion", "rootId", "flows"].includes(key),
    ) ||
    value.schemaVersion !== 1 ||
    typeof value.rootId !== "string" ||
    !Array.isArray(value.flows) ||
    value.flows.length > 20
  )
    throw new Error("项目格式无效。")
  for (const flow of value.flows) {
    if (
      !record(flow) ||
      Object.keys(flow).some(
        (key) =>
          !["id", "title", "document", "inputs", "outputs"].includes(key),
      ) ||
      typeof flow.id !== "string" ||
      !/^[\w-]{1,128}$/.test(flow.id) ||
      typeof flow.title !== "string" ||
      flow.title.length > 200 ||
      !record(flow.document)
    )
      throw new Error("流程格式无效。")
    for (const direction of ["inputs", "outputs"]) {
      if (!Array.isArray(flow[direction]) || flow[direction].length > 50)
        throw new Error("流程边界无效。")
      for (const port of flow[direction])
        if (
          !record(port) ||
          Object.keys(port).some(
            (key) => !["id", "label", "type", "nodeId", "portId"].includes(key),
          ) ||
          ["id", "nodeId", "portId"].some(
            (key) =>
              typeof port[key] !== "string" ||
              !/^[\w-]{1,128}$/.test(port[key] as string),
          ) ||
          typeof port.label !== "string" ||
          port.label.length > 200 ||
          ![
            "string",
            "number",
            "boolean",
            "object",
            "array",
            "message",
            "tool",
            "model",
          ].includes(String(port.type))
        )
          throw new Error("边界端口格式无效。")
    }
  }
  const project = value as unknown as CanvasProject
  const definitions = canvasProjectDefinitions(project, base)
  for (const flow of project.flows)
    flow.document = parseCanvasDocument(
      JSON.stringify(flow.document),
      definitions,
    )
  const problems = validateCanvasProject(project, base)
  if (problems.length) throw new Error(problems[0])
  return project
}
