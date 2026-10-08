import { uiMessage } from "@/lib/i18n-core"
import { Bot, Braces, GitBranch, LogIn, LogOut, Wrench } from "lucide-react"
import {
  createCanvasDocument,
  type CanvasDocument,
  type CanvasNodeDefinition,
} from "@/lib/canvas-model"

/** Local configuration examples, with no model, tool, credential or execution service. */
export const canvasDefinitions: CanvasNodeDefinition[] = [
  {
    type: "input",
    label: "Input",
    category: "输入输出",
    categoryI18n: uiMessage("canvasMetadata.inputsAndOutputs"),
    icon: <LogIn />,
    defaults: { text: "请分析这段文本" },
    ports: [
      {
        id: "text",
        label: "文本",
        labelI18n: uiMessage("canvasMetadata.text"),
        direction: "output",
        type: "string",
      },
    ],
    fields: [
      {
        key: "text",
        label: "输入文本",
        labelI18n: uiMessage("canvasMetadata.inputText"),
        kind: "textarea",
        required: true,
      },
    ],
    summary: (node) => String(node.config.text ?? "未设置输入"),
  },
  {
    type: "agent",
    label: "Agent",
    category: "Agent",
    icon: <Bot />,
    defaults: {
      prompt: "分析输入并生成摘要",
      model: "caller-model",
      temperature: 0.2,
    },
    ports: [
      {
        id: "input",
        label: "输入",
        labelI18n: uiMessage("canvasMetadata.input"),
        direction: "input",
        type: "string",
        required: true,
        maxConnections: 1,
      },
      {
        id: "result",
        label: "结果",
        labelI18n: uiMessage("canvasMetadata.result"),
        direction: "output",
        type: "string",
      },
      {
        id: "model",
        label: "模型",
        labelI18n: uiMessage("canvasMetadata.model"),
        direction: "input",
        type: "model",
        maxConnections: 1,
      },
    ],
    fields: [
      {
        key: "prompt",
        label: "指令",
        labelI18n: uiMessage("canvasMetadata.instruction"),
        kind: "textarea",
        required: true,
        variableType: "string",
      },
      {
        key: "model",
        label: "模型引用",
        labelI18n: uiMessage("canvasMetadata.modelReference"),
        kind: "text",
        required: true,
        variableType: "model",
      },
      {
        key: "temperature",
        label: "温度",
        labelI18n: uiMessage("canvasMetadata.temperature"),
        kind: "number",
        required: true,
        min: 0,
        max: 2,
      },
    ],
    summary: (node) => String(node.config.prompt ?? "未设置指令"),
  },
  {
    type: "model",
    label: "Model",
    category: "配置",
    categoryI18n: uiMessage("canvasMetadata.configuration"),
    icon: <Braces />,
    defaults: { provider: "caller", modelId: "caller-model" },
    ports: [
      {
        id: "model",
        label: "模型配置",
        labelI18n: uiMessage("canvasMetadata.modelConfiguration"),
        direction: "output",
        type: "model",
      },
    ],
    fields: [
      {
        key: "provider",
        label: "提供方",
        labelI18n: uiMessage("canvasMetadata.provider"),
        kind: "select",
        options: [
          {
            value: "caller",
            label: "消费方提供",
            labelI18n: uiMessage("canvasMetadata.callerProvided"),
          },
          {
            value: "local",
            label: "本地适配",
            labelI18n: uiMessage("canvasMetadata.localAdapter"),
          },
        ],
        required: true,
      },
      {
        key: "modelId",
        label: "模型 ID",
        labelI18n: uiMessage("canvasMetadata.modelID"),
        kind: "text",
        required: true,
      },
    ],
    summary: (node) => `${node.config.provider} / ${node.config.modelId}`,
  },
  {
    type: "tool",
    label: "Tool",
    category: "工具",
    categoryI18n: uiMessage("canvasMetadata.tools"),
    icon: <Wrench />,
    defaults: { toolId: "caller-tool", arguments: { mode: "preview" } },
    ports: [
      {
        id: "input",
        label: "输入",
        labelI18n: uiMessage("canvasMetadata.input"),
        direction: "input",
        type: "string",
        required: true,
        maxConnections: 1,
      },
      {
        id: "result",
        label: "结果",
        labelI18n: uiMessage("canvasMetadata.result"),
        direction: "output",
        type: "string",
      },
    ],
    fields: [
      {
        key: "toolId",
        label: "工具 ID",
        labelI18n: uiMessage("canvasMetadata.toolID"),
        kind: "text",
        required: true,
      },
      {
        key: "arguments",
        label: "参数 JSON",
        labelI18n: uiMessage("canvasMetadata.argumentsJSON"),
        kind: "json",
        required: true,
      },
    ],
    summary: (node) => `${node.config.toolId} · 参数待执行方解释`,
  },
  {
    type: "condition",
    label: "Condition",
    category: "控制流",
    categoryI18n: uiMessage("canvasMetadata.controlFlow"),
    icon: <GitBranch />,
    defaults: { expression: "包含关键词" },
    ports: [
      {
        id: "input",
        label: "输入",
        labelI18n: uiMessage("canvasMetadata.input"),
        direction: "input",
        type: "string",
        required: true,
        maxConnections: 1,
      },
      {
        id: "yes",
        label: "满足条件",
        labelI18n: uiMessage("canvasMetadata.conditionMet"),
        direction: "output",
        type: "string",
      },
      {
        id: "no",
        label: "不满足",
        labelI18n: uiMessage("canvasMetadata.conditionNotMet"),
        direction: "output",
        type: "string",
      },
    ],
    fields: [
      {
        key: "expression",
        label: "条件说明",
        labelI18n: uiMessage("canvasMetadata.conditionDescription"),
        kind: "text",
        required: true,
        variableType: "string",
      },
    ],
    summary: (node) => String(node.config.expression),
  },
  {
    type: "output",
    label: "Output",
    category: "输入输出",
    categoryI18n: uiMessage("canvasMetadata.inputsAndOutputs"),
    icon: <LogOut />,
    defaults: { name: "result", format: "text" },
    ports: [
      {
        id: "input",
        label: "输入",
        labelI18n: uiMessage("canvasMetadata.input"),
        direction: "input",
        type: "string",
        required: true,
        maxConnections: 1,
      },
    ],
    fields: [
      {
        key: "name",
        label: "结果名称",
        labelI18n: uiMessage("canvasMetadata.resultName"),
        kind: "text",
        required: true,
      },
      {
        key: "format",
        label: "输出格式",
        labelI18n: uiMessage("canvasMetadata.outputFormat"),
        kind: "select",
        options: [
          {
            value: "text",
            label: "文本",
            labelI18n: uiMessage("canvasMetadata.text"),
          },
          { value: "json", label: "JSON" },
        ],
        required: true,
      },
    ],
    summary: (node) => `${node.config.name} · ${node.config.format}`,
  },
]
/** Caller-owned catalogs contain references only, never credentials themselves. */
export const canvasCatalogs = {
  models: [
    { id: "caller-model", name: "消费方模型（fixture）", available: true },
  ],
  tools: [
    { id: "caller-tool", name: "消费方工具（fixture）", available: true },
  ],
  credentials: [
    { id: "credential-ref", name: "凭据引用（fixture）", available: true },
    { id: "expired-ref", name: "过期引用", available: false },
  ],
}
export const agentCanvasDefinitions: CanvasNodeDefinition[] = [
  ...canvasDefinitions.map((definition) => ({
    ...definition,
    fields: definition.fields?.map((field) => ({
      ...field,
      catalog:
        field.key === "model" || field.key === "modelId"
          ? ("models" as const)
          : field.key === "toolId"
            ? ("tools" as const)
            : undefined,
    })),
  })),
  ...["session", "subagent", "approval"].map((type) => ({
    type,
    label: {
      session: "Session",
      subagent: "Subagent",
      approval: "Human Approval",
    }[type]!,
    category: "Agent 扩展",
    categoryI18n: uiMessage("canvasMetadata.agentExtensions"),
    icon: <Bot />,
    defaults: {
      description: "由调用方解释执行语义",
      credentialRef: "credential-ref",
    },
    ports: [
      {
        id: "input",
        label: "输入",
        labelI18n: uiMessage("canvasMetadata.input"),
        direction: "input" as const,
        type: "string" as const,
        required: true,
        maxConnections: 1,
      },
      {
        id: "result",
        label: "结果",
        labelI18n: uiMessage("canvasMetadata.result"),
        direction: "output" as const,
        type: "string" as const,
      },
    ],
    fields: [
      {
        key: "description",
        label: "说明",
        labelI18n: uiMessage("canvasMetadata.description"),
        kind: "textarea" as const,
        required: true,
      },
      {
        key: "credentialRef",
        label: "凭据引用",
        labelI18n: uiMessage("canvasMetadata.credentialReference"),
        kind: "text" as const,
        catalog: "credentials" as const,
        required: true,
      },
    ],
  })),
]
export function agentCanvasDocument(): CanvasDocument {
  const types = ["input", "session", "subagent", "approval", "tool", "output"]
  return {
    ...createCanvasDocument("agent-extensions"),
    nodes: types.map((type, index) => {
      const definition = agentCanvasDefinitions.find(
        (definition) => definition.type === type,
      )!
      return {
        id: type,
        type,
        title: definition.label,
        position: { x: index * 320, y: 120 },
        config: structuredClone(definition.defaults),
      }
    }),
    edges: types.slice(1).map((type, index) => ({
      id: `extension-${index}`,
      source: types[index],
      sourcePort: index === 0 ? "text" : "result",
      target: type,
      targetPort: "input",
    })),
  }
}

