import {
  createCanvasDocument,
  type CanvasNodeDefinition,
  type CanvasNodeRecord,
} from "@/lib/canvas-model"
import type { CanvasProject } from "@/lib/canvas-project"
import { canvasDefinitions } from "./canvas-fixtures"

export const advancedCanvasDefinitions: CanvasNodeDefinition[] = [
  ...canvasDefinitions,
  {
    type: "array-input",
    label: "Array Input",
    category: "输入输出",
    defaults: { items: ["A", "B"] },
    fields: [{ key: "items", label: "输入数组", kind: "json", required: true }],
    ports: [{ id: "items", label: "项目", direction: "output", type: "array" }],
    validate: (node) =>
      Array.isArray(node.config.items) ? [] : ["迭代输入必须是数组。"],
  },
  {
    type: "array-output",
    label: "Array Output",
    category: "输入输出",
    defaults: {},
    ports: [
      {
        id: "items",
        label: "有序结果",
        direction: "input",
        type: "array",
        required: true,
        maxConnections: 1,
      },
    ],
  },
  ...["switch", "parallel", "merge"].map<CanvasNodeDefinition>((type) => ({
    type,
    label: { switch: "Switch", parallel: "Parallel", merge: "Merge" }[type]!,
    category: "高级控制流",
    defaults: (type === "switch"
      ? {
          rules: {
            match: "all",
            clauses: [{ field: "input", operator: "contains", value: "A" }],
          },
        }
      : type === "merge"
        ? { policy: "all" }
        : { branches: 2 }) as CanvasNodeDefinition["defaults"],
    fields:
      type === "switch"
        ? [
            {
              key: "rules",
              label: "分支条件",
              kind: "condition" as const,
              required: true,
            },
          ]
        : type === "merge"
          ? [
              {
                key: "policy",
                label: "合并策略",
                kind: "select" as const,
                options: [
                  { value: "all", label: "等待全部分支，按端口顺序归属" },
                  { value: "first", label: "首个完成分支，保留来源 ID" },
                ],
                required: true,
              },
            ]
          : [
              {
                key: "branches",
                label: "固定分支数",
                kind: "number" as const,
                min: 2,
                max: 2,
                required: true,
              },
            ],
    ports:
      type === "merge"
        ? [
            {
              id: "a",
              label: "分支 A",
              direction: "input" as const,
              type: "string" as const,
              required: true,
              maxConnections: 1,
            },
            {
              id: "b",
              label: "分支 B",
              direction: "input" as const,
              type: "string" as const,
              required: true,
              maxConnections: 1,
            },
            {
              id: "result",
              label: "合并结果",
              direction: "output" as const,
              type: "string" as const,
            },
          ]
        : [
            {
              id: "input",
              label: "输入",
              direction: "input" as const,
              type: "string" as const,
              required: true,
              maxConnections: 1,
            },
            {
              id: "a",
              label: type === "switch" ? "匹配分支" : "分支 A",
              direction: "output" as const,
              type: "string" as const,
            },
            {
              id: "b",
              label: type === "switch" ? "默认分支" : "分支 B",
              direction: "output" as const,
              type: "string" as const,
            },
          ],
    summary: () =>
      type === "switch"
        ? "按规则选择一个分支，不执行表达式"
        : type === "parallel"
          ? "固定两个独立分支，不隐式共享变量"
          : "结果由合并节点所有，策略由执行器兑现",
  })),
  {
    type: "config",
    label: "Advanced Config",
    category: "配置",
    defaults: {
      headers: { Accept: "application/json" },
      schema: {
        type: "object",
        properties: { result: { type: "string" } },
        required: ["result"],
      },
      expression: "input.result",
      code: "// 仅编辑，不执行",
    },
    fields: [
      { key: "headers", label: "请求头", kind: "key-value", required: true },
      { key: "schema", label: "输出结构", kind: "schema", required: true },
      {
        key: "expression",
        label: "表达式",
        kind: "expression",
        required: true,
      },
      { key: "code", label: "代码", kind: "code", required: true },
    ],
    ports: [],
  },
]
export function nestedCanvasProject(): CanvasProject {
  const makeNode = (
    id: string,
    type: string,
    x: number,
    y = 120,
    config: CanvasNodeRecord["config"] = {},
  ): CanvasNodeRecord => ({
    id,
    type,
    title: type.startsWith("subflow:") ? `调用 ${type.slice(8)}` : type,
    position: { x, y },
    config: {
      ...advancedCanvasDefinitions.find((def) => def.type === type)?.defaults,
      ...config,
    },
  })
  const edge = (
    id: string,
    source: string,
    sourcePort: string,
    target: string,
    targetPort: string,
  ) => ({ id, source, sourcePort, target, targetPort })
  const boundary = (id: string, nodeId: string) => ({
    id,
    label: id,
    type: "string" as const,
    nodeId,
    portId: "value",
  })
  return {
    schemaVersion: 1,
    rootId: "root",
    flows: [
      {
        id: "root",
        title: "主流程",
        inputs: [],
        outputs: [],
        document: {
          ...createCanvasDocument("root"),
          nodes: [
            makeNode("input", "input", 0),
            {
              ...makeNode("middle-call", "subflow:middle", 320),
              parentId: "group",
            },
            makeNode("output", "output", 640),
            makeNode("list", "array-input", 0, 480),
            makeNode("each", "iteration:leaf", 320, 480, { concurrency: 2 }),
            makeNode("list-output", "array-output", 640, 480),
            makeNode("loop", "loop:leaf", 960, 480, {
              maxIterations: 10,
              condition: "完成时停止",
            }),
            makeNode("config", "config", 960),
          ],
          frames: [
            {
              id: "group",
              title: "嵌套调用分组",
              position: { x: 296, y: 64 },
              width: 288,
              height: 320,
            },
          ],
          edges: [
            edge("root-in", "input", "text", "middle-call", "in"),
            edge("root-out", "middle-call", "out", "output", "input"),
            edge("each-in", "list", "items", "each", "in"),
            edge("each-out", "each", "out", "list-output", "items"),
            edge("loop-in", "input", "text", "loop", "in"),
          ],
        },
      },
      {
        id: "middle",
        title: "分析子流程",
        inputs: [boundary("in", "entry")],
        outputs: [boundary("out", "exit")],
        document: {
          ...createCanvasDocument("middle"),
          nodes: [
            makeNode("entry", "flow-input", 0),
            makeNode("leaf-call", "subflow:leaf", 320),
            makeNode("exit", "flow-output", 640),
            makeNode("switch", "switch", 960),
            makeNode("parallel", "parallel", 1280),
            makeNode("merge", "merge", 1600),
          ],
          edges: [
            edge("mid-in", "entry", "value", "leaf-call", "in"),
            edge("mid-out", "leaf-call", "out", "exit", "value"),
            edge("switch-in", "entry", "value", "switch", "input"),
            edge("parallel-in", "switch", "a", "parallel", "input"),
            edge("parallel-a", "parallel", "a", "merge", "a"),
            edge("parallel-b", "parallel", "b", "merge", "b"),
          ],
        },
      },
      {
        id: "leaf",
        title: "Agent 子流程",
        inputs: [boundary("in", "entry")],
        outputs: [boundary("out", "exit")],
        document: {
          ...createCanvasDocument("leaf"),
          nodes: [
            makeNode("entry", "flow-input", 0),
            {
              ...makeNode("agent", "agent", 320),
              bindings: {
                prompt: {
                  nodeId: "entry",
                  portId: "value",
                  type: "string",
                  path: [],
                },
              },
            },
            makeNode("exit", "flow-output", 640),
          ],
          edges: [
            edge("leaf-in", "entry", "value", "agent", "input"),
            edge("leaf-out", "agent", "result", "exit", "value"),
          ],
        },
      },
    ],
  }
}