function node(id: string, type: string, x: number, y: number) {
  const definition = canvasDefinitions.find((item) => item.type === type)!
  return {
    id,
    type,
    title: definition.label,
    position: { x, y },
    config: structuredClone(definition.defaults),
  }
}
export function basicCanvasDocument(): CanvasDocument {
  return {
    ...createCanvasDocument("agent-workflow"),
    nodes: [
      node("input", "input", 80, 120),
      node("agent", "agent", 400, 120),
      node("tool", "tool", 720, 120),
      node("output", "output", 1040, 120),
    ],
    edges: [
      {
        id: "input-agent",
        source: "input",
        sourcePort: "text",
        target: "agent",
        targetPort: "input",
      },
      {
        id: "agent-tool",
        source: "agent",
        sourcePort: "result",
        target: "tool",
        targetPort: "input",
      },
      {
        id: "tool-output",
        source: "tool",
        sourcePort: "result",
        target: "output",
        targetPort: "input",
      },
    ],
  }
}
export function branchCanvasDocument(): CanvasDocument {
  return {
    ...createCanvasDocument("branch-workflow"),
    nodes: [
      node("input", "input", 0, 200),
      node("condition", "condition", 320, 200),
      node("agent", "agent", 640, 0),
      node("tool", "tool", 640, 360),
      node("yes-output", "output", 960, 0),
      { ...node("no-output", "output", 960, 360), title: "Fallback Output" },
    ],
    edges: [
      {
        id: "e1",
        source: "input",
        sourcePort: "text",
        target: "condition",
        targetPort: "input",
      },
      {
        id: "e2",
        source: "condition",
        sourcePort: "yes",
        target: "agent",
        targetPort: "input",
        label: "满足条件",
      },
      {
        id: "e3",
        source: "condition",
        sourcePort: "no",
        target: "tool",
        targetPort: "input",
        label: "不满足",
      },
      {
        id: "e4",
        source: "agent",
        sourcePort: "result",
        target: "yes-output",
        targetPort: "input",
      },
      {
        id: "e5",
        source: "tool",
        sourcePort: "result",
        target: "no-output",
        targetPort: "input",
      },
    ],
    notes: [
      {
        id: "branch-note",
        text: "两条分支的实际执行由消费方解释；这里仅编辑图配置。",
        position: { x: 320, y: 640 },
      },
    ],
  }
}
export function stressCanvasDocument(count: 50 | 200 | 500 | 1000): CanvasDocument {
  const nodes = Array.from({ length: count }, (_, index) => ({
    ...node(
      `node-${index}`,
      "condition",
      (index % 8) * 320,
      Math.floor(index / 8) * 280,
    ),
    title: `节点 ${index + 1}`,
  }))
  const edges: CanvasDocument["edges"] = nodes
    .slice(1)
    .map((target, index) => ({
      id: `chain-${index}`,
      source: nodes[index].id,
      sourcePort: "yes",
      target: target.id,
      targetPort: "input",
    }))
  // Additional forward links use a separate optional input in this fixture definition.
  for (let index = 0; index < Math.floor(count / 2) - 1; index++)
    edges.push({
      id: `branch-${index}`,
      source: nodes[index].id,
      sourcePort: "no",
      target: nodes[index + Math.floor(count / 2)].id,
      targetPort: "extra",
    })
  return { ...createCanvasDocument(`stress-${count}`), nodes, edges }
}
export const stressDefinitions: CanvasNodeDefinition[] = canvasDefinitions.map(
  (definition) =>
    definition.type === "condition"
      ? {
          ...definition,
          ports: [
            ...definition.ports,
            {
              id: "extra",
              label: "分支输入",
              labelI18n: uiMessage("canvasMetadata.branchInput"),
              direction: "input",
              type: "string",
              maxConnections: 1,
            },
          ],
        }
      : definition,
)
