export type DocGroup = "interaction" | "data" | "agent" | "canvas" | "workspace" | "other"
export type DocVariant = { title: { "zh-CN": string; en: string }; code: string }
type Prop = {
  name: string
  type: string
  default?: string
  description: string
}
export type ComponentManifestEntry = {
  docGroup?: DocGroup
  docOrder?: number
  aliases?: string[]
  variants?: DocVariant[]
  related?: string[]
  widePreview?: boolean
  slug: string
  docPath: string
  registryId: string
  registryDependencies: string[]
  installType: "ui" | "block" | "lib"
  displayCategory: "primitives" | "patterns" | "canvas" | "workspace"
  availability: "available"
  name: string
  category: "基础组件" | "组合模块"
  description: string
  source: string
  example: string
  usage: string
  props: Prop[]
  notes: string[]
  relatedSources?: string[]
}

const sourceManifest: ComponentManifestEntry[] = [
  // BEGIN agent workbench
{
  "slug": "session-navigator",
  "docPath": "/docs/session-navigator/",
  "registryId": "agent-workbench-navigation",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "input",
    "data-region",
    "session-row",
    "runtime-status-badge"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "SessionNavigator",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/navigation.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { SessionNavigator } from \"@/components/blocks/agent-workbench/navigation\"",
  "props": [
    {
      "name": "projects",
      "type": "readonly ProjectRef[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "sessions",
      "type": "readonly SessionSnapshot[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "projectId",
      "type": "string",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "selectedId",
      "type": "string | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onProjectChange",
      "type": "(id: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onSelect",
      "type": "(id: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onNew",
      "type": "() => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onUpdate",
      "type": "(id: string, patch: Partial<Pick<SessionSnapshot, \"title\" | \"favorite\" | \"archived\">>) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "receipts",
      "type": "readonly OperationReceipt[] | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onReconcile",
      "type": "(receipt: OperationReceipt) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "project-switcher",
  "docPath": "/docs/project-switcher/",
  "registryId": "agent-workbench-navigation",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "input",
    "data-region",
    "session-row",
    "runtime-status-badge"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "ProjectSwitcher",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/navigation.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { ProjectSwitcher } from \"@/components/blocks/agent-workbench/navigation\"",
  "props": [
    {
      "name": "projects",
      "type": "readonly ProjectRef[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "value",
      "type": "string",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onChange",
      "type": "(id: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "session-header",
  "docPath": "/docs/session-header/",
  "registryId": "agent-workbench-navigation",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "input",
    "data-region",
    "session-row",
    "runtime-status-badge"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "SessionHeader",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/navigation.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { SessionHeader } from \"@/components/blocks/agent-workbench/navigation\"",
  "props": [
    {
      "name": "session",
      "type": "SessionSnapshot",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "environment",
      "type": "EnvironmentRef | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onRename",
      "type": "(title: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onInterrupt",
      "type": "() => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "actions",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "context-panel",
  "docPath": "/docs/context-panel/",
  "registryId": "agent-workbench-context",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "data-region",
    "item"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ContextPanel",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/context.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { ContextPanel } from \"@/components/blocks/agent-workbench/context\"",
  "props": [
    {
      "name": "references",
      "type": "readonly ContextReference[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onRemove",
      "type": "(id: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onInclude",
      "type": "(id: string, included: boolean) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onRetry",
      "type": "(id: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onOpen",
      "type": "(reference: ContextReference) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "data",
      "type": "Omit<DataRegionProps, \"children\" | \"hasContent\">",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "limit",
      "type": "number | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "context-picker",
  "docPath": "/docs/context-picker/",
  "registryId": "agent-workbench-context",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "data-region",
    "item"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ContextPicker",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/context.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { ContextPicker } from \"@/components/blocks/agent-workbench/context\"",
  "props": [
    {
      "name": "references",
      "type": "readonly ContextReference[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onPick",
      "type": "(reference: ContextReference) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "message-content",
  "docPath": "/docs/message-content/",
  "registryId": "agent-workbench-conversation",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "chat-message",
    "tool-call"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "MessageContent",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/conversation.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { MessageContent } from \"@/components/blocks/agent-workbench/conversation\"",
  "props": [
    {
      "name": "content",
      "type": "string",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "maximum",
      "type": "number | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": true,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "agent-conversation",
  "docPath": "/docs/agent-conversation/",
  "registryId": "agent-workbench-conversation",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "chat-message",
    "tool-call"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "AgentConversation",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/conversation.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { AgentConversation } from \"@/components/blocks/agent-workbench/conversation\"",
  "props": [
    {
      "name": "session",
      "type": "SessionSnapshot",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "composer",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "attention",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onLoadHistory",
      "type": "() => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onOpenReference",
      "type": "(part: MessagePart) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "actionsRef",
      "type": "Ref<ConversationActions>",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "deferOffscreen",
      "type": "boolean | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onRetry",
      "type": "() => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": true,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "composer-controls",
  "docPath": "/docs/composer-controls/",
  "registryId": "agent-workbench-composer",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "chat-message"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ComposerControls",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/composer.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { ComposerControls } from \"@/components/blocks/agent-workbench/composer\"",
  "props": [
    {
      "name": "draft",
      "type": "DraftState",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "session",
      "type": "SessionSnapshot",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "models",
      "type": "readonly WorkbenchChoice[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "permissions",
      "type": "readonly WorkbenchChoice[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "environments",
      "type": "readonly WorkbenchChoice[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onChange",
      "type": "(draft: DraftState) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "agent-composer",
  "docPath": "/docs/agent-composer/",
  "registryId": "agent-workbench-composer",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "button",
    "chat-message"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "AgentComposer",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/composer.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { AgentComposer } from \"@/components/blocks/agent-workbench/composer\"",
  "props": [
    {
      "name": "draft",
      "type": "DraftState",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "session",
      "type": "SessionSnapshot",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "models",
      "type": "readonly WorkbenchChoice[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "permissions",
      "type": "readonly WorkbenchChoice[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "environments",
      "type": "readonly WorkbenchChoice[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "receipts",
      "type": "readonly OperationReceipt[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onChange",
      "type": "(draft: DraftState) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onSubmit",
      "type": "(draft: DraftState) => void | Promise<void>",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onInterrupt",
      "type": "() => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onReconcile",
      "type": "(receipt: OperationReceipt) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onFiles",
      "type": "(files: File[]) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "attachments",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "file-viewer",
  "docPath": "/docs/file-viewer/",
  "registryId": "agent-workbench-review",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "tree",
    "button",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "FileViewer",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/review.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { FileViewer } from \"@/components/blocks/agent-workbench/review\"",
  "props": [
    {
      "name": "file",
      "type": "ChangedFile | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "revision",
      "type": "string",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "maximumLines",
      "type": "number | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": true,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "diff-viewer",
  "docPath": "/docs/diff-viewer/",
  "registryId": "agent-workbench-review",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "tree",
    "button",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "DiffViewer",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/review.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { DiffViewer } from \"@/components/blocks/agent-workbench/review\"",
  "props": [
    {
      "name": "file",
      "type": "ChangedFile",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "mode",
      "type": "\"unified\" | \"split\"",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onComment",
      "type": "(lineId: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "maximumLines",
      "type": "number | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": true,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "change-review-panel",
  "docPath": "/docs/change-review-panel/",
  "registryId": "agent-workbench-review",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "tree",
    "button",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ChangeReviewPanel",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/review.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { ChangeReviewPanel } from \"@/components/blocks/agent-workbench/review\"",
  "props": [
    {
      "name": "changes",
      "type": "ChangeSet",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "scopeId",
      "type": "string | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "selectedFileId",
      "type": "string | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onSelectFile",
      "type": "(id: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "comments",
      "type": "readonly ReviewComment[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onCommentsChange",
      "type": "(comments: ReviewComment[]) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onFeedback",
      "type": "(text: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "mode",
      "type": "\"unified\" | \"split\"",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onModeChange",
      "type": "(mode: \"unified\" | \"split\") => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "fileOnly",
      "type": "boolean | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": true,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "workbench-panel-tabs",
  "docPath": "/docs/workbench-panel-tabs/",
  "registryId": "agent-workbench-panels",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "tabs",
    "button",
    "input",
    "redact"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkbenchPanelTabs",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/panels.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { WorkbenchPanelTabs } from \"@/components/blocks/agent-workbench/panels\"",
  "props": [
    {
      "name": "panels",
      "type": "readonly WorkbenchPanelDescriptor[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "value",
      "type": "WorkbenchPanelId",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onChange",
      "type": "(id: WorkbenchPanelId) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "execution-output-panel",
  "docPath": "/docs/execution-output-panel/",
  "registryId": "agent-workbench-panels",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "tabs",
    "button",
    "input",
    "redact"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ExecutionOutputPanel",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/panels.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { ExecutionOutputPanel } from \"@/components/blocks/agent-workbench/panels\"",
  "props": [
    {
      "name": "text",
      "type": "string",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "source",
      "type": "string",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "timestamp",
      "type": "string",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "truncated",
      "type": "boolean | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "connected",
      "type": "boolean | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onReconnect",
      "type": "() => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "terminal",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "preview-panel",
  "docPath": "/docs/preview-panel/",
  "registryId": "agent-workbench-panels",
  "registryDependencies": [
    "theme",
    "i18n",
    "agent-workbench-model",
    "tabs",
    "button",
    "input",
    "redact"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "PreviewPanel",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench/panels.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { PreviewPanel } from \"@/components/blocks/agent-workbench/panels\"",
  "props": [
    {
      "name": "url",
      "type": "string | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "allowed",
      "type": "boolean | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "reason",
      "type": "string | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "children",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "agent-workbench",
  "docPath": "/docs/agent-workbench/",
  "registryId": "agent-workbench",
  "registryDependencies": [
    "theme",
    "i18n",
    "utils",
    "workspace-shell",
    "inspector",
    "agent-run-list",
    "attention-queue",
    "button",
    "agent-workbench-model",
    "agent-workbench-navigation",
    "agent-workbench-context",
    "agent-workbench-conversation",
    "agent-workbench-composer",
    "agent-workbench-review",
    "agent-workbench-panels"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "AgentWorkbench",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { AgentWorkbench } from \"@/components/blocks/agent-workbench\"",
  "props": [
    {
      "name": "session",
      "type": "SessionSnapshot",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "layout",
      "type": "WorkbenchLayout",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "panelState",
      "type": "PanelState",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onPanelStateChange",
      "type": "(state: PanelState) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "navigation",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "workspace",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "composer",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "inspector",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "bottom",
      "type": "ReactNode",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "conversation",
      "type": "Omit<AgentConversationProps, \"session\" | \"composer\">",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onRename",
      "type": "(title: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": true,
  "docGroup": "agent",
  "related": [
    "session-navigator",
    "agent-composer",
    "change-review-panel"
  ]
},
{
  "slug": "task-inbox",
  "docPath": "/docs/task-inbox/",
  "registryId": "agent-workbench",
  "registryDependencies": [
    "theme",
    "i18n",
    "utils",
    "workspace-shell",
    "inspector",
    "agent-run-list",
    "attention-queue",
    "button",
    "agent-workbench-model",
    "agent-workbench-navigation",
    "agent-workbench-context",
    "agent-workbench-conversation",
    "agent-workbench-composer",
    "agent-workbench-review",
    "agent-workbench-panels"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "TaskInbox",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "components/blocks/agent-workbench.tsx",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { TaskInbox } from \"@/components/blocks/agent-workbench\"",
  "props": [
    {
      "name": "runs",
      "type": "readonly AgentRunSnapshot[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "attention",
      "type": "readonly AttentionRecord[]",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "selectedRunId",
      "type": "string | undefined",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "onSelect",
      "type": "(runId: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    },
    {
      "name": "onEnter",
      "type": "(runId: string) => void",
      "description": "选择与执行分离；未知结果先查询，确认前保留草稿。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": true,
  "docGroup": "agent",
  "related": [
    "agent-workbench",
    "agent-workbench-model"
  ]
},
{
  "slug": "agent-workbench-model",
  "docPath": "/docs/agent-workbench-model/",
  "registryId": "agent-workbench-model",
  "registryDependencies": [
    "agent-board-model",
    "runtime-status"
  ],
  "installType": "lib",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "AgentWorkbenchModel",
  "category": "组合模块",
  "description": "受控 Agent 工作台区域；服务、权限与来源确认由调用方提供。",
  "source": "lib/agent-workbench-model.ts",
  "example": "components/examples/agent-workbench/component-demos.tsx",
  "usage": "import { draftCanSubmit } from \"@/lib/agent-workbench-model\"",
  "props": [
    {
      "name": "applySessionEvent",
      "type": "(session: SessionSnapshot, event: { sessionId: string; cursor: number; message: WorkbenchMessage }) => SessionSnapshot",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "acknowledgeDraft",
      "type": "(draft: DraftState, receipt: OperationReceipt) => DraftState",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "draftCanSubmit",
      "type": "(session: SessionSnapshot, draft: DraftState, receipts: readonly OperationReceipt[]) => boolean",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "reviewCommentIsCurrent",
      "type": "(changes: ChangeSet, comment: ReviewComment) => boolean",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    },
    {
      "name": "parseWorkbenchQuery",
      "type": "(query: URLSearchParams, sessionIds: readonly string[]) => ReturnType<typeof parseWorkbenchQuery>",
      "description": "稳定对象标识、版本、能力与独立操作回执。"
    }
  ],
  "notes": [
    "本地 fixture 只证明组件交互；真实模型、文件、Git、PTY 与浏览器服务需另行接入。"
  ],
  "widePreview": false,
  "docGroup": "agent",
  "related": [
    "session-navigator",
    "agent-composer",
    "change-review-panel"
  ]
},
  // END agent workbench

  // BEGIN workflow analytics
{
  "slug": "analytics-model",
  "docPath": "/docs/analytics-model/",
  "registryId": "analytics-model",
  "registryDependencies": [],
  "installType": "lib",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "AnalyticsModel",
  "category": "组合模块",
  "description": "带来源身份、历史覆盖、指标版本、筛选交集与下钻快照的纯分析契约。",
  "source": "lib/analytics-model.ts",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { analyticsEntityKey } from \"@/lib/analytics-model\"",
  "props": [
    {
      "name": "AnalyticsQuery",
      "type": "source / scope / measureId / measureVersion / dimension / timeField / range / bucket / timeZone / filters",
      "description": "纯查询描述；筛选逐层取交集，范围采用 [from,to)。"
    },
    {
      "name": "AnalyticsResult",
      "type": "queryKey / snapshotId / asOf / series / coverage / completeness",
      "description": "受控聚合快照，complete/partial/unavailable 不能互相冒充。"
    },
    {
      "name": "WorkflowEvent / HistoryCoverage",
      "type": "source event identity / baseline / coverage / corrections",
      "description": "可选小数据重放；无期初或缺口时不生成趋势。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [
    "lib/analytics-query.ts",
    "lib/analytics-history.ts",
    "lib/analytics-metrics.ts"
  ],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "import { analyticsEntityKey } from \"@/lib/analytics-model\"\nexport const identity = analyticsEntityKey({\n  kind: \"workItem\", sourceId: \"service\", projectId: \"project-1\", entityId: \"item-1\",\n})"
    }
  ]
},
{
  "slug": "chart-model",
  "docPath": "/docs/chart-model/",
  "registryId": "chart-model",
  "registryDependencies": [
    "analytics-model"
  ],
  "installType": "lib",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "ChartModel",
  "category": "组合模块",
  "description": "独立于统计引擎的系列、选择、数值格式与比较模型。",
  "source": "lib/chart-model.ts",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { chartData } from \"@/lib/chart-model\"",
  "props": [
    {
      "name": "ChartSelection",
      "type": "{ seriesId: string; bucketId: string } | null",
      "description": "稳定选择身份；不包含统计引擎事件对象。"
    },
    {
      "name": "chartData / chartDrilldown",
      "type": "AnalyticsResult → ChartDatum[] / DrilldownSelection",
      "description": "纯适配；非有限值转缺失，重复身份报错。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [
    "lib/chart-format.ts"
  ],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "import { chartSeriesColor } from \"@/lib/chart-model\"\nexport const seriesColor = chartSeriesColor(\"1\")\nexport const completedColor = chartSeriesColor(\"1\", \"completed\")"
    }
  ]
},
{
  "slug": "chart-frame",
  "docPath": "/docs/chart-frame/",
  "registryId": "chart-frame",
  "registryDependencies": [
    "theme",
    "i18n",
    "button",
    "data-region",
    "analytics-model",
    "chart-model"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "ChartFrame",
  "category": "基础组件",
  "description": "共享图表标题、口径、范围、权限隔离与五种数据态。",
  "source": "components/ui/chart.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { ChartFrame } from \"@/components/ui/chart\"",
  "props": [
    {
      "name": "title / description",
      "type": "ReactNode",
      "description": "标题与正式口径，保留调用方文案。"
    },
    {
      "name": "query / result",
      "type": "AnalyticsQuery / AnalyticsResult | null",
      "description": "结果 queryKey 必须匹配；切范围不显示旧值。"
    },
    {
      "name": "access",
      "type": "\"allowed\" | \"denied\"",
      "description": "denied 隐藏旧图、数据和操作。"
    },
    {
      "name": "data",
      "type": "Omit<DataRegionProps, \"children\" | \"hasContent\">",
      "description": "独立五种读态、刷新、错误和安全重读。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [
    "components/ui/chart.module.css"
  ],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { ChartFrame } from \"@/components/ui/chart\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof ChartFrame>) {\n  return <ChartFrame {...props} />\n}"
    }
  ]
},
{
  "slug": "chart-data-table",
  "docPath": "/docs/chart-data-table/",
  "registryId": "chart-data-table",
  "registryDependencies": [
    "theme",
    "i18n",
    "data-table",
    "button",
    "chart-model",
    "analytics-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ChartDataTable",
  "category": "组合模块",
  "description": "聚合点的完整结构化表格与键盘下钻路径。",
  "source": "components/blocks/charts/chart-data-table.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { ChartDataTable } from \"@/components/blocks/charts/chart-data-table\"",
  "props": [
    {
      "name": "result",
      "type": "AnalyticsResult",
      "description": "完整聚合点表，保留隐藏系列与缺失值。"
    },
    {
      "name": "selection / onSelect",
      "type": "ChartSelection / (datum: ChartDatum) => void",
      "description": "选中与键盘下钻；没有能力时不显示动作。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { ChartDataTable } from \"@/components/blocks/charts/chart-data-table\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof ChartDataTable>) {\n  return <ChartDataTable {...props} />\n}"
    }
  ]
},
{
  "slug": "statistical-chart",
  "docPath": "/docs/statistical-chart/",
  "registryId": "statistical-chart",
  "registryDependencies": [
    "theme",
    "i18n",
    "button",
    "chart-frame",
    "chart-data-table",
    "chart-model",
    "analytics-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "StatisticalChart",
  "category": "组合模块",
  "description": "按需加载的柱、线、面积、Donut、散点统计渲染器。",
  "source": "components/blocks/charts/statistical-chart.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { StatisticalChart } from \"@/components/blocks/charts/statistical-chart\"",
  "props": [
    {
      "name": "kind / result / query / widgetId",
      "type": "ChartKind / AnalyticsResult | null / AnalyticsQuery / string",
      "description": "五种图形共享快照与稳定选择。"
    },
    {
      "name": "height / stacked / composition",
      "type": "240 | 320 | 400 / boolean / \"exclusive\"",
      "description": "堆叠可选；Donut必须明确互斥组成。"
    },
    {
      "name": "xType / xUnit / domain / references",
      "type": "\"category\" | \"time\" | \"number\" / string / [number,number] / ChartReferenceDefinition[]",
      "description": "连续轴使用实际x；显式数值范围及参考线/区间。"
    },
    {
      "name": "selection / onSelectionChange / onDrilldown",
      "type": "ChartSelection / callbacks",
      "description": "图形、数据表、触屏与键盘产生相同业务描述。"
    },
    {
      "name": "access / data",
      "type": "\"allowed\" | \"denied\" / DataRegion options",
      "description": "权限和新鲜度与数据态分轴。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [
    "components/blocks/charts/statistical-chart.module.css"
  ],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { StatisticalChart } from \"@/components/blocks/charts/statistical-chart\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof StatisticalChart>) {\n  return <StatisticalChart {...props} />\n}"
    }
  ]
},
{
  "slug": "chart-drilldown-panel",
  "docPath": "/docs/chart-drilldown-panel/",
  "registryId": "chart-drilldown-panel",
  "registryDependencies": [
    "theme",
    "i18n",
    "sheet",
    "button",
    "data-table",
    "data-region",
    "analytics-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ChartDrilldownPanel",
  "category": "组合模块",
  "description": "快照匹配、历史成员说明与分页来源记录面板。",
  "source": "components/blocks/charts/chart-drilldown-panel.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { ChartDrilldownPanel } from \"@/components/blocks/charts/chart-drilldown-panel\"",
  "props": [
    {
      "name": "selection / onClose",
      "type": "DrilldownSelection | null / () => void",
      "description": "受控打开/关闭，保留图表选择与筛选。"
    },
    {
      "name": "response",
      "type": "{ queryKey; snapshotId; bucketId; seriesId; records; totalCount }",
      "description": "必须匹配选中快照，分页标已加载/总量。"
    },
    {
      "name": "definition / access / data",
      "type": "ReactNode / \"allowed\" | \"denied\" / DataRegion options",
      "description": "显示口径与历史成员说明；不混淆权限和空集合。"
    },
    {
      "name": "onOpenEntity / onOpenView / onApplyFilter / onLoadMore",
      "type": "optional callbacks",
      "description": "只报告意图；没有能力不显示操作。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { ChartDrilldownPanel } from \"@/components/blocks/charts/chart-drilldown-panel\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof ChartDrilldownPanel>) {\n  return <ChartDrilldownPanel {...props} />\n}"
    }
  ]
},
{
  "slug": "workflow-metric",
  "docPath": "/docs/workflow-metric/",
  "registryId": "workflow-metric",
  "registryDependencies": [
    "theme",
    "i18n",
    "metric-summary",
    "button",
    "chart-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkflowMetric",
  "category": "组合模块",
  "description": "复用 MetricSummary 的口径、基期、覆盖与下钻指标。",
  "source": "components/blocks/analytics/workflow-metric.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { WorkflowMetric } from \"@/components/blocks/analytics/workflow-metric\"",
  "props": [
    {
      "name": "id / label / value / unit / definition",
      "type": "string / ReactNode / number | null / string / ReactNode",
      "description": "复用MetricSummary，null显示不适用。"
    },
    {
      "name": "baseline / partial / onDrilldown",
      "type": "{ value; label } / boolean / () => void",
      "description": "零基期不显示无穷比例；部分数据明确标记。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { WorkflowMetric } from \"@/components/blocks/analytics/workflow-metric\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof WorkflowMetric>) {\n  return <WorkflowMetric {...props} />\n}"
    }
  ]
},
{
  "slug": "workflow-charts",
  "docPath": "/docs/workflow-charts/",
  "registryId": "workflow-charts",
  "registryDependencies": [
    "theme",
    "i18n",
    "statistical-chart"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkflowCharts",
  "category": "组合模块",
  "description": "状态分布、完成趋势、工作项年龄与阻塞分布固定模板。",
  "source": "components/blocks/analytics/workflow-charts.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { StatusDistribution } from \"@/components/blocks/analytics/workflow-charts\"",
  "props": [
    {
      "name": "query / result / widgetId",
      "type": "AnalyticsQuery / AnalyticsResult | null / string",
      "description": "状态、完成趋势、年龄、阻塞四个固定模板。"
    },
    {
      "name": "selection / onSelectionChange / onDrilldown / data / access",
      "type": "WorkflowChartProps",
      "description": "复用统计图表受控交互与读态。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { StatusDistribution } from \"@/components/blocks/analytics/workflow-charts\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof StatusDistribution>) {\n  return <StatusDistribution {...props} />\n}"
    }
  ]
},
{
  "slug": "risk-evidence-list",
  "docPath": "/docs/risk-evidence-list/",
  "registryId": "risk-evidence-list",
  "registryDependencies": [
    "theme",
    "i18n",
    "analytics-model",
    "data-table",
    "button"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "RiskEvidenceList",
  "category": "组合模块",
  "description": "可解释的逾期、阻塞、缺日期与年龄事实列表。",
  "source": "components/blocks/analytics/risk-evidence-list.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { RiskEvidenceList } from \"@/components/blocks/analytics/risk-evidence-list\"",
  "props": [
    {
      "name": "evidence",
      "type": "readonly RiskEvidence[]",
      "description": "每条有rule/threshold/asOf/source/entityRef；不是健康总分。"
    },
    {
      "name": "onOpenEntity",
      "type": "(ref: AnalyticsEntityRef) => void",
      "description": "可选来源对象入口。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { RiskEvidenceList } from \"@/components/blocks/analytics/risk-evidence-list\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof RiskEvidenceList>) {\n  return <RiskEvidenceList {...props} />\n}"
    }
  ]
},
{
  "slug": "work-traceability-view",
  "docPath": "/docs/work-traceability-view/",
  "registryId": "work-traceability-view",
  "registryDependencies": [
    "theme",
    "i18n",
    "analytics-model",
    "data-table",
    "button",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkTraceabilityView",
  "category": "组合模块",
  "description": "区分 Idea、工作项、Session、Run、Artifact 的有类型关联表。",
  "source": "components/blocks/analytics/work-traceability-view.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { WorkTraceabilityView } from \"@/components/blocks/analytics/work-traceability-view\"",
  "props": [
    {
      "name": "relations",
      "type": "readonly AnalyticsRelation[]",
      "description": "区分trace/contains/blocks/execution-parent/idea-link。"
    },
    {
      "name": "onSelectEntity / data",
      "type": "optional callback / DataRegion options",
      "description": "受控对象选择与五种读态。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { WorkTraceabilityView } from \"@/components/blocks/analytics/work-traceability-view\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof WorkTraceabilityView>) {\n  return <WorkTraceabilityView {...props} />\n}"
    }
  ]
},
{
  "slug": "work-items-view-adapter",
  "docPath": "/docs/work-items-view-adapter/",
  "registryId": "work-items-view-adapter",
  "registryDependencies": [
    "theme",
    "i18n",
    "analytics-model",
    "work-items-workspace"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "WorkItemsViewAdapter",
  "category": "组合模块",
  "description": "保留业务能力的分析快照到工作项五布局适配。",
  "source": "components/blocks/analytics/work-items-view-adapter.tsx",
  "example": "components/examples/workflow-analytics/workflow-analytics-demo.tsx",
  "usage": "import { WorkItemsViewAdapter } from \"@/components/blocks/analytics/work-items-view-adapter\"",
  "props": [
    {
      "name": "selection / snapshotId / workspace",
      "type": "DrilldownSelection / string / WorkItemsWorkspaceProps",
      "description": "同快照成员映射到已有五布局，原业务能力保持。"
    },
    {
      "name": "access",
      "type": "\"allowed\" | \"denied\"",
      "description": "撤权后隐藏整个工作区。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { WorkItemsViewAdapter } from \"@/components/blocks/analytics/work-items-view-adapter\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof WorkItemsViewAdapter>) {\n  return <WorkItemsViewAdapter {...props} />\n}"
    }
  ]
},
{
  "slug": "dashboard",
  "docPath": "/docs/dashboard/",
  "registryId": "dashboard",
  "registryDependencies": [
    "theme",
    "i18n",
    "analytics-model",
    "workspace-shell",
    "filter-toolbar",
    "button",
    "sheet",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "Dashboard",
  "category": "组合模块",
  "description": "固定响应网格、独立 Widget、口径查看与受控工具栏。",
  "source": "components/blocks/dashboard/dashboard.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { DashboardGrid } from \"@/components/blocks/dashboard/dashboard\"",
  "props": [
    {
      "name": "DashboardShell.header / toolbar / sidebar / children",
      "type": "ReactNode",
      "description": "复用WorkspaceShell，填充有明确高度的父容器。"
    },
    {
      "name": "DashboardFilterBar",
      "type": "FilterToolbarProps",
      "description": "受控范围、成员、刷新与数据时间；筛选归调用方。"
    },
    {
      "name": "DashboardWidget.id / title / width / data",
      "type": "string / string / 6 | 12 / DataRegion options",
      "description": "桌面12列、中屏6列、窄屏单列；独立读态。"
    },
    {
      "name": "WidgetActions / WidgetInspector",
      "type": "optional callbacks / controlled open query result definition",
      "description": "口径与允许导出；不显示无法保存的编辑。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [
    "lib/dashboard-model.ts",
    "components/blocks/dashboard/dashboard.module.css"
  ],
  "widePreview": true,
  "docGroup": "workspace",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { DashboardGrid } from \"@/components/blocks/dashboard/dashboard\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof DashboardGrid>) {\n  return <DashboardGrid {...props} />\n}"
    }
  ]
},
{
  "slug": "project-overview-dashboard",
  "docPath": "/docs/project-overview-dashboard/",
  "registryId": "project-overview-dashboard",
  "registryDependencies": [
    "theme",
    "i18n",
    "analytics-model",
    "chart-model",
    "chart-frame",
    "dashboard",
    "workflow-metric",
    "workflow-charts",
    "risk-evidence-list"
  ],
  "installType": "block",
  "displayCategory": "workspace",
  "availability": "available",
  "name": "ProjectOverviewDashboard",
  "category": "组合模块",
  "description": "组合状态、趋势、年龄、阻塞、指标和风险事实的固定项目模板。",
  "source": "components/blocks/dashboard/project-overview-dashboard.tsx",
  "example": "components/examples/workflow-analytics/component-demos.tsx",
  "usage": "import { ProjectOverviewDashboard } from \"@/components/blocks/dashboard/project-overview-dashboard\"",
  "props": [
    {
      "name": "widgets",
      "type": "readonly ProjectOverviewWidget[]",
      "description": "每项有稳定id/query/result及独立data态。"
    },
    {
      "name": "riskEvidence / access",
      "type": "readonly RiskEvidence[] / \"allowed\" | \"denied\"",
      "description": "受控风险事实；撤权隐藏数据区域。"
    },
    {
      "name": "selection / onSelectionChange / onDrilldown / onOpenEntity / onExport",
      "type": "controlled value / optional callbacks",
      "description": "点选默认只开来源，导出和查询由调用方执行。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务接入；权限、历史、查询、写入和持久化由调用方负责。",
    "时间采用 [from,to)，缺失不当零；图例不改分母，点选默认只开下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "workspace",
  "variants": [
    {
      "title": {
        "zh-CN": "调用方控制的输入",
        "en": "Caller-controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { ProjectOverviewDashboard } from \"@/components/blocks/dashboard/project-overview-dashboard\"\n// The caller supplies the complete snapshot and operation callbacks.\nexport function Example(props: ComponentProps<typeof ProjectOverviewDashboard>) {\n  return <ProjectOverviewDashboard {...props} />\n}"
    }
  ]
},
  {
  "slug": "analytics-resource-model",
  "docPath": "/docs/analytics-resource-model/",
  "registryId": "analytics-resource-model",
  "registryDependencies": [
    "analytics-model",
    "agent-board-model"
  ],
  "installType": "lib",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "computeWorkload",
  "category": "组合模块",
  "description": "显式资源份额、容量与执行区间；父子用量去重并保留币种。",
  "source": "lib/analytics-resource-model.ts",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { computeWorkload } from \"@/lib/analytics-resource-model\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "显式资源份额、容量与执行区间；父子用量去重并保留币种。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [
    "lib/analytics-usage-model.ts"
  ],
  "widePreview": false,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "import { computeWorkload } from \"@/lib/analytics-resource-model\"\nexport const api = computeWorkload"
    }
  ]
},
  {
  "slug": "analytics-history-metrics",
  "docPath": "/docs/analytics-history-metrics/",
  "registryId": "analytics-history-metrics",
  "registryDependencies": [
    "analytics-model"
  ],
  "installType": "lib",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "computeHistoricalMetric",
  "category": "组合模块",
  "description": "历史燃尽、燃起、速度、累积流、周期时间与条件化预测模型。",
  "source": "lib/analytics-history-metrics.ts",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { computeHistoricalMetric } from \"@/lib/analytics-history-metrics\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "历史燃尽、燃起、速度、累积流、周期时间与条件化预测模型。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [
    "lib/analytics-forecast-model.ts"
  ],
  "widePreview": false,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "import { computeHistoricalMetric } from \"@/lib/analytics-history-metrics\"\nexport const api = computeHistoricalMetric"
    }
  ]
},
  {
  "slug": "analytics-builder-model",
  "docPath": "/docs/analytics-builder-model/",
  "registryId": "analytics-builder-model",
  "registryDependencies": [
    "analytics-model",
    "chart-model"
  ],
  "installType": "lib",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "validateAnalyticsBuilder",
  "category": "组合模块",
  "description": "按指标版本校验维度、分段、单位与图型，固定调用方权限范围。",
  "source": "lib/analytics-builder-model.ts",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { validateAnalyticsBuilder } from \"@/lib/analytics-builder-model\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "按指标版本校验维度、分段、单位与图型，固定调用方权限范围。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": false,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "import { validateAnalyticsBuilder } from \"@/lib/analytics-builder-model\"\nexport const api = validateAnalyticsBuilder"
    }
  ]
},
  {
  "slug": "dashboard-edit-session",
  "docPath": "/docs/dashboard-edit-session/",
  "registryId": "dashboard-edit-session",
  "registryDependencies": [
    "dashboard",
    "analytics-model"
  ],
  "installType": "lib",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "DashboardEditSession",
  "category": "组合模块",
  "description": "可保留的布局草稿与带操作编号、版本的保存回执；unknown 先核对。",
  "source": "lib/dashboard-edit-session.ts",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { DashboardEditSession } from \"@/lib/dashboard-edit-session\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "可保留的布局草稿与带操作编号、版本的保存回执；unknown 先核对。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": false,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "import { DashboardEditSession } from \"@/lib/dashboard-edit-session\"\nexport const api = DashboardEditSession"
    }
  ]
},
  {
  "slug": "analytics-image-export",
  "docPath": "/docs/analytics-image-export/",
  "registryId": "analytics-image-export",
  "registryDependencies": [
    "analytics-model"
  ],
  "installType": "lib",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "analyticsSvgExport",
  "category": "组合模块",
  "description": "由调用方触发，导出当前授权聚合 SVG 及口径和模拟标记。",
  "source": "lib/analytics-image-export.ts",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { analyticsSvgExport } from \"@/lib/analytics-image-export\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "由调用方触发，导出当前授权聚合 SVG 及口径和模拟标记。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": false,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "import { analyticsSvgExport } from \"@/lib/analytics-image-export\"\nexport const api = analyticsSvgExport"
    }
  ]
},
  {
  "slug": "heatmap",
  "docPath": "/docs/heatmap/",
  "registryId": "heatmap",
  "registryDependencies": [
    "theme",
    "i18n",
    "button",
    "data-table",
    "analytics-resource-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "Heatmap",
  "category": "组合模块",
  "description": "资源热图与 HeatmapLegend；已知、未知、零容量与超载分离。",
  "source": "components/blocks/charts/heatmap.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { Heatmap } from \"@/components/blocks/charts/heatmap\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "资源热图与 HeatmapLegend；已知、未知、零容量与超载分离。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [
    "components/blocks/charts/heatmap.module.css"
  ],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { Heatmap } from \"@/components/blocks/charts/heatmap\"\nexport function Example(props: ComponentProps<typeof Heatmap>) {\n  return <Heatmap {...props} />\n}"
    }
  ]
},
  {
  "slug": "resource-allocation-view",
  "docPath": "/docs/resource-allocation-view/",
  "registryId": "resource-allocation-view",
  "registryDependencies": [
    "heatmap",
    "data-table",
    "button",
    "i18n"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ResourceAllocationView",
  "category": "组合模块",
  "description": "人员日期单元到显式分配清单与排期回调。",
  "source": "components/blocks/analytics/resource-allocation-view.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { ResourceAllocationView } from \"@/components/blocks/analytics/resource-allocation-view\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "人员日期单元到显式分配清单与排期回调。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { ResourceAllocationView } from \"@/components/blocks/analytics/resource-allocation-view\"\nexport function Example(props: ComponentProps<typeof ResourceAllocationView>) {\n  return <ResourceAllocationView {...props} />\n}"
    }
  ]
},
  {
  "slug": "agent-execution-timeline",
  "docPath": "/docs/agent-execution-timeline/",
  "registryId": "agent-execution-timeline",
  "registryDependencies": [
    "timeline",
    "runtime-status-badge",
    "button",
    "data-table",
    "i18n",
    "analytics-resource-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "AgentExecutionTimeline",
  "category": "组合模块",
  "description": "实际时间戳区间与可访问数据表，运行和验收状态分离。",
  "source": "components/blocks/analytics/agent-execution-timeline.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { AgentExecutionTimeline } from \"@/components/blocks/analytics/agent-execution-timeline\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "实际时间戳区间与可访问数据表，运行和验收状态分离。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [
    "components/blocks/analytics/agent-execution-timeline.module.css"
  ],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { AgentExecutionTimeline } from \"@/components/blocks/analytics/agent-execution-timeline\"\nexport function Example(props: ComponentProps<typeof AgentExecutionTimeline>) {\n  return <AgentExecutionTimeline {...props} />\n}"
    }
  ]
},
  {
  "slug": "workflow-history-charts",
  "docPath": "/docs/workflow-history-charts/",
  "registryId": "workflow-history-charts",
  "registryDependencies": [
    "statistical-chart",
    "analytics-history-metrics",
    "i18n"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "BurndownChart",
  "category": "组合模块",
  "description": "Burndown/Burnup/Velocity/CFD/CycleTime/StateResidence/Workload/AgentCost 模板，保留专业口径。",
  "source": "components/blocks/charts/workflow-history-charts.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { BurndownChart } from \"@/components/blocks/charts/workflow-history-charts\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "Burndown/Burnup/Velocity/CFD/CycleTime/StateResidence/Workload/AgentCost 模板，保留专业口径。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { BurndownChart } from \"@/components/blocks/charts/workflow-history-charts\"\nexport function Example(props: ComponentProps<typeof BurndownChart>) {\n  return <BurndownChart {...props} />\n}"
    }
  ]
},
  {
  "slug": "forecast-chart",
  "docPath": "/docs/forecast-chart/",
  "registryId": "forecast-chart",
  "registryDependencies": [
    "data-table",
    "button",
    "i18n",
    "analytics-history-metrics"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ForecastChart",
  "category": "组合模块",
  "description": "条件化分位区间、模型版本、样本与滚动回测；仅下钻历史或待完成项。",
  "source": "components/blocks/charts/forecast-chart.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { ForecastChart } from \"@/components/blocks/charts/forecast-chart\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "条件化分位区间、模型版本、样本与滚动回测；仅下钻历史或待完成项。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { ForecastChart } from \"@/components/blocks/charts/forecast-chart\"\nexport function Example(props: ComponentProps<typeof ForecastChart>) {\n  return <ForecastChart {...props} />\n}"
    }
  ]
},
  {
  "slug": "agent-operations-dashboard",
  "docPath": "/docs/agent-operations-dashboard/",
  "registryId": "agent-operations-dashboard",
  "registryDependencies": [
    "agent-execution-timeline",
    "agent-usage-summary",
    "i18n"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "AgentOperationsDashboard",
  "category": "组合模块",
  "description": "执行区间、验收与授权用量的只读组合。",
  "source": "components/blocks/analytics/agent-operations-dashboard.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { AgentOperationsDashboard } from \"@/components/blocks/analytics/agent-operations-dashboard\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "执行区间、验收与授权用量的只读组合。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { AgentOperationsDashboard } from \"@/components/blocks/analytics/agent-operations-dashboard\"\nexport function Example(props: ComponentProps<typeof AgentOperationsDashboard>) {\n  return <AgentOperationsDashboard {...props} />\n}"
    }
  ]
},
  {
  "slug": "work-dependency-view",
  "docPath": "/docs/work-dependency-view/",
  "registryId": "work-dependency-view",
  "registryDependencies": [
    "workflow-canvas",
    "data-table",
    "button",
    "i18n",
    "analytics-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkDependencyView",
  "category": "组合模块",
  "description": "复用只读 Canvas 与完整关系表；显式业务依赖，强连通分量检测真实环路。",
  "source": "components/blocks/analytics/work-dependency-view.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { WorkDependencyView } from \"@/components/blocks/analytics/work-dependency-view\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "复用只读 Canvas 与完整关系表；显式业务依赖，强连通分量检测真实环路。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [
    "lib/analytics-dependency-model.ts"
  ],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { WorkDependencyView } from \"@/components/blocks/analytics/work-dependency-view\"\nexport function Example(props: ComponentProps<typeof WorkDependencyView>) {\n  return <WorkDependencyView {...props} />\n}"
    }
  ]
},
  {
  "slug": "dashboard-layout-editor",
  "docPath": "/docs/dashboard-layout-editor/",
  "registryId": "dashboard-layout-editor",
  "registryDependencies": [
    "dashboard-edit-session",
    "dashboard",
    "button",
    "i18n"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "DashboardLayoutEditor",
  "category": "组合模块",
  "description": "受控布局编辑与 WidgetPicker，键盘重排、有限尺寸、可核对保存。",
  "source": "components/blocks/dashboard/dashboard-layout-editor.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { DashboardLayoutEditor } from \"@/components/blocks/dashboard/dashboard-layout-editor\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "受控布局编辑与 WidgetPicker，键盘重排、有限尺寸、可核对保存。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { DashboardLayoutEditor } from \"@/components/blocks/dashboard/dashboard-layout-editor\"\nexport function Example(props: ComponentProps<typeof DashboardLayoutEditor>) {\n  return <DashboardLayoutEditor {...props} />\n}"
    }
  ]
},
  {
  "slug": "analytics-builder",
  "docPath": "/docs/analytics-builder/",
  "registryId": "analytics-builder",
  "registryDependencies": [
    "analytics-builder-model",
    "statistical-chart",
    "button",
    "i18n"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "AnalyticsBuilder",
  "category": "组合模块",
  "description": "受控类型化查询配置，匹配预览后应用，取消保留已应用分析。",
  "source": "components/blocks/analytics/analytics-builder.tsx",
  "example": "components/examples/workflow-analytics/advanced-demos.tsx",
  "usage": "import { AnalyticsBuilder } from \"@/components/blocks/analytics/analytics-builder\"",
  "props": [
    {
      "name": "input / result / callbacks",
      "type": "typed controlled contract",
      "description": "受控类型化查询配置，匹配预览后应用，取消保留已应用分析。"
    }
  ],
  "notes": [
    "本地示例不证明真实服务；来源、权限、执行、保存与预测可信度由调用方负责。",
    "未知不当零，时间范围为 [from,to)，点选默认只下钻。"
  ],
  "relatedSources": [],
  "widePreview": true,
  "docGroup": "data",
  "variants": [
    {
      "title": {
        "zh-CN": "受控输入",
        "en": "Controlled input"
      },
      "code": "\"use client\"\nimport type { ComponentProps } from \"react\"\nimport { AnalyticsBuilder } from \"@/components/blocks/analytics/analytics-builder\"\nexport function Example(props: ComponentProps<typeof AnalyticsBuilder>) {\n  return <AnalyticsBuilder {...props} />\n}"
    }
  ]
},
  // END workflow analytics
// BEGIN shadcn completion
{
  "slug": "button-group",
  "docPath": "/docs/button-group/",
  "registryId": "button-group",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "ButtonGroup",
  "category": "基础组件",
  "description": "同组操作的紧凑容器。",
  "source": "components/ui/button-group.tsx",
  "example": "components/examples/control-composition-demo.tsx",
  "usage": "import { ButtonGroup } from \"@/components/ui/button-group\"",
  "props": [
    {
      "name": "orientation / children / aria-label",
      "type": "ButtonGroupProps",
      "description": "只组合兄弟操作目标，不引入选中状态。"
    }
  ],
  "notes": [
    "只组合兄弟操作目标，不引入选中状态。"
  ]
},
{
  "slug": "input-group",
  "docPath": "/docs/input-group/",
  "registryId": "input-group",
  "registryDependencies": [
    "theme",
    "utils",
    "input",
    "textarea"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "InputGroup",
  "category": "基础组件",
  "description": "输入与前后缀、操作的组合。",
  "source": "components/ui/input-group.tsx",
  "example": "components/examples/control-composition-demo.tsx",
  "usage": "import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from \"@/components/ui/input-group\"",
  "props": [
    {
      "name": "children / className",
      "type": "InputGroupProps",
      "description": "标签由原生输入负责；附加操作保持独立。"
    }
  ],
  "notes": [
    "标签由原生输入负责；附加操作保持独立。"
  ]
},
{
  "slug": "toggle",
  "docPath": "/docs/toggle/",
  "registryId": "toggle",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Toggle",
  "category": "基础组件",
  "description": "支持按下状态的切换按钮。",
  "source": "components/ui/toggle.tsx",
  "example": "components/examples/control-composition-demo.tsx",
  "usage": "import { Toggle } from \"@/components/ui/toggle\"",
  "props": [
    {
      "name": "pressed / defaultPressed / onPressedChange / disabled",
      "type": "ToggleProps",
      "description": "按下与焦点独立；值由调用方持有。"
    }
  ],
  "notes": [
    "按下与焦点独立；值由调用方持有。"
  ]
},
{
  "slug": "toggle-group",
  "docPath": "/docs/toggle-group/",
  "registryId": "toggle-group",
  "registryDependencies": [
    "theme",
    "utils",
    "toggle"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "ToggleGroup",
  "category": "基础组件",
  "description": "单选或多选切换组。",
  "source": "components/ui/toggle-group.tsx",
  "example": "components/examples/control-composition-demo.tsx",
  "usage": "import { ToggleGroup, ToggleGroupItem } from \"@/components/ui/toggle-group\"",
  "props": [
    {
      "name": "value / defaultValue / multiple / orientation / onValueChange",
      "type": "ToggleGroupProps",
      "description": "值始终为数组；方向键移动焦点。"
    }
  ],
  "notes": [
    "值始终为数组；方向键移动焦点。"
  ]
},
{
  "slug": "input-otp",
  "docPath": "/docs/input-otp/",
  "registryId": "input-otp",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "InputOTP",
  "category": "基础组件",
  "description": "原生一次性验证码输入。",
  "source": "components/ui/input-otp.tsx",
  "example": "components/examples/control-composition-demo.tsx",
  "usage": "import { InputOTP } from \"@/components/ui/input-otp\"",
  "props": [
    {
      "name": "length / value / defaultValue / pattern / name / form / ref",
      "type": "InputOTPProps",
      "description": "保留原生粘贴、选择、删除、自动填充及表单行为；验证由调用方负责。"
    }
  ],
  "notes": [
    "保留原生粘贴、选择、删除、自动填充及表单行为；验证由调用方负责。"
  ]
},
{
  "slug": "separator",
  "docPath": "/docs/separator/",
  "registryId": "separator",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Separator",
  "category": "基础组件",
  "description": "语义或装饰性分隔线。",
  "source": "components/ui/separator.tsx",
  "example": "components/examples/disclosure-demo.tsx",
  "usage": "import { Separator } from \"@/components/ui/separator\"",
  "props": [
    {
      "name": "orientation / decorative",
      "type": "SeparatorProps",
      "description": "装饰性分隔默认不进入无障碍树。"
    }
  ],
  "notes": [
    "装饰性分隔默认不进入无障碍树。"
  ]
},
{
  "slug": "collapsible",
  "docPath": "/docs/collapsible/",
  "registryId": "collapsible",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Collapsible",
  "category": "基础组件",
  "description": "受控或非受控内容折叠。",
  "source": "components/ui/collapsible.tsx",
  "example": "components/examples/disclosure-demo.tsx",
  "usage": "import { Collapsible, CollapsibleTrigger, CollapsibleContent } from \"@/components/ui/collapsible\"",
  "props": [
    {
      "name": "open / defaultOpen / onOpenChange",
      "type": "CollapsibleProps",
      "description": "展开与业务选择分开；触发器保持键盘与焦点关联。"
    }
  ],
  "notes": [
    "展开与业务选择分开；触发器保持键盘与焦点关联。"
  ]
},
{
  "slug": "accordion",
  "docPath": "/docs/accordion/",
  "registryId": "accordion",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Accordion",
  "category": "基础组件",
  "description": "单项或多项展开的手风琴。",
  "source": "components/ui/accordion.tsx",
  "example": "components/examples/disclosure-demo.tsx",
  "usage": "import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from \"@/components/ui/accordion\"",
  "props": [
    {
      "name": "value / defaultValue / multiple / onValueChange",
      "type": "AccordionProps",
      "description": "每个标题有独立触发器；禁用项不展开。"
    }
  ],
  "notes": [
    "每个标题有独立触发器；禁用项不展开。"
  ]
},
{
  "slug": "tooltip",
  "docPath": "/docs/tooltip/",
  "registryId": "tooltip",
  "registryDependencies": ["theme","utils","theme-boundary","overlay-layer"],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Tooltip",
  "category": "基础组件",
  "description": "支持悬停和焦点的补充提示。",
  "source": "components/ui/tooltip.tsx",
  "example": "components/examples/disclosure-demo.tsx",
  "usage": "import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from \"@/components/ui/tooltip\"",
  "props": [
    {
      "name": "open / defaultOpen / delay / side / align",
      "type": "TooltipProps",
      "description": "提示不承担关键操作；浮层进入当前主题边界。"
    }
  ],
  "notes": [
    "提示不承担关键操作；浮层进入当前主题边界。"
  ]
},
{
  "slug": "alert-dialog",
  "docPath": "/docs/alert-dialog/",
  "registryId": "alert-dialog",
  "registryDependencies": ["theme","utils","theme-boundary","overlay-layer"],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "AlertDialog",
  "category": "基础组件",
  "description": "显式确认请求的模态对话框。",
  "source": "components/ui/alert-dialog.tsx",
  "example": "components/examples/disclosure-demo.tsx",
  "usage": "import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from \"@/components/ui/alert-dialog\"",
  "props": [
    {
      "name": "open / onOpenChange / initialFocus / children",
      "type": "AlertDialogProps",
      "description": "确认按钮由调用方提供；请求返回不代表操作完成。"
    }
  ],
  "notes": [
    "确认按钮由调用方提供；请求返回不代表操作完成。"
  ]
},
{
  "slug": "hover-card",
  "docPath": "/docs/hover-card/",
  "registryId": "hover-card",
  "registryDependencies": [
    "theme",
    "utils",
    "theme-boundary"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "HoverCard",
  "category": "基础组件",
  "description": "链接的补充预览层。",
  "source": "components/ui/hover-card.tsx",
  "example": "components/examples/disclosure-demo.tsx",
  "usage": "import { HoverCard, HoverCardTrigger, HoverCardContent } from \"@/components/ui/hover-card\"",
  "props": [
    {
      "name": "open / defaultOpen / delay / side / align",
      "type": "HoverCardProps",
      "description": "重要内容需通过链接或可见按钮到达；预览不是唯一入口。"
    }
  ],
  "notes": [
    "重要内容需通过链接或可见按钮到达；预览不是唯一入口。"
  ]
},
{
  "slug": "context-menu",
  "docPath": "/docs/context-menu/",
  "registryId": "context-menu",
  "registryDependencies": [
    "theme",
    "utils",
    "theme-boundary",
    "menu",
    "dropdown-menu"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "ContextMenu",
  "category": "基础组件",
  "description": "右键、键盘与长按的上下文动作。",
  "source": "components/ui/context-menu.tsx",
  "example": "components/examples/disclosure-demo.tsx",
  "usage": "import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from \"@/components/ui/context-menu\"",
  "props": [
    {
      "name": "open / onOpenChange / children",
      "type": "ContextMenuProps",
      "description": "提供可见菜单替代以支持触摸；动作仅由回调触发。"
    }
  ],
  "notes": [
    "提供可见菜单替代以支持触摸；动作仅由回调触发。"
  ]
},
{
  "slug": "skeleton",
  "docPath": "/docs/skeleton/",
  "registryId": "skeleton",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Skeleton",
  "category": "基础组件",
  "description": "结构相符的静态加载占位。",
  "source": "components/ui/skeleton.tsx",
  "example": "components/examples/feedback-demo.tsx",
  "usage": "import { Skeleton } from \"@/components/ui/skeleton\"",
  "props": [
    {
      "name": "className / style",
      "type": "SkeletonProps",
      "description": "加载语义由外层区域负责；减少动效下无闪烁。"
    }
  ],
  "notes": [
    "加载语义由外层区域负责；减少动效下无闪烁。"
  ]
},
{
  "slug": "spinner",
  "docPath": "/docs/spinner/",
  "registryId": "spinner",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Spinner",
  "category": "基础组件",
  "description": "附带可读文本的忙碌指示。",
  "source": "components/ui/spinner.tsx",
  "example": "components/examples/feedback-demo.tsx",
  "usage": "import { Spinner } from \"@/components/ui/spinner\"",
  "props": [
    {
      "name": "label / className",
      "type": "SpinnerProps",
      "description": "减少动效时停止旋转，保持状态文字。"
    }
  ],
  "notes": [
    "减少动效时停止旋转，保持状态文字。"
  ]
},
{
  "slug": "empty",
  "docPath": "/docs/empty/",
  "registryId": "empty",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Empty",
  "category": "基础组件",
  "description": "说明空态原因与下一步。",
  "source": "components/ui/empty.tsx",
  "example": "components/examples/feedback-demo.tsx",
  "usage": "import { Empty } from \"@/components/ui/empty\"",
  "props": [
    {
      "name": "title / description / icon / action",
      "type": "EmptyProps",
      "description": "操作由调用方提供；不把错误展示为空数据。"
    }
  ],
  "notes": [
    "操作由调用方提供；不把错误展示为空数据。"
  ]
},
{
  "slug": "alert",
  "docPath": "/docs/alert/",
  "registryId": "alert",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Alert",
  "category": "基础组件",
  "description": "内联信息、警告与错误反馈。",
  "source": "components/ui/alert.tsx",
  "example": "components/examples/feedback-demo.tsx",
  "usage": "import { Alert, AlertTitle, AlertDescription } from \"@/components/ui/alert\"",
  "props": [
    {
      "name": "tone / urgent / children",
      "type": "AlertProps",
      "description": "即时错误用 alert，常规通知用 status；不改变运行状态。"
    }
  ],
  "notes": [
    "即时错误用 alert，常规通知用 status；不改变运行状态。"
  ]
},
{
  "slug": "progress",
  "docPath": "/docs/progress/",
  "registryId": "progress",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Progress",
  "category": "基础组件",
  "description": "确定或未知总量的任务进度。",
  "source": "components/ui/progress.tsx",
  "example": "components/examples/feedback-demo.tsx",
  "usage": "import { Progress, Meter } from \"@/components/ui/progress\"",
  "props": [
    {
      "name": "value / min / max / label / aria-label",
      "type": "ProgressProps",
      "description": "未知进度不提供伪造百分比；测量值使用 Meter。"
    }
  ],
  "notes": [
    "未知进度不提供伪造百分比；测量值使用 Meter。"
  ]
},
{
  "slug": "toast",
  "docPath": "/docs/toast/",
  "registryId": "toast",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n",
    "theme-boundary",
    "button"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Toast",
  "category": "基础组件",
  "description": "统一、可更新和关闭的通知体系。",
  "source": "components/ui/toast.tsx",
  "example": "components/examples/feedback-demo.tsx",
  "usage": "import { ToastProvider, Toaster, useToastManager, createToastManager } from \"@/components/ui/toast\"",
  "props": [
    {
      "name": "timeout / limit / toastManager / add / update / close",
      "type": "ToastProps",
      "description": "通知仅表达调用方已知事实，不根据请求返回推断业务完成。"
    }
  ],
  "notes": [
    "通知仅表达调用方已知事实，不根据请求返回推断业务完成。"
  ]
},
{
  "slug": "sonner",
  "docPath": "/docs/sonner/",
  "registryId": "sonner",
  "registryDependencies": [
    "toast"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Sonner",
  "category": "基础组件",
  "description": "复用 Toast 的通知适配入口。",
  "source": "components/ui/sonner.tsx",
  "example": "components/examples/feedback-demo.tsx",
  "usage": "import { ToastProvider, Toaster, useToastManager } from \"@/components/ui/sonner\"",
  "props": [
    {
      "name": "ToastProvider / Toaster / useToastManager",
      "type": "SonnerProps",
      "description": "使用同一 Provider 与 Toaster；不承诺 Sonner 包的 API 兼容。"
    }
  ],
  "notes": [
    "使用同一 Provider 与 Toaster；不承诺 Sonner 包的 API 兼容。"
  ]
},
{
  "slug": "date-calendar",
  "docPath": "/docs/date-calendar/",
  "registryId": "date-calendar",
  "registryDependencies": [
    "theme",
    "utils",
    "button",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "DateCalendar",
  "category": "基础组件",
  "description": "按民用日期键选择单日或范围。",
  "source": "components/ui/date-calendar.tsx",
  "example": "components/examples/date-navigation-demo.tsx",
  "usage": "import { DateCalendar } from \"@/components/ui/date-calendar\"",
  "props": [
    {
      "name": "mode / value / defaultValue / month / onMonthChange / isDateDisabled / min / max",
      "type": "DateCalendarProps",
      "description": "使用 YYYY-MM-DD 与 UTC 日历运算；禁用日期不可选择，范围内禁用日会阻止完成。"
    }
  ],
  "notes": [
    "使用 YYYY-MM-DD 与 UTC 日历运算；禁用日期不可选择，范围内禁用日会阻止完成。"
  ]
},
{
  "slug": "date-picker",
  "docPath": "/docs/date-picker/",
  "registryId": "date-picker",
  "registryDependencies": [
    "date-calendar",
    "popover",
    "button",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "DatePicker",
  "category": "基础组件",
  "description": "日期日历与弹出层的组合。",
  "source": "components/ui/date-picker.tsx",
  "example": "components/examples/date-navigation-demo.tsx",
  "usage": "import { DatePicker } from \"@/components/ui/date-picker\"",
  "props": [
    {
      "name": "label / mode / value / onValueChange / disabled",
      "type": "DatePickerProps",
      "description": "单日或完整范围选择后关闭并恢复焦点；日期值不因语言或时区变化。"
    }
  ],
  "notes": [
    "单日或完整范围选择后关闭并恢复焦点；日期值不因语言或时区变化。"
  ]
},
{
  "slug": "pagination",
  "docPath": "/docs/pagination/",
  "registryId": "pagination",
  "registryDependencies": [
    "theme",
    "utils",
    "button",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Pagination",
  "category": "基础组件",
  "description": "受控分页请求与未知总数导航。",
  "source": "components/ui/pagination.tsx",
  "example": "components/examples/date-navigation-demo.tsx",
  "usage": "import { Pagination } from \"@/components/ui/pagination\"",
  "props": [
    {
      "name": "page / pageCount / hasNext / onPageChange",
      "type": "PaginationProps",
      "description": "只请求页码变化；未知总数依赖 hasNext，不推断最后一页。"
    }
  ],
  "notes": [
    "只请求页码变化；未知总数依赖 hasNext，不推断最后一页。"
  ]
},
{
  "slug": "breadcrumb",
  "docPath": "/docs/breadcrumb/",
  "registryId": "breadcrumb",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Breadcrumb",
  "category": "基础组件",
  "description": "路径层级与当前页面导航。",
  "source": "components/ui/breadcrumb.tsx",
  "example": "components/examples/date-navigation-demo.tsx",
  "usage": "import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from \"@/components/ui/breadcrumb\"",
  "props": [
    {
      "name": "children / aria-label",
      "type": "BreadcrumbProps",
      "description": "导航使用链接；当前页面使用 aria-current。"
    }
  ],
  "notes": [
    "导航使用链接；当前页面使用 aria-current。"
  ]
},
{
  "slug": "menubar",
  "docPath": "/docs/menubar/",
  "registryId": "menubar",
  "registryDependencies": [
    "theme",
    "utils",
    "menu",
    "dropdown-menu"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Menubar",
  "category": "基础组件",
  "description": "桌面应用菜单栏与动作菜单。",
  "source": "components/ui/menubar.tsx",
  "example": "components/examples/date-navigation-demo.tsx",
  "usage": "import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from \"@/components/ui/menubar\"",
  "props": [
    {
      "name": "orientation / loopFocus / children",
      "type": "MenubarProps",
      "description": "键盘跨菜单导航由 Base UI 管理；禁用动作不执行。"
    }
  ],
  "notes": [
    "键盘跨菜单导航由 Base UI 管理；禁用动作不执行。"
  ]
},
{
  "slug": "navigation-menu",
  "docPath": "/docs/navigation-menu/",
  "registryId": "navigation-menu",
  "registryDependencies": [
    "theme",
    "utils",
    "theme-boundary"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "NavigationMenu",
  "category": "基础组件",
  "description": "站点层级导航与链接浮层。",
  "source": "components/ui/navigation-menu.tsx",
  "example": "components/examples/date-navigation-demo.tsx",
  "usage": "import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuViewport } from \"@/components/ui/navigation-menu\"",
  "props": [
    {
      "name": "value / defaultValue / onValueChange / children",
      "type": "NavigationMenuProps",
      "description": "保留链接和键盘语义；主题浮层通过 Viewport 分发。"
    }
  ],
  "notes": [
    "保留链接和键盘语义；主题浮层通过 Viewport 分发。"
  ]
},
{
  "slug": "direction",
  "docPath": "/docs/direction/",
  "registryId": "direction",
  "registryDependencies": [],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Direction",
  "category": "基础组件",
  "description": "同步 DOM 与 Base UI 的阅读方向。",
  "source": "components/ui/direction.tsx",
  "example": "components/examples/date-navigation-demo.tsx",
  "usage": "import { DirectionProvider } from \"@/components/ui/direction\"",
  "props": [
    {
      "name": "direction / children / ref",
      "type": "DirectionProps",
      "description": "方向边界不翻译调用方内容，值与服务请求保持不变。"
    }
  ],
  "notes": [
    "方向边界不翻译调用方内容，值与服务请求保持不变。"
  ]
},
{
  "slug": "attachment",
  "docPath": "/docs/attachment/",
  "registryId": "attachment",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n",
    "item",
    "button"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Attachment",
  "category": "基础组件",
  "description": "调用方附件状态与打开、移除操作。",
  "source": "components/ui/attachment.tsx",
  "example": "components/examples/conversation-extensions-demo.tsx",
  "usage": "import { Attachment } from \"@/components/ui/attachment\"",
  "props": [
    {
      "name": "name / status / error / onOpen / onRemove",
      "type": "AttachmentProps",
      "description": "不读取或上传文件；未知结果和忙碌状态阻止再次写入。"
    }
  ],
  "notes": [
    "不读取或上传文件；未知结果和忙碌状态阻止再次写入。"
  ]
},
{
  "slug": "marker",
  "docPath": "/docs/marker/",
  "registryId": "marker",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Marker",
  "category": "基础组件",
  "description": "对话时间、章节与事件分隔标记。",
  "source": "components/ui/marker.tsx",
  "example": "components/examples/conversation-extensions-demo.tsx",
  "usage": "import { Marker, MarkerIcon, MarkerContent } from \"@/components/ui/marker\"",
  "props": [
    {
      "name": "variant / children",
      "type": "MarkerProps",
      "description": "只读标记无交互悬停；调用方内容保持原样。"
    }
  ],
  "notes": [
    "只读标记无交互悬停；调用方内容保持原样。"
  ]
},
{
  "slug": "questionnaire",
  "docPath": "/docs/questionnaire/",
  "registryId": "questionnaire",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n",
    "button",
    "textarea",
    "radio-group",
    "checkbox"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "Questionnaire",
  "category": "组合模块",
  "description": "逐题单选、多选和文本问卷。",
  "source": "components/blocks/questionnaire.tsx",
  "example": "components/examples/conversation-extensions-demo.tsx",
  "usage": "import { Questionnaire } from \"@/components/blocks/questionnaire\"",
  "props": [
    {
      "name": "questions / value / activeId / onValueChange / onSubmit / busy / error",
      "type": "QuestionnaireProps",
      "description": "答案受控；支持跳过、回退和错误保留；提交结果由调用方确认。"
    }
  ],
  "notes": [
    "答案受控；支持跳过、回退和错误保留；提交结果由调用方确认。"
  ]
},
{
  "slug": "bubble",
  "docPath": "/docs/bubble/",
  "registryId": "bubble",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Bubble",
  "category": "基础组件",
  "description": "独立引用或批注的内容容器。",
  "source": "components/ui/bubble.tsx",
  "example": "components/examples/conversation-extensions-demo.tsx",
  "usage": "import { Bubble, BubbleContent, BubbleAttribution } from \"@/components/ui/bubble\"",
  "props": [
    {
      "name": "children / className",
      "type": "BubbleProps",
      "description": "用于独立引用示例，不改变 ChatMessage 的同轴对话布局。"
    }
  ],
  "notes": [
    "用于独立引用示例，不改变 ChatMessage 的同轴对话布局。"
  ]
},
{
  "slug": "card",
  "docPath": "/docs/card/",
  "registryId": "card",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Card",
  "category": "基础组件",
  "description": "独立内容、概览和预览容器。",
  "source": "components/ui/card.tsx",
  "example": "components/examples/content-chart-demo.tsx",
  "usage": "import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from \"@/components/ui/card\"",
  "props": [
    {
      "name": "children / className",
      "type": "CardProps",
      "description": "普通会话、日志和列表继续使用 Item、list 或 table。"
    }
  ],
  "notes": [
    "普通会话、日志和列表继续使用 Item、list 或 table。"
  ]
},
{
  "slug": "aspect-ratio",
  "docPath": "/docs/aspect-ratio/",
  "registryId": "aspect-ratio",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "AspectRatio",
  "category": "基础组件",
  "description": "保留指定纵横比的内容区域。",
  "source": "components/ui/aspect-ratio.tsx",
  "example": "components/examples/content-chart-demo.tsx",
  "usage": "import { AspectRatio } from \"@/components/ui/aspect-ratio\"",
  "props": [
    {
      "name": "ratio / style / children",
      "type": "AspectRatioProps",
      "description": "比例必须为有限正数；无效输入回退 16:9。"
    }
  ],
  "notes": [
    "比例必须为有限正数；无效输入回退 16:9。"
  ]
},
{
  "slug": "carousel",
  "docPath": "/docs/carousel/",
  "registryId": "carousel",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n",
    "button",
    "empty"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Carousel",
  "category": "基础组件",
  "description": "手动控制、键盘与触摸轮播。",
  "source": "components/ui/carousel.tsx",
  "example": "components/examples/content-chart-demo.tsx",
  "usage": "import { Carousel } from \"@/components/ui/carousel\"",
  "props": [
    {
      "name": "items / label / index / defaultIndex / onIndexChange / loop",
      "type": "CarouselProps",
      "description": "不自动播放；隐藏页保留草稿并离开 Tab 顺序；方向随 RTL 调整。"
    }
  ],
  "notes": [
    "不自动播放；隐藏页保留草稿并离开 Tab 顺序；方向随 RTL 调整。"
  ]
},
{
  "slug": "chart",
  "docPath": "/docs/chart/",
  "registryId": "chart",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n",
    "runtime-status",
    "data-region",
    "table"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "Chart",
  "category": "组合模块",
  "description": "带完整文本替代的轻量柱图和折线图。",
  "source": "components/blocks/chart.tsx",
  "example": "components/examples/content-chart-demo.tsx",
  "usage": "import { Chart } from \"@/components/blocks/chart\"",
  "props": [
    {
      "name": "label / data / type / state / error / onRetry",
      "type": "ChartProps",
      "description": "最多展示最近120项；空、缺失、负值和零值分开，未增加图表依赖。"
    }
  ],
  "notes": [
    "最多展示最近120项；空、缺失、负值和零值分开，未增加图表依赖。"
  ]
},
{
  "slug": "form",
  "docPath": "/docs/form/",
  "registryId": "form",
  "registryDependencies": [
    "theme",
    "utils",
    "field"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Form",
  "category": "基础组件",
  "description": "原生表单与 Field 的轻量组合。",
  "source": "components/ui/form.tsx",
  "example": "components/examples/layout-integration-demo.tsx",
  "usage": "import { Form, FormField } from \"@/components/ui/form\"",
  "props": [
    {
      "name": "onSubmit / children / native form props",
      "type": "FormProps",
      "description": "调用方拥有验证、提交、错误和持久化；不要求特定表单库。"
    }
  ],
  "notes": [
    "调用方拥有验证、提交、错误和持久化；不要求特定表单库。"
  ]
},
{
  "slug": "sidebar",
  "docPath": "/docs/sidebar/",
  "registryId": "sidebar",
  "registryDependencies": [
    "theme",
    "utils",
    "i18n",
    "button"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "Sidebar",
  "category": "组合模块",
  "description": "受控折叠的独立侧栏布局。",
  "source": "components/blocks/sidebar.tsx",
  "example": "components/examples/layout-integration-demo.tsx",
  "usage": "import { Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter, SidebarLink } from \"@/components/blocks/sidebar\"",
  "props": [
    {
      "name": "label / collapsed / defaultCollapsed / onCollapsedChange / width",
      "type": "SidebarProps",
      "description": "默认宽256、折叠48；标签和当前链接保留；不持久化偏好。"
    }
  ],
  "notes": [
    "默认宽256、折叠48；标签和当前链接保留；不持久化偏好。"
  ]
},
{
  "slug": "resizable",
  "docPath": "/docs/resizable/",
  "registryId": "resizable",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Resizable",
  "category": "基础组件",
  "description": "可复用双面板与尺寸调整手柄。",
  "source": "components/ui/resizable.tsx",
  "example": "components/examples/layout-integration-demo.tsx",
  "usage": "import { Resizable, ResizableHandle } from \"@/components/ui/resizable\"",
  "props": [
    {
      "name": "value / defaultValue / onValueChange / min / max / axis",
      "type": "ResizableProps",
      "description": "支持指针、键盘、RTL、边界和取消；像素值由调用方持有。"
    }
  ],
  "notes": [
    "支持指针、键盘、RTL、边界和取消；像素值由调用方持有。"
  ]
},
{
  "slug": "scroll-area",
  "docPath": "/docs/scroll-area/",
  "registryId": "scroll-area",
  "registryDependencies": [
    "theme",
    "utils"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "ScrollArea",
  "category": "基础组件",
  "description": "保留浏览器行为的原生滚动区域。",
  "source": "components/ui/scroll-area.tsx",
  "example": "components/examples/layout-integration-demo.tsx",
  "usage": "import { ScrollArea } from \"@/components/ui/scroll-area\"",
  "props": [
    {
      "name": "label / orientation / className / ref",
      "type": "ScrollAreaProps",
      "description": "无需模拟滚动条；保留键盘、选择、查找与 ref。"
    }
  ],
  "notes": [
    "无需模拟滚动条；保留键盘、选择、查找与 ref。"
  ]
},
{
  "slug": "command",
  "docPath": "/docs/command/",
  "registryId": "command",
  "registryDependencies": [
    "command-palette"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "Command",
  "category": "组合模块",
  "description": "复用 CommandPalette 的内嵌命令面板。",
  "source": "components/blocks/command.tsx",
  "example": "components/examples/layout-integration-demo.tsx",
  "usage": "import { Command } from \"@/components/blocks/command\"",
  "props": [
    {
      "name": "title / query / groups / onSelect",
      "type": "CommandProps",
      "description": "结果、过滤和激活由调用方提供；不默认监听全局快捷键。"
    }
  ],
  "notes": [
    "结果、过滤和激活由调用方提供；不默认监听全局快捷键。"
  ]
},
{
  "slug": "drawer",
  "docPath": "/docs/drawer/",
  "registryId": "drawer",
  "registryDependencies": [
    "sheet",
    "button",
    "i18n"
  ],
  "installType": "ui",
  "displayCategory": "primitives",
  "availability": "available",
  "name": "Drawer",
  "category": "基础组件",
  "description": "复用 Sheet 的抽屉与可选滑动关闭。",
  "source": "components/ui/drawer.tsx",
  "example": "components/examples/layout-integration-demo.tsx",
  "usage": "import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerHeader, DrawerBody, DrawerFooter, DrawerClose } from \"@/components/ui/drawer\"",
  "props": [
    {
      "name": "open / defaultOpen / side / swipeToClose",
      "type": "DrawerProps",
      "description": "仅底部显式手柄支持滑动；正文原生滚动，焦点恢复沿用 Sheet。"
    }
  ],
  "notes": [
    "仅底部显式手柄支持滑动；正文原生滚动，焦点恢复沿用 Sheet。"
  ]
},
// END shadcn completion

  {
    slug: "textarea",
    docPath: "/docs/textarea/",
    registryId: "textarea",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Textarea",
    category: "基础组件",
    description: "多行文本输入，保留原生表单、引用与草稿语义。",
    source: "components/ui/textarea.tsx",
    example: "components/examples/form-primitives-demo.tsx",
    usage: 'import { Textarea } from "@/components/ui/textarea"',
    props: [
      {
        name: "value / defaultValue / onChange / rows / name / form / ref",
        type: "TextareaProps",
        description: "支持受控和非受控值；错误不会清空草稿。",
      },
    ],
    notes: ["支持受控和非受控值；错误不会清空草稿。"],
  },
  {
    slug: "label",
    docPath: "/docs/label/",
    registryId: "label",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Label",
    category: "基础组件",
    description: "独立字段标签，沿用原生 htmlFor 与 ref。",
    source: "components/ui/label.tsx",
    example: "components/examples/form-primitives-demo.tsx",
    usage: 'import { Label } from "@/components/ui/label"',
    props: [
      {
        name: "htmlFor / children / ref",
        type: "LabelProps",
        description: "只负责标签关联；完整说明与错误关联使用 Field。",
      },
    ],
    notes: ["只负责标签关联；完整说明与错误关联使用 Field。"],
  },
  {
    slug: "native-select",
    docPath: "/docs/native-select/",
    registryId: "native-select",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "NativeSelect",
    category: "基础组件",
    description: "原生选择器、选项与分组，保留移动端系统选择器。",
    source: "components/ui/native-select.tsx",
    example: "components/examples/form-primitives-demo.tsx",
    usage:
      'import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from "@/components/ui/native-select"',
    props: [
      {
        name: "value / defaultValue / onChange / multiple / size / name / form",
        type: "NativeSelectProps",
        description: "显示标签与提交值分开，支持多选和原生表单属性。",
      },
    ],
    notes: ["显示标签与提交值分开，支持多选和原生表单属性。"],
  },
  {
    slug: "switch",
    docPath: "/docs/switch/",
    registryId: "switch",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Switch",
    category: "基础组件",
    description: "受控或非受控开关，保留原生表单与只读状态。",
    source: "components/ui/switch.tsx",
    example: "components/examples/form-primitives-demo.tsx",
    usage: 'import { Switch } from "@/components/ui/switch"',
    props: [
      {
        name: "checked / defaultChecked / onCheckedChange / name / form / value / uncheckedValue / readOnly",
        type: "SwitchProps",
        description: "32px操作目标、粗指针44px；回调只报告设置值变化。",
      },
    ],
    notes: ["32px操作目标、粗指针44px；回调只报告设置值变化。"],
  },
  {
    slug: "radio-group",
    docPath: "/docs/radio-group/",
    registryId: "radio-group",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "RadioGroup",
    category: "基础组件",
    description: "常规单选组，键盘选择、焦点与表单值由 Base UI 管理。",
    source: "components/ui/radio-group.tsx",
    example: "components/examples/form-primitives-demo.tsx",
    usage:
      'import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"',
    props: [
      {
        name: "RadioGroup / RadioGroupItem; value / defaultValue / onValueChange / name / form / disabled / readOnly",
        type: "RadioGroupProps<Value> / RadioGroupItemProps<Value>",
        description: "单选值受控或非受控；协议值不随显示语言改变。",
      },
    ],
    notes: ["单选值受控或非受控；协议值不随显示语言改变。"],
  },
  {
    slug: "checkbox",
    docPath: "/docs/checkbox/",
    registryId: "checkbox",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Checkbox",
    category: "基础组件",
    description: "原生表单关联的三态复选框，选择与焦点分离。",
    source: "components/ui/checkbox.tsx",
    example: "components/examples/checkbox-demo.tsx",
    usage: 'import { Checkbox } from "@/components/ui/checkbox"',
    props: [
      {
        name: "checked / defaultChecked / onCheckedChange / indeterminate",
        type: "boolean / (checked, details) => void",
        description: "indeterminate只表达部分选择，不提交第三种业务值。",
      },
    ],
    notes: ["indeterminate只表达部分选择，不提交第三种业务值。"],
  },
  {
    slug: "table",
    docPath: "/docs/table/",
    registryId: "table",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Table",
    category: "基础组件",
    description: "原生表格结构，保留表头、单元格、标题和滚动语义。",
    source: "components/ui/table.tsx",
    example: "components/examples/table-demo.tsx",
    usage: 'import { Table } from "@/components/ui/table"',
    props: [
      {
        name: "Table / TableHeader / TableBody / TableRow / TableHead / TableCell / TableFooter / TableCaption / TableContainer",
        type: "native HTML props",
        description:
          "TableContainer负责横向滚动，Table不拥有数据请求或行选择。",
      },
    ],
    notes: ["TableContainer负责横向滚动，Table不拥有数据请求或行选择。"],
  },
  {
    slug: "data-table",
    docPath: "/docs/data-table/",
    registryId: "data-table",
    registryDependencies: ["theme","button","checkbox","table","data-region","i18n","data-table-model"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "DataTable",
    category: "组合模块",
    description: "受控通用表格，勾选、查看与排序请求分别建模。",
    source: "components/blocks/data-table.tsx",
    relatedSources: ["components/blocks/data-table.module.css"],
    example: "components/examples/data-table-demo.tsx",
    usage: 'import { DataTable } from "@/components/blocks/data-table"',
    props: [
      {
        "name": "columnConfig",
        "type": "DataTableColumnConfig",
        "description": "受控列顺序、显隐与宽度；选择身份不随列变化。"
      },
      {
        "name": "activationMode",
        "type": "\"primary-cell\" | \"separate\"",
        "default": "primary-cell",
        "description": "交互单元格使用separate，避免嵌套按钮。"
      },
      {
        "name": "rows / columns / getRowId / getRowLabel / selectedIds / onSelectionChange / activeRowId / onActivateRow / sort / onSortChange / data / footer",
        "type": "DataTableProps<T>",
        "description": "全选只修改当前可选行并保留隐藏选择；调用方提供排序后的数据与汇总。"
      }
    ],
    notes: [
      "全选只修改当前可选行并保留隐藏选择；调用方提供排序后的数据与汇总。",
    ],
  },
  {
    slug: "avatar",
    docPath: "/docs/avatar/",
    registryId: "avatar",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Avatar",
    category: "基础组件",
    description: "头像图片、姓名缩写与读取失败回退。",
    source: "components/ui/avatar.tsx",
    example: "components/examples/avatar-demo.tsx",
    usage: 'import { Avatar } from "@/components/ui/avatar"',
    props: [
      {
        name: "name / src / initials / size",
        type: "string / string / string / 24 | 32 | 40",
        description:
          "name提供可访问名称；图片失败后显示缩写，src变化允许重新读取。",
      },
    ],
    notes: ["name提供可访问名称；图片失败后显示缩写，src变化允许重新读取。"],
  },
  {
    slug: "segment-bar",
    docPath: "/docs/segment-bar/",
    registryId: "segment-bar",
    registryDependencies: ["theme", "i18n"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "SegmentBar",
    category: "基础组件",
    description: "分段量值显示，使用meter语义并明确未知值。",
    source: "components/ui/segment-bar.tsx",
    example: "components/examples/segment-bar-demo.tsx",
    usage: 'import { SegmentBar } from "@/components/ui/segment-bar"',
    props: [
      {
        name: "label / value / min / max / segments / valueText / color",
        type: "SegmentBarProps",
        description:
          "有限值限制在声明范围，分段数1–50；未知值不补零，不用作任务进度。",
      },
    ],
    notes: ["有限值限制在声明范围，分段数1–50；未知值不补零，不用作任务进度。"],
  },
  {
    slug: "sparkline",
    docPath: "/docs/sparkline/",
    registryId: "sparkline",
    registryDependencies: ["theme", "i18n"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Sparkline",
    category: "基础组件",
    description: "带文本替代的微型柱状趋势，覆盖空值、缺失和等值。",
    source: "components/ui/sparkline.tsx",
    example: "components/examples/sparkline-demo.tsx",
    usage: 'import { Sparkline } from "@/components/ui/sparkline"',
    props: [
      {
        name: "label / values / summary / color",
        type: "SparklineProps",
        description:
          "最多显示最近120个点；缺失值不画柱，零值有基线，负值从零线向下。",
      },
    ],
    notes: ["最多显示最近120个点；缺失值不画柱，零值有基线，负值从零线向下。"],
  },
  {
    slug: "dropdown-menu",
    docPath: "/docs/dropdown-menu/",
    registryId: "dropdown-menu",
    registryDependencies: ["theme", "utils", "menu"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "DropdownMenu",
    category: "基础组件",
    description: "复用Menu的动作、复选及单选菜单，支持键盘定位。",
    source: "components/ui/dropdown-menu.tsx",
    example: "components/examples/dropdown-menu-demo.tsx",
    usage: 'import { DropdownMenu } from "@/components/ui/dropdown-menu"',
    props: [
      {
        name: "DropdownMenuCheckboxItem / DropdownMenuRadioGroup / DropdownMenuRadioItem / DropdownMenuSeparator",
        type: "Base UI Menu props",
        description: "不创建第二套菜单基础；菜单选项不替代普通表单Select。",
      },
    ],
    notes: ["不创建第二套菜单基础；菜单选项不替代普通表单Select。"],
  },
  {
    slug: "sheet",
    docPath: "/docs/sheet/",
    registryId: "sheet",
    registryDependencies: ["theme","utils","theme-boundary","button","i18n","overlay-layer"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Sheet",
    category: "基础组件",
    description: "左右及底部抽屉，固定首尾、正文滚动与嵌套焦点管理。",
    source: "components/ui/sheet.tsx",
    example: "components/examples/sheet-demo.tsx",
    usage: 'import { Sheet } from "@/components/ui/sheet"',
    props: [
      {
        name: "open / defaultOpen / onOpenChange; side / size / finalFocus / initialFocus",
        type: "Base UI Dialog props; left | right | bottom / number",
        description:
          "复用Dialog语义；Portal继承ThemeBoundary，支持指定转场后的焦点目标。",
      },
    ],
    notes: [
      "复用Dialog语义；Portal继承ThemeBoundary，支持指定转场后的焦点目标。",
    ],
    relatedSources: ["components/ui/sheet.module.css"],
  },
  {
    slug: "command-palette",
    docPath: "/docs/command-palette/",
    registryId: "command-palette",
    registryDependencies: [
      "theme",
      "dialog",
      "input",
      "kbd",
      "controllable-value",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "CommandPalette",
    category: "组合模块",
    description: "调用方提供结果的命令搜索，支持键盘选择与IME。",
    source: "components/blocks/command-palette.tsx",
    example: "components/examples/command-palette-demo.tsx",
    usage:
      'import { CommandPalette } from "@/components/blocks/command-palette"',
    props: [
      {
        name: "groups / query / onQueryChange / onSelect / open / shortcut / finalFocus / loading / error / className / renderItem",
        type: "CommandPaletteProps",
        description:
          "默认不注册全局快捷键；可配置scope，忽略编辑器、Canvas及已处理事件；选择不执行内置服务。",
      },
    ],
    notes: [
      "默认不注册全局快捷键；可配置scope，忽略编辑器、Canvas及已处理事件；选择不执行内置服务。",
    ],
  },
  {
    slug: "kbd",
    docPath: "/docs/kbd/",
    registryId: "kbd",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Kbd",
    category: "基础组件",
    description: "语义化快捷键呈现，不注册键盘事件。",
    source: "components/ui/kbd.tsx",
    example: "components/examples/kbd-demo.tsx",
    usage: 'import { Kbd } from "@/components/ui/kbd"',
    props: [
      {
        name: "children / aria-label",
        type: "native kbd props",
        description: "修饰键符号需要调用方提供适合读屏的名称。",
      },
    ],
    notes: ["修饰键符号需要调用方提供适合读屏的名称。"],
  },
  {
    slug: "field",
    docPath: "/docs/field/",
    registryId: "field",
    registryDependencies: ["theme"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Field",
    category: "基础组件",
    description: "统一标签、描述与错误关联，保留调用方输入草稿。",
    source: "components/ui/field.tsx",
    example: "components/examples/field-demo.tsx",
    usage: 'import { Field } from "@/components/ui/field"',
    props: [
      {
        name: "id / label / description / error / required / children",
        type: "FieldProps; children(controlProps) => ReactNode",
        description:
          "通过render函数传递id、aria-describedby、aria-invalid和required；校验属于调用方。",
      },
    ],
    notes: [
      "通过render函数传递id、aria-describedby、aria-invalid和required；校验属于调用方。",
    ],
  },
  {
    slug: "form-section",
    docPath: "/docs/form-section/",
    registryId: "form-section",
    registryDependencies: ["theme", "utils"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "FormSection",
    category: "组合模块",
    description: "使用fieldset和legend组织表单分组。",
    source: "components/blocks/form-section.tsx",
    example: "components/examples/form-section-demo.tsx",
    usage: 'import { FormSection } from "@/components/blocks/form-section"',
    props: [
      {
        name: "title / description / disabled / children",
        type: "FormSectionProps",
        description: "不嵌套创建form，不拥有保存或校验逻辑。",
      },
    ],
    notes: ["不嵌套创建form，不拥有保存或校验逻辑。"],
  },
  {
    slug: "slider",
    docPath: "/docs/slider/",
    registryId: "slider",
    registryDependencies: ["theme"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Slider",
    category: "基础组件",
    description: "受控或非受控数值滑块，连续变化与提交回调分离。",
    source: "components/ui/slider.tsx",
    example: "components/examples/slider-demo.tsx",
    usage: 'import { Slider } from "@/components/ui/slider"',
    props: [
      {
        name: "label / value / defaultValue / onChange / onCommit / min / max / step / disabled / valueText",
        type: "SliderProps",
        description:
          "复用Base UI键盘与触摸行为；无效边界和数值有确定回退，不创建业务持久化。",
      },
    ],
    notes: [
      "复用Base UI键盘与触摸行为；无效边界和数值有确定回退，不创建业务持久化。",
    ],
  },
  {
    slug: "image-upload",
    docPath: "/docs/image-upload/",
    registryId: "image-upload",
    registryDependencies: [
      "theme",
      "button",
      "utils",
      "controllable-value",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "ImageUpload",
    category: "组合模块",
    description: "本地图片选择、拖放、预览、替换与失败恢复。",
    source: "components/blocks/image-upload.tsx",
    example: "components/examples/image-upload-demo.tsx",
    usage: 'import { ImageUpload } from "@/components/blocks/image-upload"',
    props: [
      {
        name: "label / value / defaultValue / onValueChange / accept / maxBytes / disabled",
        type: "ImageUploadProps; value: File | null",
        description:
          "替换失败保留旧File；迟到读取丢弃，卸载取消读取；上传及远程结果由调用方负责。",
      },
    ],
    notes: [
      "替换失败保留旧File；迟到读取丢弃，卸载取消读取；上传及远程结果由调用方负责。",
    ],
  },
  {
    slug: "filter-toolbar",
    docPath: "/docs/filter-toolbar/",
    registryId: "filter-toolbar",
    registryDependencies: ["theme", "button", "sheet", "i18n"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "FilterToolbar",
    category: "组合模块",
    description: "组合筛选、排序与计数，窄屏使用Sheet容纳筛选。",
    source: "components/blocks/filter-toolbar.tsx",
    example: "components/examples/filter-toolbar-demo.tsx",
    usage: 'import { FilterToolbar } from "@/components/blocks/filter-toolbar"',
    props: [
      {
        name: "label / search / filters / sort / summary / actions / filterTitle / filterDescription",
        type: "FilterToolbarProps",
        description:
          "筛选值由调用方持有；切换布局只挂载一组筛选控件，避免重复ID。",
      },
    ],
    notes: ["筛选值由调用方持有；切换布局只挂载一组筛选控件，避免重复ID。"],
  },
  {
    slug: "metric-summary",
    docPath: "/docs/metric-summary/",
    registryId: "metric-summary",
    registryDependencies: ["theme"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "MetricSummary",
    category: "组合模块",
    description: "使用名称、值、单位和说明展示调用方计算的指标。",
    source: "components/blocks/metric-summary.tsx",
    example: "components/examples/metric-summary-demo.tsx",
    usage: 'import { MetricSummary } from "@/components/blocks/metric-summary"',
    props: [
      {
        name: "items / className",
        type: "readonly MetricSummaryItem[]",
        description:
          "使用dl语义和稳定ID，不从业务记录推导指标，不增加只读hover。",
      },
    ],
    notes: ["使用dl语义和稳定ID，不从业务记录推导指标，不增加只读hover。"],
  },
  {
    slug: "rating-display",
    docPath: "/docs/rating-display/",
    registryId: "rating-display",
    registryDependencies: ["theme", "i18n"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "RatingDisplay",
    category: "基础组件",
    description: "只读评分与半星显示，提供完整文本替代。",
    source: "components/ui/rating-display.tsx",
    example: "components/examples/rating-display-demo.tsx",
    usage: 'import { RatingDisplay } from "@/components/ui/rating-display"',
    props: [
      {
        name: "label / value / max",
        type: "RatingDisplayProps",
        description:
          "max为1–10，value限制范围并四舍五入到半星；缺失值保持未知。",
      },
    ],
    notes: ["max为1–10，value限制范围并四舍五入到半星；缺失值保持未知。"],
  },
  {
    slug: "menu",
    docPath: "/docs/menu/",
    registryId: "menu",
    registryDependencies: ["theme","utils","theme-boundary","overlay-layer"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Menu",
    category: "基础组件",
    description: "动作菜单，沿用方向键、禁用与 Escape 焦点恢复。",
    source: "components/ui/menu.tsx",
    example: "components/examples/menu-demo.tsx",
    usage:
      'import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/menu"',
    props: [
      {
        name: "open / defaultOpen / onOpenChange",
        type: "Base UI props",
        description: "受控或非受控值及变更回调；组件不拥有业务存储。",
      },
    ],
    notes: [
      "导航、选值和动作使用不同语义；支持键盘、触摸、Escape 与焦点恢复。",
    ],
  },
  {
    slug: "popover",
    docPath: "/docs/popover/",
    registryId: "popover",
    registryDependencies: ["theme","utils","theme-boundary","overlay-layer"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Popover",
    category: "基础组件",
    description: "带主题继承的辅助信息浮层，不伪造业务反馈。",
    source: "components/ui/popover.tsx",
    example: "components/examples/popover-demo.tsx",
    usage:
      'import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose } from "@/components/ui/popover"',
    props: [
      {
        name: "open / defaultOpen / onOpenChange",
        type: "Base UI props",
        description: "受控或非受控值及变更回调；组件不拥有业务存储。",
      },
    ],
    notes: [
      "导航、选值和动作使用不同语义；支持键盘、触摸、Escape 与焦点恢复。",
    ],
  },
  {
    slug: "select",
    docPath: "/docs/select/",
    registryId: "select",
    registryDependencies: ["theme","utils","theme-boundary","overlay-layer"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Select",
    category: "基础组件",
    description: "有限选项单选，支持受控值与键盘选择。",
    source: "components/ui/select.tsx",
    example: "components/examples/select-demo.tsx",
    usage:
      'import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectItemText } from "@/components/ui/select"',
    props: [
      {
        name: "value / defaultValue / onValueChange",
        type: "Base UI props",
        description: "受控或非受控值及变更回调；组件不拥有业务存储。",
      },
    ],
    notes: [
      "导航、选值和动作使用不同语义；支持键盘、触摸、Escape 与焦点恢复。",
    ],
  },
  {
    slug: "combobox",
    docPath: "/docs/combobox/",
    registryId: "combobox",
    registryDependencies: ["theme","utils","theme-boundary","overlay-layer"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Combobox",
    category: "基础组件",
    description: "可输入筛选的选值控件，保留空结果和键盘导航。",
    source: "components/ui/combobox.tsx",
    example: "components/examples/combobox-demo.tsx",
    usage:
      'import { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem } from "@/components/ui/combobox"',
    props: [
      {
        name: "value / defaultValue / onValueChange",
        type: "Base UI props",
        description: "受控或非受控值及变更回调；组件不拥有业务存储。",
      },
    ],
    notes: [
      "导航、选值和动作使用不同语义；支持键盘、触摸、Escape 与焦点恢复。",
    ],
  },
  {
    slug: "segmented",
    docPath: "/docs/segmented/",
    registryId: "segmented",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Segmented",
    category: "基础组件",
    description: "互斥选值分段控件，使用 radio 语义与方向键。",
    source: "components/ui/segmented.tsx",
    example: "components/examples/segmented-demo.tsx",
    usage:
      'import { Segmented, SegmentedItem } from "@/components/ui/segmented"',
    props: [
      {
        name: "value / defaultValue / onValueChange",
        type: "Base UI props",
        description: "受控或非受控值及变更回调；组件不拥有业务存储。",
      },
    ],
    notes: [
      "导航、选值和动作使用不同语义；支持键盘、触摸、Escape 与焦点恢复。",
    ],
  },
  {
    slug: "tabs",
    docPath: "/docs/tabs/",
    registryId: "tabs",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Tabs",
    category: "基础组件",
    description: "内容面板切换，选中与焦点分开并支持方向键。",
    source: "components/ui/tabs.tsx",
    example: "components/examples/tabs-demo.tsx",
    usage:
      'import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"',
    props: [
      {
        name: "value / defaultValue / onValueChange",
        type: "Base UI props",
        description: "受控或非受控值及变更回调；组件不拥有业务存储。",
      },
    ],
    notes: [
      "导航、选值和动作使用不同语义；支持键盘、触摸、Escape 与焦点恢复。",
    ],
  },
  {
    slug: "theme-boundary",
    docPath: "/docs/theme-boundary/",
    registryId: "theme-boundary",
    registryDependencies: [],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "ThemeBoundary",
    category: "基础组件",
    description: "兼容宿主或隔离主题的作用域，Portal 继承对应实例的变量。",
    source: "components/ui/theme-boundary.tsx",
    relatedSources: ["styles/theme-boundary.css"],
    example: "components/examples/theme-boundary-demo.tsx",
    widePreview: true,
    usage:
      'import { ThemeBoundary } from "@/components/ui/theme-boundary"\n\n<ThemeBoundary mode="scoped" theme="dark">{children}</ThemeBoundary>',
    props: [
      {
        name: "mode / theme",
        type: "host | scoped / light | dark",
        description:
          "host 映射宿主语义变量；scoped 使用私有 eu token，不修改宿主根变量。",
      },
      {
        name: "legacyAliases",
        type: "boolean",
        default: "false",
        description:
          "仅在旧组件迁移时开启边界内的通用变量别名；新安装使用命名空间样式。",
      },
    ],
    notes: [
      "默认安装保持 legacy；host 和 scoped Registry 路径需要显式选择并包裹 ThemeBoundary。",
      "主题核心只在 theme.css 维护；分发作用域样式由构建脚本生成。",
    ],
  },
  {
    slug: "i18n",
    docPath: "/docs/i18n/",
    registryId: "i18n",
    registryDependencies: [],
    installType: "lib",
    displayCategory: "primitives",
    availability: "available",
    name: "I18nProvider",
    category: "基础组件",
    description:
      "提供简体中文与英文、类型化消息、Intl 格式化和结构化界面反馈。",
    source: "lib/i18n-provider.tsx",
    relatedSources: ["lib/i18n-core.ts", "lib/i18n-messages.ts"],
    example: "components/examples/i18n-demo.tsx",
    usage:
      'import { I18nProvider } from "@/lib/i18n-provider"\n\n<I18nProvider defaultLocale="en">{children}</I18nProvider>',
    props: [
      {
        name: "locale / defaultLocale",
        type: '"zh-CN" | "en"',
        default: '"zh-CN"',
        description: "支持受控和非受控作用域；语言切换保留子组件状态。",
      },
      {
        name: "onLocaleChange",
        type: "(locale: Locale) => void",
        description:
          "受控模式由调用方更新 locale；存储和 HTML 语言由消费项目管理。",
      },
    ],
    notes: [
      "未提供 Provider 时默认中文。组件不依赖 Next、路由或浏览器存储。",
      "业务文本和外部错误原样显示；库自身反馈使用 UiMessage 描述。",
    ],
  },
  {
    slug: "canvas-service-panel",
    docPath: "/docs/canvas-service-panel/",
    registryId: "canvas-service-panel",
    registryDependencies: [
      "canvas-services",
      "canvas-controls",
      "button",
      "dialog",
      "data-region",
      "redact",
      "i18n",
    ],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "CanvasServicePanel",
    category: "组合模块",
    widePreview: true,
    description:
      "受控服务面板：版本恢复、讨论、临时 Presence、环境、分享和发布回执。",
    source: "components/blocks/canvas-service-panel.tsx",
    relatedSources: ["lib/canvas-services.ts", "lib/use-canvas-persistence.ts"],
    example: "components/examples/canvas-services-demo.tsx",
    usage: "<CanvasServicePanel {...sourceSnapshotAndCapabilities} />",
    props: [
      {
        name: "snapshot / serverRevision / onCommand / onUncertain",
        type: "CanvasServicePanelProps",
        description:
          "来源权限和完整快照受控；请求接受不表示成功，未知结果查询回执。",
      },
    ],
    notes: [
      "保存适配器使用 CAS 与服务回执；unknown 不自动重试，冲突不自动覆盖。",
      "版本恢复需明确确认，Comment 与 StickyNote 分开，Presence 按来源过期时间过滤。",
      "本地 fixture 不模拟发布成功，不代表真实存储、协作、成员或权限验收。",
    ],
  },
  {
    slug: "canvas-project-workspace",
    docPath: "/docs/canvas-project-workspace/",
    registryId: "canvas-project-workspace",
    registryDependencies: [
      "canvas-workspace",
      "canvas-editor",
      "canvas-validation",
      "canvas-controls",
      "button",
      "dialog",
      "redact",
      "i18n",
    ],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "CanvasProjectWorkspace",
    category: "组合模块",
    widePreview: true,
    description:
      "显式边界与递归校验的嵌套流程工作台，保留每个子图的选择、视口和本地历史。",
    source: "components/blocks/canvas-project-workspace.tsx",
    relatedSources: ["lib/canvas-project.ts"],
    example: "components/examples/canvas-project-demo.tsx",
    usage:
      "<CanvasProjectWorkspace project={project} definitions={definitions} onChange={setProject} />",
    props: [
      {
        name: "project / definitions / onChange / readOnly / layout",
        type: "CanvasProjectWorkspaceProps",
        description:
          "项目受控；子流程仅通过边界交换变量；普通图仍为 DAG。layout=fill 填满父容器。",
      },
    ],
    notes: [
      "同一子流程可复用，禁止递归引用；Loop / Iteration 仅包装有界独立作用域。",
      "Switch / Parallel / Merge 示例端口和配置由调用方执行器解释，本库不运行代码。",
    ],
  },
  {
    slug: "canvas-config-editor",
    docPath: "/docs/canvas-config-editor/",
    registryId: "canvas-config-editor",
    registryDependencies: [
      "canvas-model",
      "canvas-controls",
      "button",
      "input",
      "i18n",
    ],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "CanvasConfigEditor",
    category: "组合模块",
    widePreview: true,
    description: "条件、对象 Schema、键值表、表达式和代码的受控编辑器。",
    source: "components/blocks/canvas-config-editor.tsx",
    relatedSources: ["lib/canvas-config.ts"],
    example: "components/examples/canvas-project-demo.tsx",
    usage:
      '<CanvasConfigEditor kind="condition" id="rules" label="条件" value={json} onChange={setJson} />',
    props: [
      {
        name: "kind / id / label / value / onChange / disabled",
        type: "CanvasConfigEditorProps",
        description: "字符串草稿受控，无效 JSON 保留；按字段类型生成结构值。",
      },
    ],
    notes: [
      "通过 NodeInspector 的字段 kind 使用。高级示例选择 Advanced Config 或 Switch。",
      "支持扁平对象 Schema；超出简化构建器的内容保留为 JSON 文本。",
      "不执行表达式或代码，不向网络发送配置。",
    ],
  },
  {
    slug: "canvas-execution-panel",
    docPath: "/docs/canvas-execution-panel/",
    registryId: "canvas-execution-panel",
    registryDependencies: [
      "canvas-runtime",
      "canvas-controls",
      "button",
      "runtime-status-badge",
      "activity-timeline",
      "tool-call",
      "inspector",
      "data-region",
      "redact",
      "i18n",
    ],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "CanvasExecutionPanel",
    category: "组合模块",
    widePreview: true,
    description: "受控执行调试：运行、停止请求、审批、脱敏输出和未知结果对账。",
    source: "components/blocks/canvas-execution-panel.tsx",
    relatedSources: [
      "lib/canvas-runtime.ts",
      "lib/use-canvas-runtime.ts",
      "components/blocks/canvas-controls.module.css",
    ],
    example: "components/examples/canvas-workspace-demo.tsx",
    usage:
      "const runtime = useCanvasRuntime(document, definitions, adapter)\n<CanvasWorkspace {...editor} definitions={definitions} runtime={runtime} />",
    props: [
      {
        name: "runtime / document / definitions / nodeId / readOnly",
        type: "CanvasExecutionPanelProps",
        description:
          "完整来源快照，运行与读取/传输状态分开；无能力不提供执行入口。",
      },
    ],
    notes: [
      "同条目导出 CanvasRunControls 和 CanvasExecutionInspector。",
      "本地 fixture 的查询会推进演示状态，不代表真实执行。",
      "未知请求必须按 requestId/runId 查询，不能重复写入。",
    ],
  },
  {
    slug: "canvas-workspace",
    docPath: "/docs/canvas-workspace/",
    registryId: "canvas-workspace",
    registryDependencies: ["canvas-model","canvas-controls","canvas-editor","canvas-validation","workspace-shell","workflow-canvas","node-palette","node-inspector","inspector","input","button","dialog","data-region","canvas-execution-panel","canvas-services","canvas-service-panel","i18n","menu","tabs","command-toolbar"],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "CanvasWorkspace",
    category: "组合模块",
    widePreview: true,
    description: "可编辑流程工作台：构图、配置、变量、校验、撤销和导入导出。",
    source: "components/blocks/canvas-workspace.tsx",
    relatedSources: [
      "lib/canvas-model.ts",
      "components/blocks/canvas-controls.module.css",
    ],
    example: "components/examples/canvas-workspace-demo.tsx",
    usage:
      'import { CanvasWorkspace } from "@/components/blocks/canvas-workspace"\nimport { useCanvasEditor } from \"@/lib/use-canvas-editor\"\n\nconst editor = useCanvasEditor(initialDocument, definitions)\n<CanvasWorkspace {...editor} definitions={definitions} />',
    props: [
      {
        name: "fixedNodeIds",
        type: "readonly string[]",
        description: "自动布局保留这些节点坐标；不增加业务权限或手动编辑锁定。",
      },
      {
        name: "document / definitions / selection / onSelectionChange / onCommand / executionVisuals / runtimeToolbar",
        type: "受控属性；见源码类型",
        description:
          "可编辑流程工作台：构图、配置、变量、校验、撤销和导入导出。",
      },
    ],
    notes: [
      "layout=fill 填满有明确高度的父容器，底部默认收起；默认 preview 用于文档演示。底部标签可展开面板，收起保留高度与内容。",
      "useCanvasEditor 提供可选的本地历史适配；运行、保存与权限由消费方负责。",
      "本地示例不连接真实模型、工具或保存服务。",
    ],
  },
  {
    slug: "node-palette",
    docPath: "/docs/node-palette/",
    registryId: "node-palette",
    registryDependencies: [
      "canvas-model",
      "canvas-controls",
      "button",
      "input",
      "utils",
      "i18n",
    ],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "NodePalette",
    category: "组合模块",
    widePreview: true,
    description: "按分类和名称查找节点，支持点击新增与拖放目录。",
    source: "components/blocks/node-palette.tsx",
    relatedSources: [
      "lib/canvas-model.ts",
      "components/blocks/canvas-controls.module.css",
    ],
    example: "components/examples/canvas-components-demo.tsx",
    usage:
      'import { NodePalette } from "@/components/blocks/node-palette"\n\n<NodePalette definitions={definitions} onAdd={addNode} />',
    props: [
      {
        name: "definitions / onAdd / readOnly",
        type: "受控属性；见源码类型",
        description: "按分类和名称查找节点，支持点击新增与拖放目录。",
      },
    ],
    notes: [
      "Quick Add 与侧栏共享同一目录；新增请求交给调用方命令。",
      "本地示例不连接真实模型、工具或保存服务。",
    ],
  },
  {
    slug: "node-inspector",
    docPath: "/docs/node-inspector/",
    registryId: "node-inspector",
    registryDependencies: [
      "canvas-model",
      "canvas-controls",
      "canvas-validation",
      "variable-picker",
      "inspector",
      "input",
      "button",
      "dialog",
      "canvas-config-editor",
      "i18n",
    ],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "NodeInspector",
    category: "组合模块",
    widePreview: true,
    description: "复用 Inspector 的受控节点配置，保留无效草稿并校验后应用。",
    source: "components/blocks/node-inspector.tsx",
    relatedSources: [
      "lib/canvas-model.ts",
      "components/blocks/canvas-controls.module.css",
    ],
    example: "components/examples/canvas-components-demo.tsx",
    usage:
      'import { NodeInspector } from "@/components/blocks/node-inspector"\n\n<NodeInspector document={document} definitions={definitions} nodeId={selectedId} onCommand={onCommand} />',
    props: [
      {
        name: "document / definitions / nodeId / onCommand / readOnly",
        type: "受控属性；见源码类型",
        description:
          "复用 Inspector 的受控节点配置，保留无效草稿并校验后应用。",
      },
    ],
    notes: [
      "每个对象独立保留草稿，应用前不会写入图文档。",
      "本地示例不连接真实模型、工具或保存服务。",
    ],
  },
  {
    slug: "variable-picker",
    docPath: "/docs/variable-picker/",
    registryId: "variable-picker",
    registryDependencies: [
      "canvas-model",
      "canvas-controls",
      "canvas-validation",
      "tree",
      "input",
      "button",
      "i18n",
    ],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "VariablePicker",
    category: "组合模块",
    widePreview: true,
    description: "复用单选 Tree，选择可达上游的兼容输出并生成结构化引用。",
    source: "components/blocks/variable-picker.tsx",
    relatedSources: [
      "lib/canvas-model.ts",
      "components/blocks/canvas-controls.module.css",
    ],
    example: "components/examples/canvas-components-demo.tsx",
    usage:
      'import { VariablePicker } from "@/components/blocks/variable-picker"\n\n<VariablePicker document={document} definitions={definitions} targetId={targetId} expectedType=\"string\" onInsert={setReference} />',
    props: [
      {
        name: "document / definitions / targetId / expectedType / onInsert",
        type: "受控属性；见源码类型",
        description: "复用单选 Tree，选择可达上游的兼容输出并生成结构化引用。",
      },
    ],
    notes: [
      "nodeId、portId 和 path 关联变量；修改显示名称不影响绑定。",
      "本地示例不连接真实模型、工具或保存服务。",
    ],
  },
  {
    slug: "canvas-frame",
    docPath: "/docs/canvas-frame/",
    registryId: "canvas-frame",
    registryDependencies: ["canvas-model", "theme", "redact", "i18n"],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "CanvasFrame",
    category: "组合模块",
    widePreview: true,
    description: "流程图的视觉分组；移动由命令整体更新成员位置。",
    source: "components/blocks/canvas-frame.tsx",
    relatedSources: [
      "lib/canvas-model.ts",
      "components/blocks/canvas-annotations.module.css",
    ],
    example: "components/examples/canvas-components-demo.tsx",
    usage:
      'import { CanvasFrame } from "@/components/blocks/canvas-frame"\n\n<CanvasFrame frame={frame} selected={selected} />',
    props: [
      {
        name: "frame / selected",
        type: "受控属性；见源码类型",
        description: "流程图的视觉分组；移动由命令整体更新成员位置。",
      },
    ],
    notes: [
      "仅视觉组织；删除分组默认解组，保留成员。",
      "本地示例不连接真实模型、工具或保存服务。",
    ],
  },
  {
    slug: "canvas-note",
    docPath: "/docs/canvas-note/",
    registryId: "canvas-note",
    registryDependencies: ["canvas-model", "canvas-frame", "redact", "i18n"],
    installType: "block",
    displayCategory: "canvas",
    availability: "available",
    name: "CanvasNote",
    category: "组合模块",
    widePreview: true,
    description: "流程说明便笺，独立于执行与讨论线程。",
    source: "components/blocks/canvas-note.tsx",
    relatedSources: [
      "lib/canvas-model.ts",
      "components/blocks/canvas-annotations.module.css",
    ],
    example: "components/examples/canvas-components-demo.tsx",
    usage:
      'import { CanvasNote } from "@/components/blocks/canvas-note"\n\n<CanvasNote note={note} selected={selected} />',
    props: [
      {
        name: "note / selected",
        type: "受控属性；见源码类型",
        description: "流程说明便笺，独立于执行与讨论线程。",
      },
    ],
    notes: [
      "正文在展示前脱敏，最多4000字符；持久化由消费方负责。",
      "本地示例不连接真实模型、工具或保存服务。",
    ],
  },

  ...(
    ["workflow-canvas", "canvas-node", "canvas-port", "canvas-edge"] as const
  ).map((slug): ComponentManifestEntry => ({
    slug,
    docPath: `/docs/${slug}/`,
    registryId: slug,
    registryDependencies: {
      "workflow-canvas": [
        "theme",
        "utils",
        "canvas-model",
        "canvas-node",
        "canvas-edge",
        "canvas-validation",
        "canvas-frame",
        "canvas-note",
        "button",
        "i18n",
      ],
      "canvas-node": [
        "canvas-model",
        "canvas-port",
        "runtime-status-badge",
        "redact",
        "i18n",
      ],
      "canvas-port": ["theme", "canvas-model", "i18n"],
      "canvas-edge": ["theme", "redact", "canvas-model"],
    }[slug],
    installType: slug === "workflow-canvas" ? "block" : "ui",
    displayCategory: "canvas",
    availability: "available",
    name: {
      "workflow-canvas": "WorkflowCanvas",
      "canvas-node": "CanvasNode",
      "canvas-port": "CanvasPort",
      "canvas-edge": "CanvasEdge",
    }[slug],
    category: slug === "workflow-canvas" ? "组合模块" : "基础组件",
    widePreview: true,
    description: "受控流程图基础：统一节点、具名端口、连线、选择和深浅主题。",
    source: `components/${slug === "workflow-canvas" ? "blocks" : "ui"}/${slug}.tsx`,
    relatedSources: [
      "lib/canvas-model.ts",
      slug === "workflow-canvas"
        ? "components/blocks/workflow-canvas.module.css"
        : slug === "canvas-edge"
          ? "components/ui/canvas-edge.module.css"
          : "components/ui/canvas-node.module.css",
    ],
    example: "components/examples/workflow-canvas-demo.tsx",
    usage: {
      "workflow-canvas":
        'import { WorkflowCanvas } from "@/components/blocks/workflow-canvas"\n\n<div style={{ height: 400 }}><WorkflowCanvas document={document} definitions={definitions} selection={selection} onSelectionChange={setSelection} onCommand={onCommand} /></div>',
      "canvas-node":
        'import { CanvasNode } from "@/components/ui/canvas-node"\n\n// 在 React Flow 的自定义节点渲染器中使用。\n<CanvasNode node={record} definition={definition} selected={selected} readOnly={readOnly} />',
      "canvas-port":
        'import { CanvasPort } from "@/components/ui/canvas-port"\n\n// 在 React Flow 自定义节点上下文中使用。\n<CanvasPort port={portDefinition} readOnly={readOnly} />',
      "canvas-edge":
        'import { CanvasEdge } from "@/components/ui/canvas-edge"\nimport { ReactFlow } from "@xyflow/react"\n\n<ReactFlow edgeTypes={{ canvas: CanvasEdge }} nodes={nodes} edges={edges} />',
    }[slug],
    props: {
      "workflow-canvas": [
        {
          name: "onMeasurementsChange",
          type: "(measurements: Record<string, { width: number; height: number }>) => void",
          description: "输出临时引擎尺寸；不能写入图文档或撤销历史。",
        },
        {
          name: "document / definitions / selection / onSelectionChange",
          type: "CanvasDocument / CanvasNodeDefinition[] / CanvasSelection / callback",
          description: "文档、目录和选择由调用方控制。",
        },
        {
          name: "onCommand / readOnly",
          type: "callback / boolean",
          description: "编辑请求交给调用方；缺少回调自动只读。",
        },
        {
          name: "issues / execution / executionVisuals / focusRequest",
          type: "CanvasIssue[] / CanvasExecutionSnapshot / CanvasExecutionVisuals / { id, request }",
          description:
            "校验、当前版本快照、流光/粒子/关闭、视觉暂停与速度、显式定位。",
        },
      ],
      "canvas-node": [
        {
          name: "node / definition / selected / readOnly",
          type: "CanvasNodeRecord / CanvasNodeDefinition / boolean / boolean",
          description: "节点摘要、端口、选择和操作能力。",
        },
        {
          name: "status / outcome / executionVisuals / issues / fallbackPorts",
          type: "string / known|unknown / CanvasExecutionVisuals / CanvasIssue[] / CanvasPortDefinition[]",
          description:
            "独立运行/校验状态；未知定义的端口仅用于保留已有边呈现。",
        },
      ],
      "canvas-port": [
        {
          name: "port / readOnly / unknownType",
          type: "CanvasPortDefinition / boolean / boolean",
          description: "端口方向、类型和连接能力；缺失定义明确显示类型未定义。",
        },
      ],
      "canvas-edge": [
        {
          name: "EdgeProps / data.executionVisuals",
          type: "@xyflow/react EdgeProps",
          description:
            "引擎提供端点、标签与选择，命令和连接校验由 WorkflowCanvas 处理。",
        },
      ],
    }[slug],
    notes: [
      "示例为本地数据，不运行模型或工具。",
      "CanvasNode/Port/Edge 是 React Flow 适配器，需要置于对应引擎上下文；完整使用通过 WorkflowCanvas。",
      "WorkflowCanvas 包含引擎 CSS；父容器需要明确高度。",
    ],
  })),
  {
    slug: "style-workbench",
    docPath: "/docs/style-workbench/",
    registryId: "style-workbench",
    registryDependencies: [
      "theme",
      "utils",
      "button",
      "input",
      "badge",
      "tag",
      "chip",
      "data-region",
      "style-workbench-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "StyleWorkbench",
    category: "组合模块",
    widePreview: true,
    description:
      "A/B 样式实验：实时修改圆角、间距、阴影、颜色和字体，比较参数并复制 CSS。",
    source: "components/blocks/style-workbench.tsx",
    relatedSources: [
      "components/blocks/style-workbench.module.css",
      "lib/style-workbench-model.ts",
    ],
    example: "components/examples/style-workbench-demo.tsx",
    usage:
      'import { StyleWorkbench } from "@/components/blocks/style-workbench"\n\n<StyleWorkbench initialSection="shadow" />',
    props: [
      {
        name: "initialSection",
        type: '"geometry" | "shadow" | "surface" | "typography"',
        default: '"geometry"',
        description: "初始参数分类；切换分类保留当前修改。",
      },
      {
        name: "className",
        type: "string",
        description: "容器样式；按容器宽度响应式布局。",
      },
    ],
    notes: [
      "A 从当前主题与未修改的局部探针读取；B 的修改只影响预览，不改全局 token。",
      "支持基准固定、重置 B、恢复项目默认；未固定基准随主题更新，显式编辑保留。",
      "预览使用相同受控内容；导出局部 CSS 或含 A/B 快照的参数 JSON。参数仅保留在当前页面。",
      "滑块支持键盘；数值在 Enter 或失焦时提交并限制范围。触屏和减少动态效果可用。",
    ],
  },
  {
    slug: "badge",
    docPath: "/docs/badge/",
    registryId: "badge",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Badge",
    category: "基础组件",
    description: "只读的信息徽标，支持语义色、小圆角和胶囊外观。",
    source: "components/ui/badge.tsx",
    relatedSources: ["components/ui/badge.module.css"],
    example: "components/examples/badge-demo.tsx",
    usage:
      'import { Badge } from "@/components/ui/badge"\n\n<Badge tone="info" shape="pill">只读信息</Badge>',
    props: [
      {
        name: "tone",
        type: '"neutral" | "info" | "success" | "warning" | "danger" | "agent"',
        default: '"neutral"',
        description: "语义信息色。真实运行状态使用 RuntimeStatusBadge。",
      },
      {
        name: "shape",
        type: '"rounded" | "pill"',
        default: '"rounded"',
        description: "控件圆角6px或胶囊外观。",
      },
      {
        name: "size",
        type: '"sm" | "default"',
        default: '"default"',
        description: "只读标签最小高20/24px，不是可点击控件。",
      },
    ],
    notes: [
      "只读 span，无点击、焦点或 hover 行为，不承载操作。",
      "颜色消费共享 token；短标签保持文字语义，运行状态不另建映射。",
    ],
  },
  {
    slug: "tag",
    docPath: "/docs/tag/",
    registryId: "tag",
    registryDependencies: ["badge"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Tag",
    category: "基础组件",
    description: "胶囊外观的只读分类标签，区分分类与交互值。",
    source: "components/ui/tag.tsx",
    example: "components/examples/tag-demo.tsx",
    usage:
      'import { Tag } from "@/components/ui/tag"\n\n<Tag leading="#">TypeScript</Tag>',
    props: [
      { name: "children", type: "ReactNode", description: "简短分类名称。" },
      {
        name: "leading",
        type: "ReactNode",
        description: "可选装饰性前缀，由组件标为 aria-hidden。",
      },
      {
        name: "size",
        type: '"sm" | "default"',
        default: '"default"',
        description: "最小高20/24px；复用 Badge 的主题与尺寸。",
      },
    ],
    notes: [
      "固定中性色和胶囊外观，不进入 Tab 顺序，不接受点击行为。",
      "可选择、删除的标签使用 Chip；运行状态使用 RuntimeStatusBadge。",
    ],
  },
  {
    slug: "chip",
    docPath: "/docs/chip/",
    registryId: "chip",
    registryDependencies: ["theme", "utils", "button", "i18n"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Chip",
    category: "基础组件",
    description: "可选择、移除的受控胶囊，主操作与删除是兄弟目标。",
    source: "components/ui/chip.tsx",
    relatedSources: ["components/ui/chip.module.css"],
    example: "components/examples/chip-demo.tsx",
    usage:
      'import { Chip } from "@/components/ui/chip"\n\n<Chip label="TypeScript" selected={selected}\n  onSelectedChange={setSelected} onRemove={removeValue} />',
    props: [
      {
        name: "label",
        type: "string",
        description: "值的可见名称，也作为操作的可访问名称。",
      },
      {
        name: "selected / onSelectedChange",
        type: "boolean / (selected: boolean) => void",
        default: "false",
        description: "受控选择；有回调才渲染选择按钮。",
      },
      {
        name: "onRemove / removeLabel",
        type: "() => void / string",
        description:
          "独立移除能力；默认名称为「移除 + label」。数据变更与焦点恢复由调用方负责。",
      },
      {
        name: "disabled / busy",
        type: "boolean",
        default: "false",
        description:
          "禁用或提交期间阻止两个动作；busy 提供 aria-busy 与文字说明。",
      },
    ],
    notes: [
      "主操作和移除按钮是兄弟目标，Enter/Space 激活；选中状态通过 aria-pressed 表达。",
      "默认高32px；粗指针下每个操作目标至少44×44，支持减少动态效果。",
      "不自行修改数据、不提交网络请求；移除后由调用方恢复合理焦点。",
    ],
  },
  {
    slug: "button",
    docPath: "/docs/button/",
    registryId: "button",
    registryDependencies: ["theme","utils","theme-boundary","overlay-layer"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Button",
    category: "基础组件",
    description: "清楚地表达操作，给等待一个确定的反馈。",
    source: "components/ui/button.tsx",
    relatedSources: ["components/ui/button-tooltip.tsx"],
    example: "components/examples/button-demo.tsx",
    usage:
      'import { Button } from "@/components/ui/button"\n\n<Button variant="default" loading={saving} onClick={save}>\n  保存更改\n</Button>',
    props: [
      {
        name: "variant",
        type: '"primary" | "secondary" | "ghost" | "destructive" | "default" | "outline"',
        default: '"default"',
        description:
          "操作层级。default / outline 分别是 primary / secondary 的兼容别名。",
      },
      {
        name: "size",
        type: '"sm" | "default" | "lg" | "icon-sm" | "icon" | "icon-lg"',
        default: '"default"',
        description:
          "sm / default / lg 为 28 / 32 / 36px；对应 Icon 相同。触摸设备最小命中区域 44px。",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description: "显示加载图标，并禁用重复操作。由使用者控制异步状态。",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "禁用按钮。",
      },
    ],
    notes: [
      "继承 Base UI Button 的其他属性，包括 render、onClick 和 ref。",
      "纯图标按钮需要 aria-label，自动提供 hover / focus Tooltip。加载状态保留文字，并通过 aria-busy 表达。",
      "切换按钮用 aria-pressed；错误用 aria-invalid 并关联说明。尺寸和状态遵守 Component-Specification.md。",
    ],
  },
  {
    slug: "input",
    docPath: "/docs/input/",
    registryId: "input",
    registryDependencies: ["theme", "utils"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Input",
    category: "基础组件",
    description: "从填写到校验，保持简单而清晰。",
    source: "components/ui/input.tsx",
    example: "components/examples/input-demo.tsx",
    usage:
      'import { Input } from "@/components/ui/input"\n\n<label htmlFor="project-name">项目名称</label>\n<Input id="project-name" placeholder="我的工作台" />',
    props: [
      {
        name: "type",
        type: "HTML input type",
        default: '"text"',
        description: "输入框类型。",
      },
      {
        name: "aria-invalid",
        type: "boolean",
        description: "标记校验失败并显示错误边框。",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "禁用输入框。",
      },
      {
        name: "value / onChange",
        type: "原生 input 属性",
        description: "支持受控输入，也支持 defaultValue。",
      },
    ],
    notes: [
      "继承原生 input 属性和 ref，无额外业务依赖。",
      "用 label 关联输入框；通过 aria-describedby 关联提示或错误信息。",
    ],
  },
  {
    slug: "dialog",
    docPath: "/docs/dialog/",
    registryId: "dialog",
    registryDependencies: ["theme","utils","i18n","theme-boundary","overlay-layer"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Dialog",
    category: "基础组件",
    description: "让用户专注于眼前的一件事。",
    source: "components/ui/dialog.tsx",
    example: "components/examples/dialog-demo.tsx",
    usage:
      'import { Button } from "@/components/ui/button"\nimport { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"\n\n<Dialog>\n  <DialogTrigger render={<Button />}>打开弹窗</DialogTrigger>\n  <DialogContent>\n    <DialogTitle>项目设置</DialogTitle>\n    <DialogDescription>在这里更新项目信息。</DialogDescription>\n  </DialogContent>\n</Dialog>',
    props: [
      {
        name: "Dialog.open",
        type: "boolean",
        description: "受控的打开状态；也支持 defaultOpen。",
      },
      {
        name: "Dialog.onOpenChange",
        type: "Base UI 回调",
        description: "响应打开与关闭。",
      },
      {
        name: "DialogContent.initialFocus",
        type: "Base UI initialFocus",
        description: "自定义打开后的初始焦点。",
      },
      {
        name: "DialogTrigger.render",
        type: "ReactElement",
        description: "组合自己的触发按钮。",
      },
    ],
    notes: [
      "用 DialogTitle 和 DialogDescription 命名弹窗和说明用途。",
      "Base UI 管理焦点约束、Escape 关闭和关闭后的焦点恢复。",
    ],
  },
  {
    slug: "task-panel",
    docPath: "/docs/task-panel/",
    registryId: "task-panel",
    registryDependencies: ["button", "utils", "theme", "i18n"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "TaskPanel",
    category: "组合模块",
    description: "把任务的等待、执行、完成和失败，一眼说清。",
    source: "components/blocks/task-panel.tsx",
    example: "components/examples/task-panel-demo.tsx",
    usage:
      'import { TaskPanel } from "@/components/blocks/task-panel"\n\n<TaskPanel\n  title="发布进度"\n  tasks={[\n    { id: "build", title: "构建应用", status: "completed" },\n    { id: "deploy", title: "部署应用", status: "failed" },\n  ]}\n  onRetry={(id) => retryTask(id)}\n/>',
    props: [
      {
        name: "tasks",
        type: "Task[]",
        description: "任务数组，id 必须稳定且唯一。",
      },
      {
        name: "title",
        type: "string",
        default: '"任务进度"',
        description: "面板标题及可访问名称。",
      },
      {
        name: "onRetry",
        type: "(id: string) => void",
        description: "为失败任务显示重试操作，由使用者执行实际业务。",
      },
      {
        name: "Task.status",
        type: '"pending" | "running" | "completed" | "failed"',
        description: "任务当前状态。",
      },
    ],
    notes: [
      "空数组显示空状态；进度按已完成数量计算。",
      "组件通过数据和回调接入业务，演示中的计时器不属于组件实现。",
    ],
  },
  {
    slug: "scroll-playground",
    docPath: "/docs/scroll-playground/",
    registryId: "scroll-playground",
    registryDependencies: ["theme", "i18n"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "ScrollPlayground",
    category: "组合模块",
    description:
      "六种滚动交互，亲手体验：触发、联动、视差、吸顶、吸附与横向展开。",
    source: "components/blocks/scroll-playground.tsx",
    relatedSources: ["components/blocks/scroll-playground.module.css"],
    example: "components/examples/scroll-playground-demo.tsx",
    usage:
      'import { ScrollPlayground } from "@/components/blocks/scroll-playground"\n\n// 展示全部六种交互\n<ScrollPlayground />\n\n// 也可以只展示其中一种\n<ScrollPlayground pattern="parallax" />',
    props: [
      {
        name: "pattern",
        type: '"triggered" | "linked" | "parallax" | "sticky" | "snap" | "horizontal"',
        description: "只展示指定效果；不传时展示六种效果。",
      },
      {
        name: "idPrefix",
        type: "string",
        description:
          "为每张演示卡片生成可链接的 ID，例如 scroll-sticky。默认使用 React useId，允许同页多个实例。",
      },
      {
        name: "className",
        type: "string",
        description: "添加到演示集合容器的样式类。",
      },
    ],
    notes: [
      "每个演示区独立滚动，支持滚轮、触屏以及聚焦后的方向键和 Page Down；右上角按钮可重置体验。",
      "Scroll-triggered 用 IntersectionObserver 触发一次淡入；Scroll-linked 将滚动位置映射到阅读进度。",
      "Parallax 的背景以正常滚动速度的 35% 移动；Sticky 用原生 CSS 让分组标题在容器内吸顶。",
      "Scroll Snap 使用原生纵向强制吸附；Horizontal Scroll 用吸顶容器和横向位移映射纵向滚动，没有劫持滚轮事件。",
      "遵循系统的减少动态效果设置：卡片直接显示、背景正常滚动、横向卡片改为原生左右滑动。阅读进度与原生吸顶、吸附仍可使用。",
      "安装会一并复制同目录的 scroll-playground.module.css，组件不依赖文档站或网络服务。完整展示页位于 /scroll/。",
    ],
  },
  {
    slug: "item",
    docPath: "/docs/item/",
    registryId: "item",
    registryDependencies: ["theme", "utils", "i18n"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "Item",
    category: "基础组件",
    description: "统一列表行。交互、选中和运行状态分开表达，尾部操作独立。",
    source: "components/ui/item.tsx",
    relatedSources: ["components/ui/item.module.css"],
    example: "components/examples/item-demo.tsx",
    usage:
      'import { Item } from "@/components/ui/item"\n\n<Item title="整理组件规范" description="Session · 刚刚更新" selected={selected} onSelect={() => selectSession()} />',
    props: [
      {
        name: "title / description",
        type: "ReactNode",
        description: "主标题及可选第二行；默认单行40px，双行最小56px。",
      },
      {
        name: "density",
        type: '"compact" | "default"',
        default: '"default"',
        description: "Compact单行32px；双行仍最小56px；触摸可交互行最小44px。",
      },
      {
        name: "leading / trailing",
        type: "ReactNode",
        description: "前置图标与独立尾部区域，尾部按钮不会嵌套在行按钮内。",
      },
      {
        name: "onSelect / selected",
        type: "() => void / boolean",
        description:
          "有回调才可交互；用aria-pressed表达选中；静态行无hover和tab stop。",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "禁用主操作；尾部操作的禁用和权限由调用方单独控制。",
      },
      {
        name: "loading / error",
        type: "boolean / string",
        description:
          "加载时禁用主操作并保持槽位；错误说明独立展开，保留原内容和运行状态。",
      },
      {
        name: "ariaLabel",
        type: "string",
        description: "窄栏隐藏标题或只有图标时提供可访问名称。",
      },
    ],
    notes: [
      "Item不设置listitem角色，由调用方提供ul/li等集合结构。",
      "集合的loading/empty/error在容器处理；Item不发请求或管理持久化。",
      "同目录CSS Module与组件一起安装。",
    ],
  },
  {
    slug: "runtime-status-badge",
    docPath: "/docs/runtime-status-badge/",
    registryId: "runtime-status-badge",
    registryDependencies: ["theme", "utils", "runtime-status", "i18n"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "RuntimeStatusBadge",
    category: "基础组件",
    description: "Session、Agent、Activity与Tool Call共用的十种运行状态语言。",
    source: "components/ui/runtime-status-badge.tsx",
    relatedSources: ["lib/runtime-status.ts"],
    example: "components/examples/runtime-status-badge-demo.tsx",
    usage:
      'import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"\n\n<RuntimeStatusBadge status="running" />',
    props: [
      {
        name: "status",
        type: "RuntimeStatus | string",
        description:
          "十种规范状态或未来未知状态；未知值明确显示，不降级成成功。",
      },
      {
        name: "className",
        type: "string",
        description: "追加样式；语义颜色来自统一token，业务页面不重新映射。",
      },
    ],
    notes: [
      "每个状态同时显示图标与文字，颜色不是唯一信息。",
      "数据读取success、UI loading与runtime completed是独立状态轴。",
      "状态由调用方控制，组件不推断运行结果。",
    ],
  },
  {
    slug: "workspace-shell",
    docPath: "/docs/workspace-shell/",
    registryId: "workspace-shell",
    registryDependencies: ["theme","utils","button","i18n","theme-boundary","overlay-layer","resizable"],
    installType: "block",
    displayCategory: "workspace",
    availability: "available",
    widePreview: true,
    name: "WorkspaceShell",
    category: "组合模块",
    description:
      "紧凑Agent工作台骨架：Sidebar、Main、可调整的Inspector与可选底部面板。",
    source: "components/blocks/workspace-shell.tsx",
    relatedSources: [
      "components/examples/controlled-workspace-demo.tsx",
      "components/blocks/workspace-shell.module.css",
      "components/examples/workspace-shell-demo.module.css",
    ],
    example: "components/examples/workspace-shell-demo.tsx",
    usage:
      'import { WorkspaceShell } from "@/components/blocks/workspace-shell"\n\n<WorkspaceShell title="Agent Workspace" sidebar={<Navigation />} inspector={<ObjectDetails />} inspectorTitle="Session">\n  <SessionList />\n</WorkspaceShell>',
    props: [
      {
        name: "sidebarCollapsed / inspectorOpen / inspectorWidth / bottomPanelOpen / bottomPanelHeight",
        type: "value / defaultValue / onChange",
        description:
          "布局支持受控与非受控；桌面停靠和窄屏浮层独立，存储由调用方管理。",
      },
      {
        name: "inspectorOverlayOpen / defaultInspectorOverlayOpen / onInspectorOverlayOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "窄屏浮层状态独立；响应式测量不回写业务偏好。",
      },
      {
        name: "title / sidebar / children",
        type: "ReactNode",
        description: "工作区标题、导航槽、当前任务内容；Shell不读取业务数据。",
      },
      {
        name: "toolbar",
        type: "ReactNode",
        description: "可选Toolbar，最小高度40px。",
      },
      {
        name: "inspectorFooter",
        type: "ReactNode",
        description: "固定在Inspector底部的操作槽，不随正文滚动。",
      },
      {
        name: "inspector / inspectorTitle",
        type: "ReactNode",
        description:
          "提供Inspector才显示开关；默认宽320px，允许300–360px。标题默认Inspector。",
      },
      {
        name: "bottomPanel",
        type: "ReactNode",
        description:
          "可选底部面板，展开默认240px；bottomPanelCollapsed 收起时由内容决定高度，保留调整值。",
      },
      {
        name: "className",
        type: "string",
        description: "默认演示高度680px，可通过样式调整。",
      },
    ],
    notes: [
      "完整基础页在/workspace/；窄容器的Inspector改为带焦点约束的抽屉。",
      "按容器宽度响应：≥1280px停靠Inspector；<1280px改为浮层；<1024px使用窄导航。",
      "支持指针拖动、方向键每次8px、Home/End尺寸边界；关闭后恢复焦点。",
      "示例数据和消息只在本地内存，不连接Agent、模型或网络服务。",
      "工作台使用独立 Tree、ActivityTimeline、SessionRow、AgentRow、Inspector、ChatMessage 和 ToolCall；各组件均可单独安装。",
    ],
  },
  {
    slug: "data-region",
    docPath: "/docs/data-region/",
    registryId: "data-region",
    registryDependencies: ["button", "theme", "i18n", "runtime-status", "skeleton", "empty", "alert"],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    name: "DataRegion",
    category: "基础组件",
    description:
      "统一数据区域：首次骨架、空状态、部分数据与保留旧内容的错误反馈。",
    source: "components/ui/data-region.tsx",
    relatedSources: ["components/ui/data-region.module.css"],
    example: "components/examples/data-region-demo.tsx",
    usage:
      '<DataRegion state="error" hasContent error={{ category: "network", message: "刷新失败", reason: "连接中断" }} onRetry={reload}>\n  <SessionList />\n</DataRegion>',
    props: [
      {
        name: "state / hasContent",
        type: "DataState / boolean",
        description: "数据态与是否已有可用内容分离，刷新失败保留内容。",
      },
      {
        name: "error / onRetry",
        type: "RegionError / () => void",
        description: "六类错误，包含原因与重试入口。",
      },
      {
        name: "emptyAction / onLoadMore",
        type: "ReactNode / () => void",
        description: "明确的空状态下一步与部分数据加载入口。",
      },
    ],
    notes: [
      "首次 loading 展示三个同尺寸骨架；已有数据时更新中不替换列表。",
      "静态容器不发请求；数据、权限和重试由使用者管理。",
    ],
  },
  {
    slug: "tree",
    docPath: "/docs/tree/",
    registryId: "tree",
    registryDependencies: [
      "theme",
      "utils",
      "button",
      "data-region",
      "runtime-status-badge",
      "i18n",
    ],
    installType: "ui",
    displayCategory: "primitives",
    availability: "available",
    widePreview: true,
    name: "Tree",
    category: "基础组件",
    description: "完整树键盘模型、Idea → Session → Run 层级与受控节点移动。",
    source: "components/ui/tree.tsx",
    relatedSources: ["components/ui/tree.module.css"],
    example: "components/examples/tree-demo.tsx",
    usage:
      '<Tree label="Sessions" nodes={nodes} selectedId={selectedId} onSelect={node => setSelectedId(node.id)} defaultExpandedIds={["idea"]} onMove={move => setNodes(current => moveTreeNode(current, move))} />',
    props: [
      {
        name: "nodes",
        type: "TreeNode[]",
        description: "稳定 ID、标题、图标、元数据、状态、子节点及子项数据态。",
      },
      {
        name: "selectedId / onSelect",
        type: "string / (node) => void",
        description: "默认单选，选择不隐式启动或恢复任务。",
      },
      {
        name: "expandedIds / onExpandedChange",
        type: "string[] / (ids) => void",
        description: "可受控展开；也可通过 defaultExpandedIds 初始化。",
      },
      {
        name: "onMove / canMove",
        type: "(move) => void / (move) => boolean",
        description: "有回调才开放拖拽及键盘移动；禁止自身/后代/禁用目标。",
      },
      {
        name: "onLoadChildren",
        type: "(node) => void",
        description: "显式加载、重试或分页回调；树本身不访问网络。",
      },
    ],
    notes: [
      "方向键、Home/End、Enter/Space、前缀定位与单一节点 tab stop。",
      "节点拖动支持 before / inside / after；同等能力可用下方“移动到”表单执行。",
      "移动结果由调用方确认；moveTreeNode 仅提供不可变内存树适配。",
    ],
  },
  {
    slug: "session-row",
    docPath: "/docs/session-row/",
    registryId: "session-row",
    registryDependencies: ["item", "button", "runtime-status-badge", "i18n"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "SessionRow",
    category: "组合模块",
    description: "Session 双行结构，选择与运行状态独立，操作由显式能力开放。",
    source: "components/blocks/session-row.tsx",
    relatedSources: ["components/blocks/entity-row.module.css"],
    example: "components/examples/session-row-demo.tsx",
    usage:
      '<SessionRow session={session} selected={selectedId === session.id} onSelect={() => select(session.id)} action={{ label: "继续", onAction: resume }} />',
    props: [
      {
        name: "session",
        type: "SessionRecord",
        description:
          "稳定 ID、标题、status、updatedAt；可选阶段、原因、模型和耗时。",
      },
      {
        name: "compact",
        type: "boolean",
        description: "默认双行56px，compact 单行40px。",
      },
      {
        name: "action",
        type: "{ label, onAction, busy?, disabledReason? }",
        description: "运行操作明确提供回调；忙碌防重复，禁用提供原因。",
      },
    ],
    notes: [
      "点击行仅选择；尾部操作是独立按钮，不会触发选择。",
      "缺失标题显示未命名 Session；真实写入和 Runtime 状态由调用方管理。",
    ],
  },
  {
    slug: "agent-row",
    docPath: "/docs/agent-row/",
    registryId: "agent-row",
    registryDependencies: ["item", "button", "runtime-status-badge", "i18n"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "AgentRow",
    category: "组合模块",
    description: "Agent 身份、模型、连接状态、汇总负载和统一运行状态。",
    source: "components/blocks/agent-row.tsx",
    relatedSources: ["components/blocks/entity-row.module.css"],
    example: "components/examples/agent-row-demo.tsx",
    usage:
      "<AgentRow agent={agent} selected={selectedId === agent.id} onSelect={() => select(agent.id)} />",
    props: [
      {
        name: "agent",
        type: "AgentRecord",
        description:
          "ID、名称、运行状态与可选模型、阶段、负载、汇总、离线信息。",
      },
      {
        name: "compact / selected / disabled",
        type: "boolean",
        description: "紧凑显示、选择和禁用均独立于 runtime 状态。",
      },
      {
        name: "action",
        type: "{ label, onAction, busy?, disabledReason? }",
        description: "配置或 Runtime 操作由调用方授权，每行最多一个显式操作。",
      },
    ],
    notes: [
      "未配置模型明确提示；idle 不表示离线，断线保留最后已知运行状态。",
      "紫色身份图标不覆盖运行状态颜色；汇总状态显式标明。",
    ],
  },
  {
    slug: "activity-timeline",
    docPath: "/docs/activity-timeline/",
    registryId: "activity-timeline",
    registryDependencies: [
      "theme",
      "utils",
      "button",
      "runtime-status-badge",
      "data-region",
      "use-follow-tail",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "ActivityTimeline",
    category: "组合模块",
    description:
      "Runtime 时间线：平铺事件、详情展开、去重、滚动跟随及新事件提示。",
    source: "components/blocks/activity-timeline.tsx",
    relatedSources: [
      "components/blocks/activity-timeline.module.css",
      "lib/use-follow-tail.ts",
    ],
    example: "components/examples/activity-timeline-demo.tsx",
    usage:
      '<ActivityTimeline events={events} selectedId={selectedId} onSelect={event => inspect(event.id)} data={{ state: "success" }} />',
    props: [
      {
        name: "deferOffscreen",
        type: "boolean",
        default: "false",
        description:
          "可选延迟屏外布局；保留全部 DOM 文本与浏览器查找，不卸载记录。",
      },
      {
        name: "revision",
        type: "string | number",
        description:
          "可选变更提示；追加、历史修订、删除、重排与状态变化均需推进，省略时保留兼容检测。",
      },
      {
        name: "events",
        type: "ActivityEvent[]",
        description:
          "来源顺序的稳定 eventId；时间、Agent、事件类型、操作、目标、状态、耗时和用量。",
      },
      {
        name: "compact",
        type: "boolean",
        description: "默认56px、compact40px；窄容器把完整字段移入详情。",
      },
      {
        name: "data",
        type: "DataRegionProps",
        description: "加载、空、部分、错误、完整数据及重试/分页回调。",
      },
      {
        name: "onSelect",
        type: "(event) => void",
        description: "可选主操作；与详情展开是相邻独立目标。",
      },
    ],
    notes: [
      "按 eventId 去重，保留来源顺序；只在距离底部不超过64px时跟随。",
      "滚离底部后显示新事件数量，点击返回最新；不抢夺阅读位置。",
    ],
  },
  {
    slug: "inspector",
    docPath: "/docs/inspector/",
    registryId: "inspector",
    registryDependencies: [
      "theme",
      "button",
      "runtime-status-badge",
      "data-region",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "Inspector",
    category: "组合模块",
    description: "当前对象的受控详情，统一 Metadata、缺失字段与复制反馈。",
    source: "components/blocks/inspector.tsx",
    relatedSources: ["components/blocks/inspector.module.css"],
    example: "components/examples/inspector-demo.tsx",
    usage:
      '<WorkspaceShell title="Workspace" sidebar={<Navigation />} inspector={<Inspector object={selectedObject} state="success" />}>\n  <SessionList />\n</WorkspaceShell>',
    props: [
      {
        name: "object",
        type: "InspectorObject | null",
        description: "单一受控对象；包含 ID、标题、类型、状态与 Metadata。",
      },
      {
        name: "state / error / onRetry",
        type: "DataState / RegionError / () => void",
        description: "无选择、加载、部分、完整、错误；缺失字段明确为 —。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "关联文件、Timeline 等详情区；不建立第二套业务存储。",
      },
    ],
    notes: [
      "Inspector 是详情内容；停靠、抽屉、resize 与焦点约束由 WorkspaceShell 提供。",
      "调用方按对象 ID 提供完整快照并处理迟到响应；组件不会自行发请求。",
    ],
  },
  {
    slug: "chat-message",
    docPath: "/docs/chat-message/",
    registryId: "chat-message",
    registryDependencies: [
      "theme",
      "utils",
      "button",
      "data-region",
      "use-follow-tail",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "ChatMessage",
    category: "组合模块",
    description:
      "同轴消息、独立工具槽、可中断输出、对话/工作区分栏与 IME 安全输入。",
    source: "components/blocks/chat-message.tsx",
    relatedSources: [
      "components/blocks/chat-message.module.css",
      "lib/use-follow-tail.ts",
    ],
    example: "components/examples/chat-message-demo.tsx",
    usage:
      "<Conversation messages={messages} workspace={<Files />} composer={<ChatComposer value={draft} onChange={setDraft} onSend={send} />} />",
    props: [
      {
        name: "deferOffscreen",
        type: "boolean",
        default: "false",
        description:
          "可选延迟屏外布局；保留全部 DOM 文本与浏览器查找，不卸载记录。",
      },
      {
        name: "revision",
        type: "string | number",
        description:
          "可选变更提示；追加、历史修订、删除、重排与状态变化均需推进，省略时保留兼容检测。",
      },
      {
        name: "ChatMessage",
        type: "ChatMessageProps",
        description:
          "user / agent / system；pending、streaming、completed、interrupted、failed、cancelled。",
      },
      {
        name: "Conversation",
        type: "ConversationProps",
        description: "受控消息数组、数据态、工作区和 Composer；窄屏切换视图。",
      },
      {
        name: "ChatComposer",
        type: "ChatComposerProps",
        description:
          "受控草稿、onSend、pending/streaming、显式停止回调与附件。",
      },
    ],
    notes: [
      "只跟随距底部64px以内的阅读位置；加载旧历史保留锚点，状态边界播报而非每个 token。",
      "Enter 发送、Shift+Enter 换行，IME 期间不发送；异步失败保留草稿。",
      "正文按文本渲染，不执行 HTML；富文本可通过受信任的 children 提供。",
    ],
  },
  {
    slug: "tool-call",
    docPath: "/docs/tool-call/",
    registryId: "tool-call",
    registryDependencies: [
      "theme",
      "button",
      "runtime-status-badge",
      "data-region",
      "redact",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "ToolCall",
    category: "组合模块",
    description:
      "独立工具执行记录：参数/输出、截断、脱敏、权限请求和未确认结果。",
    source: "components/blocks/tool-call.tsx",
    relatedSources: ["components/blocks/tool-call.module.css", "lib/redact.ts"],
    example: "components/examples/tool-call-demo.tsx",
    usage:
      '<ToolCall call={call} permission={{ scope: "写入指定文件", risk: "覆盖已有内容", onApprove: approve, onReject: reject }} onReconcile={reconcile} />',
    props: [
      {
        name: "call",
        type: "ToolCallRecord",
        description:
          "callId、工具名、运行状态；参数、输出、结果是否已确认、Receipt 与真实 exitCode。",
      },
      {
        name: "permission",
        type: "{ scope, risk, onApprove?, onReject? }",
        description: "只有 waiting 的已知结果显示授权；明确点击才触发回调。",
      },
      {
        name: "onCancel / onRetry / onReconcile",
        type: "() => void | Promise<void>",
        description: "显式能力；未确认结果只允许查询，取消等待来源确认。",
      },
      {
        name: "data / onDownload",
        type: "DataRegionProps / (sanitizedOutput) => void",
        description: "详情数据态与脱敏输出导出。",
      },
    ],
    notes: [
      "参数/输出在展示、复制和导出前按敏感键与常见凭据格式脱敏；业务特殊凭据需调用方预处理。",
      "预览上限200行/32KiB，参数与输出各自滚动；来源只有片段时不声称可还原完整输出。",
      "不执行工具、不发网络请求、不自动批准，不伪造完成或退出码。",
    ],
  },

  {
    slug: "agent-run-properties",
    docPath: "/docs/agent-run-properties/",
    registryId: "agent-run-properties",
    registryDependencies: [
      "theme",
      "runtime-status-badge",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentRunProperties",
    category: "组合模块",
    description: "共享运行身份、模型、耗时与原始状态。",
    source: "components/blocks/agent-run-properties.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { AgentRunProperties } from "@/components/blocks/agent-run-properties"',
    props: [
      {
        name: "run",
        type: "AgentRunSnapshot",
        description: "共享运行身份、模型、耗时与原始状态。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "run-stage-summary",
    docPath: "/docs/run-stage-summary/",
    registryId: "run-stage-summary",
    registryDependencies: ["theme", "agent-board-model", "i18n"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "RunStageSummary",
    category: "组合模块",
    description: "来源阶段与有明确分母的步骤计数，不生成假进度。",
    source: "components/blocks/run-stage-summary.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { RunStageSummary } from "@/components/blocks/run-stage-summary"',
    props: [
      {
        name: "stage / status",
        type: "RunStage | undefined / string | undefined",
        description: "来源阶段与有明确分母的步骤计数，不生成假进度。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-run-row",
    docPath: "/docs/agent-run-row/",
    registryId: "agent-run-row",
    registryDependencies: [
      "theme",
      "item",
      "agent-run-properties",
      "run-stage-summary",
      "agent-run-card",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentRunRow",
    category: "组合模块",
    description: "紧凑运行行；查看与尾部操作使用兄弟目标。",
    source: "components/blocks/agent-run-row.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage: 'import { AgentRunRow } from "@/components/blocks/agent-run-row"',
    props: [
      {
        name: "run / selected",
        type: "AgentRunSnapshot / boolean",
        description: "紧凑运行行；查看与尾部操作使用兄弟目标。",
      },
      {
        name: "onOpen / actions",
        type: "(runId: string) => void / ReactNode",
        description: "紧凑运行行；查看与尾部操作使用兄弟目标。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-run-card",
    docPath: "/docs/agent-run-card/",
    registryId: "agent-run-card",
    registryDependencies: [
      "theme",
      "agent-run-properties",
      "run-stage-summary",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentRunCard",
    category: "组合模块",
    description: "独立运行卡片；缺失计数保留为未知。",
    source: "components/blocks/agent-run-card.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage: 'import { AgentRunCard } from "@/components/blocks/agent-run-card"',
    props: [
      {
        name: "run / selected",
        type: "AgentRunSnapshot / boolean",
        description: "独立运行卡片；缺失计数保留为未知。",
      },
      {
        name: "onOpen / actions",
        type: "(runId: string) => void / ReactNode",
        description: "独立运行卡片；缺失计数保留为未知。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-run-list",
    docPath: "/docs/agent-run-list/",
    registryId: "agent-run-list",
    registryDependencies: [
      "theme",
      "agent-run-row",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentRunList",
    category: "组合模块",
    description: "同一运行集合的只读分组列表。",
    source: "components/blocks/agent-run-list.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage: 'import { AgentRunList } from "@/components/blocks/agent-run-list"',
    props: [
      {
        name: "records",
        type: "readonly AgentRunSnapshot[]",
        description: "同一运行集合的只读分组列表。",
      },
      {
        name: "selectedRunId / onOpen",
        type: "string | null / (runId: string) => void",
        description: "同一运行集合的只读分组列表。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-run-board",
    docPath: "/docs/agent-run-board/",
    registryId: "agent-run-board",
    registryDependencies: [
      "theme",
      "item-board",
      "agent-run-card",
      "agent-run-list",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentRunBoard",
    category: "组合模块",
    description: "按来源状态派生分列的只读运行看板。",
    source: "components/blocks/agent-run-board.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { AgentRunBoard } from "@/components/blocks/agent-run-board"',
    props: [
      {
        name: "records",
        type: "readonly AgentRunSnapshot[]",
        description: "按来源状态派生分列的只读运行看板。",
      },
      {
        name: "selectedRunId / onOpen",
        type: "string | null / (runId: string) => void",
        description: "按来源状态派生分列的只读运行看板。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-run-inspector",
    docPath: "/docs/agent-run-inspector/",
    registryId: "agent-run-inspector",
    registryDependencies: [
      "theme",
      "inspector",
      "agent-row",
      "session-row",
      "run-stage-summary",
      "approval-request-panel",
      "artifact-list",
      "execution-trace-tree",
      "agent-relationship-list",
      "activity-timeline",
      "segmented",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentRunInspector",
    category: "组合模块",
    description: "完整受控运行详情，组合请求、执行、产物与关联。",
    source: "components/blocks/agent-run-inspector.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { AgentRunInspector } from "@/components/blocks/agent-run-inspector"',
    props: [
      {
        name: "snapshot",
        type: "AgentRunDetailSnapshot",
        description: "完整受控运行详情，组合请求、执行、产物与关联。",
      },
      {
        name: "drafts / onDraftChange",
        type: "Record<string, string> / (id, value) => void",
        description: "完整受控运行详情，组合请求、执行、产物与关联。",
      },
      {
        name: "onAction / canReconcile",
        type: "(request, action) => Promise<void> / boolean",
        description: "完整受控运行详情，组合请求、执行、产物与关联。",
      },
      {
        name: "onOpen",
        type: "(runId: string) => void",
        description: "完整受控运行详情，组合请求、执行、产物与关联。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "attention-queue",
    docPath: "/docs/attention-queue/",
    registryId: "attention-queue",
    registryDependencies: [
      "theme",
      "item",
      "data-region",
      "agent-board-model",
      "redact",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AttentionQueue",
    category: "组合模块",
    description: "按关注 ID 去重；请求数与运行数分别表达。",
    source: "components/blocks/attention-queue.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { AttentionQueue } from "@/components/blocks/attention-queue"',
    props: [
      {
        name: "records / kind",
        type: "readonly AttentionRecord[] / string",
        description: "按关注 ID 去重；请求数与运行数分别表达。",
      },
      {
        name: "onOpen",
        type: "(runId: string) => void",
        description: "按关注 ID 去重；请求数与运行数分别表达。",
      },
      {
        name: "AttentionItem.record",
        type: "AttentionRecord",
        description: "按关注 ID 去重；请求数与运行数分别表达。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "approval-request-panel",
    docPath: "/docs/approval-request-panel/",
    registryId: "approval-request-panel",
    registryDependencies: [
      "theme",
      "button",
      "tool-call",
      "agent-board-model",
      "redact",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "ApprovalRequestPanel",
    category: "组合模块",
    description: "工具审批复用 ToolCall；未知结果必须先核对。",
    source: "components/blocks/approval-request-panel.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { ApprovalRequestPanel } from "@/components/blocks/approval-request-panel"',
    props: [
      {
        name: "request",
        type: "AttentionRecord",
        description: "工具审批复用 ToolCall；未知结果必须先核对。",
      },
      {
        name: "draft / onDraftChange",
        type: "string / (value: string) => void",
        description: "工具审批复用 ToolCall；未知结果必须先核对。",
      },
      {
        name: "onAction / canReconcile",
        type: '(action: AttentionAction | "reconcile") => Promise<void> / boolean',
        description: "工具审批复用 ToolCall；未知结果必须先核对。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "artifact-list",
    docPath: "/docs/artifact-list/",
    registryId: "artifact-list",
    registryDependencies: [
      "theme",
      "item",
      "data-region",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "ArtifactList",
    category: "组合模块",
    description: "产物入口、可用状态与独立审阅摘要。",
    source: "components/blocks/artifact-list.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage: 'import { ArtifactList } from "@/components/blocks/artifact-list"',
    props: [
      {
        name: "records",
        type: "readonly ArtifactRecord[]",
        description: "产物入口、可用状态与独立审阅摘要。",
      },
      {
        name: "ReviewSummary.review",
        type: "ReviewSnapshot | undefined",
        description: "产物入口、可用状态与独立审阅摘要。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "review-summary",
    docPath: "/docs/review-summary/",
    registryId: "review-summary",
    registryDependencies: ["artifact-list", "i18n"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "ReviewSummary",
    category: "组合模块",
    description: "审阅、业务验收与 PR 状态分别呈现。",
    source: "components/blocks/artifact-list.tsx",
    relatedSources: [],
    example: "components/examples/agent-board/component-demos.tsx",
    usage: 'import { ReviewSummary } from "@/components/blocks/artifact-list"',
    props: [
      {
        name: "review",
        type: "ReviewSnapshot | undefined",
        description: "审阅、业务验收与 PR 状态分别呈现。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "execution-trace-tree",
    docPath: "/docs/execution-trace-tree/",
    registryId: "execution-trace-tree",
    registryDependencies: [
      "theme",
      "tree",
      "tool-call",
      "data-region",
      "agent-board-model",
      "redact",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "ExecutionTraceTree",
    category: "组合模块",
    description: "可观测父子执行步骤与脱敏工具详情。",
    source: "components/blocks/execution-trace-tree.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { ExecutionTraceTree } from "@/components/blocks/execution-trace-tree"',
    props: [
      {
        name: "steps",
        type: "readonly TraceStep[]",
        description: "可观测父子执行步骤与脱敏工具详情。",
      },
      {
        name: "selectedStepId / onSelect",
        type: "string / (stepId: string) => void",
        description: "可观测父子执行步骤与脱敏工具详情。",
      },
      {
        name: "expandedIds / onExpandedChange",
        type: "string[] / (ids: string[]) => void",
        description: "可观测父子执行步骤与脱敏工具详情。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-relationship-list",
    docPath: "/docs/agent-relationship-list/",
    registryId: "agent-relationship-list",
    registryDependencies: [
      "theme",
      "item",
      "data-region",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentRelationshipList",
    category: "组合模块",
    description: "仅展示来源明确的运行关联与交接。",
    source: "components/blocks/agent-relationship-list.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { AgentRelationshipList } from "@/components/blocks/agent-relationship-list"',
    props: [
      {
        name: "records / runId",
        type: "readonly RunRelationship[] / string",
        description: "仅展示来源明确的运行关联与交接。",
      },
      {
        name: "onOpen",
        type: "(runId: string) => void",
        description: "仅展示来源明确的运行关联与交接。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-usage-summary",
    docPath: "/docs/agent-usage-summary/",
    registryId: "agent-usage-summary",
    registryDependencies: ["theme","metric-summary","data-table","agent-board-model","i18n","runtime-status-badge"],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentUsageSummary",
    category: "组合模块",
    description: "来源用量去重、覆盖说明与分币种合计。",
    source: "components/blocks/agent-usage-summary.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { AgentUsageSummary } from "@/components/blocks/agent-usage-summary"',
    props: [
      {
        name: "runs / observations",
        type: "readonly AgentRunSnapshot[] / readonly UsageObservation[]",
        description: "来源用量去重、覆盖说明与分币种合计。",
      },
      {
        name: "scopeLabel",
        type: "string",
        description: "来源用量去重、覆盖说明与分币种合计。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-board-toolbar",
    docPath: "/docs/agent-board-toolbar/",
    registryId: "agent-board-toolbar",
    registryDependencies: [
      "theme",
      "input",
      "select",
      "segmented",
      "filter-toolbar",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentBoardToolbar",
    category: "组合模块",
    description: "共享运行筛选与可选依赖视图受控切换。",
    source: "components/blocks/agent-board-toolbar.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage:
      'import { AgentBoardToolbar } from "@/components/blocks/agent-board-toolbar"',
    props: [
      {
        name: "records / viewState",
        type: "readonly AgentRunSnapshot[] / AgentBoardViewState",
        description: "共享运行筛选与四视图受控切换。",
      },
      {
        name: "onViewChange",
        type: "(view: AgentBoardViewState) => void",
        description: "共享运行筛选与四视图受控切换。",
      },
      {
        name: "hasDependencies",
        type: "boolean",
        description: "共享运行筛选与可选依赖视图受控切换。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    slug: "agent-board-workspace",
    docPath: "/docs/agent-board-workspace/",
    registryId: "agent-board-workspace",
    registryDependencies: [
      "theme",
      "workspace-shell",
      "agent-run-board",
      "agent-run-list",
      "attention-queue",
      "agent-usage-summary",
      "agent-board-toolbar",
      "agent-run-inspector",
      "data-region",
      "sheet",
      "agent-board-model",
      "i18n",
      "agent-dependency-graph",
      "agent-usage-history",
      "agent-run-virtual-list",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    widePreview: true,
    name: "AgentBoardWorkspace",
    category: "组合模块",
    description: "受控 Agent 工作台；路由、服务与持久化归调用方。",
    source: "components/blocks/agent-board-workspace.tsx",
    relatedSources: ["components/blocks/agent-board.module.css"],
    example: "components/examples/agent-board/agent-board-demo.tsx",
    usage:
      'import { AgentBoardWorkspace } from "@/components/blocks/agent-board-workspace"',
    props: [
      {
        name: "records / attention / usage",
        type: "AgentBoardWorkspaceProps",
        description: "受控 Agent 工作台；路由、服务与持久化归调用方。",
      },
      {
        name: "viewState / selectedRunId / detail",
        type: "AgentBoardViewState / string | null / AgentRunDetailSnapshot | null",
        description: "受控 Agent 工作台；路由、服务与持久化归调用方。",
      },
      {
        name: "onViewChange / onOpen",
        type: "(view) => void / (runId: string | null) => void",
        description: "受控 Agent 工作台；路由、服务与持久化归调用方。",
      },
      {
        name: "data / connection / totalCount / loadedCount",
        type: "DataRegionProps / AgentBoardConnection / number / number",
        description: "受控 Agent 工作台；路由、服务与持久化归调用方。",
      },
      {
        name: "inspector / sidebar / exampleControls / headerActions / scopeLabel / fill",
        type: "AgentBoardWorkspaceProps",
        description: "受控 Agent 工作台；路由、服务与持久化归调用方。",
      },
      {
        name: "dependencies / history / listVirtualization",
        type: "AgentRunDependency[] / AgentUsageHistoryPoint[] / { enabled?, threshold?, height? }",
        description: "受控 Agent 工作台；路由、服务与持久化归调用方。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
  },
  {
    "slug": "grouped-list",
    "docPath": "/docs/grouped-list/",
    "registryId": "grouped-list",
    "registryDependencies": [
      "theme",
      "button",
      "data-region",
      "i18n",
      "grouped-items-model"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "GroupedList",
    "category": "组合模块",
    "description": "受控分组列表，保留分组读取状态与未知总数。",
    "source": "components/blocks/grouped-list.tsx",
    "relatedSources": [
      "components/blocks/grouped-list.module.css"
    ],
    "example": "components/examples/agent-board/component-demos.tsx",
    "usage": "import { GroupedList } from \"@/components/blocks/grouped-list\"",
    "props": [
      {
        "name": "groups / items / getItemId / renderItem / collapsedGroupIds / onLoadMore / onRetryGroup",
        "type": "GroupedListProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
{
    slug: "item-board",
    docPath: "/docs/item-board/",
    registryId: "item-board",
    registryDependencies: [
      "theme",
      "button",
      "popover",
      "grouped-list",
      "grouped-items-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "Board",
    category: "组合模块",
    description: "通用受控看板，指针、触屏与键盘移动共享命令。",
    source: "components/blocks/item-board.tsx",
    relatedSources: ["components/blocks/item-board.module.css"],
    example: "components/examples/agent-board/component-demos.tsx",
    usage: 'import { Board } from "@/components/blocks/item-board"',
    props: [
      {
        name: "queryKey / groups / canMove / onMove / manualOrder / allowAppend",
        type: "BoardProps",
        description: "调用方负责权威快照、权限、写入、分页与未知结果对账。",
      },
    ],
    notes: ["调用方负责权威快照、权限、写入、分页与未知结果对账。"],
    widePreview: true,
  },
  {
    "slug": "work-item-properties",
    "docPath": "/docs/work-item-properties/",
    "registryId": "work-item-properties",
    "registryDependencies": [
      "theme",
      "button",
      "input",
      "select",
      "combobox",
      "popover",
      "avatar",
      "runtime-status-badge",
      "i18n",
      "work-items-model",
      "work-items-styles"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemProperties",
    "category": "组合模块",
    "description": "工作项共享属性与选择器，业务状态独立于运行状态。",
    "source": "components/blocks/work-item-properties.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemProperties } from \"@/components/blocks/work-item-properties\"",
    "props": [
      {
        "name": "item / catalog / visibleProperties / capabilities / onPatchItem / mutation / today",
        "type": "WorkItemPropertiesProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-item-row",
    "docPath": "/docs/work-item-row/",
    "registryId": "work-item",
    "registryDependencies": [
      "theme",
      "checkbox",
      "button",
      "work-item-properties",
      "work-items-model",
      "work-items-styles",
      "i18n"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemRow",
    "category": "组合模块",
    "description": "工作项行与卡片，主目标、勾选及属性为兄弟目标。",
    "source": "components/blocks/work-item.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemRow } from \"@/components/blocks/work-item\"",
    "props": [
      {
        "name": "item / onSelect / selected / active / href / onOpen / actions / mutation / onReconcile",
        "type": "WorkItemPresentationProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-item-card",
    "docPath": "/docs/work-item-card/",
    "registryId": "work-item",
    "registryDependencies": [
      "theme",
      "checkbox",
      "button",
      "work-item-properties",
      "work-items-model",
      "work-items-styles",
      "i18n"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemCard",
    "category": "组合模块",
    "description": "工作项行与卡片，主目标、勾选及属性为兄弟目标。",
    "source": "components/blocks/work-item.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemCard } from \"@/components/blocks/work-item\"",
    "props": [
      {
        "name": "item / onSelect / selected / active / href / onOpen / actions / mutation / onReconcile",
        "type": "WorkItemPresentationProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-item-list",
    "docPath": "/docs/work-item-list/",
    "registryId": "work-items-views",
    "registryDependencies": [
      "theme",
      "grouped-list",
      "work-items-board-base",
      "work-item",
      "work-item-properties",
      "work-items-model",
      "data-table",
      "i18n",
      "button",
      "data-region",
      "work-items-styles"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemList",
    "category": "组合模块",
    "description": "同一工作项快照的列表、看板和表格适配。",
    "source": "components/blocks/work-items-views.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemList } from \"@/components/blocks/work-items-views\"",
    "props": [
      {
        "name": "items / groups / interaction / getPresentation / onSelectionChange",
        "type": "WorkItemsViewProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      },
      {
        "name": "hierarchy / deferOffscreen",
        "type": "WorkItemsHierarchy / boolean",
        "description": "调用方持有权威快照、版本、权限、写入与未知结果；组件不存储业务数据。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-item-board",
    "docPath": "/docs/work-item-board/",
    "registryId": "work-items-views",
    "registryDependencies": [
      "theme",
      "grouped-list",
      "work-items-board-base",
      "work-item",
      "work-item-properties",
      "work-items-model",
      "data-table",
      "i18n",
      "button",
      "data-region",
      "work-items-styles"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemBoard",
    "category": "组合模块",
    "description": "同一工作项快照的列表、看板和表格适配。",
    "source": "components/blocks/work-items-views.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemBoard } from \"@/components/blocks/work-items-views\"",
    "props": [
      {
        "name": "items / groups / interaction / getPresentation / onSelectionChange",
        "type": "WorkItemsViewProps & Board movement props",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      },
      {
        "name": "lanes / onCreateInLane / onLoadMoreInLane / onRetryInLane / onMove",
        "type": "WorkItemBoardProps",
        "description": "调用方持有权威快照、版本、权限、写入与未知结果；组件不存储业务数据。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-item-table",
    "docPath": "/docs/work-item-table/",
    "registryId": "work-items-views",
    "registryDependencies": [
      "theme",
      "grouped-list",
      "work-items-board-base",
      "work-item",
      "work-item-properties",
      "work-items-model",
      "data-table",
      "i18n",
      "button",
      "data-region",
      "work-items-styles"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemTable",
    "category": "组合模块",
    "description": "同一工作项快照的列表、看板和表格适配。",
    "source": "components/blocks/work-items-views.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemTable } from \"@/components/blocks/work-items-views\"",
    "props": [
      {
        "name": "items / groups / interaction / getPresentation / onSelectionChange",
        "type": "WorkItemsViewProps & DataTable sorting props",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-items-toolbar",
    "docPath": "/docs/work-items-toolbar/",
    "registryId": "work-items-toolbar",
    "registryDependencies": [
      "theme",
      "button",
      "input",
      "checkbox",
      "segmented",
      "popover",
      "filter-toolbar",
      "work-item-properties",
      "work-items-model",
      "work-items-styles",
      "i18n"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemsToolbar",
    "category": "组合模块",
    "description": "工作项搜索、筛选、布局、排序与显示设置。",
    "source": "components/blocks/work-items-toolbar.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemsToolbar } from \"@/components/blocks/work-items-toolbar\"",
    "props": [
      {
        "name": "view / onViewChange / catalog",
        "type": "WorkItemsToolbarProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      },
      {
        "name": "enhancements / extensions",
        "type": "capability flags / ReactNode",
        "description": "调用方持有权威快照、版本、权限、写入与未知结果；组件不存储业务数据。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-item-detail",
    "docPath": "/docs/work-item-detail/",
    "registryId": "work-item-detail",
    "registryDependencies": ["theme", "button", "input", "field", "work-item", "work-item-properties", "work-items-model", "work-items-styles", "i18n", "work-item-date-range-field"],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemDetail / WorkItemQuickCreate",
    "category": "组合模块",
    "description": "受控工作项详情及保留失败草稿的快速创建。",
    "source": "components/blocks/work-item-detail.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemDetail } from \"@/components/blocks/work-item-detail\"",
    "props": [
      {
        "name": "item / catalog / capabilities / onPatchItem / mutation / onCreate / onReconcile / onUnknown",
        "type": "WorkItemPropertiesProps / QuickCreate controlled props",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-items-workspace",
    "docPath": "/docs/work-items-workspace/",
    "registryId": "work-items-workspace",
    "registryDependencies": ["theme", "workspace-shell", "work-items-toolbar", "work-items-views", "work-item-detail", "data-region", "button", "checkbox", "work-items-model", "grouped-items-model", "work-items-styles", "i18n", "work-items-enhancements", "work-item-timeline", "work-item-calendar", "schedule-view-controls"],
    "installType": "block",
    "displayCategory": "workspace",
    "availability": "available",
    "name": "WorkItemsWorkspace",
    "category": "组合模块",
    "description": "组合三种工作项布局与详情，路由和服务由调用方持有。",
    "source": "components/blocks/work-items-workspace.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { WorkItemsWorkspace } from \"@/components/blocks/work-items-workspace\"",
    "props": [
      {
        "name": "view / onViewChange / items / groups / interaction / activeItem / queryKey / onMove / data / notes",
        "type": "WorkItemsWorkspaceProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      },
      {
        "name": "hierarchy / lanes / batchActions / savedViews",
        "type": "optional controlled enhancement props",
        "description": "调用方持有权威快照、版本、权限、写入与未知结果；组件不存储业务数据。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-items-board-base",
    "docPath": "/docs/work-items-board-base/",
    "registryId": "work-items-board-base",
    "registryDependencies": [
      "theme",
      "button",
      "popover",
      "grouped-list",
      "grouped-items-model",
      "i18n"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "Board",
    "category": "组合模块",
    "description": "通用受控看板，指针、触屏与键盘移动共享命令。",
    "source": "components/blocks/work-items-board-base.tsx",
    "relatedSources": [
      "components/blocks/work-items-board-base.module.css"
    ],
    "example": "components/examples/work-items-components-demo.tsx",
    "usage": "import { Board } from \"@/components/blocks/work-items-board-base\"",
    "props": [
      {
        "name": "queryKey / groups / canMove / onMove / manualOrder / allowAppend / getItemRevision",
        "type": "BoardProps",
        "description": "调用方负责权威快照、权限、写入、分页与未知结果对账。"
      }
    ],
    "notes": [
      "调用方负责权威快照、权限、写入、分页与未知结果对账。"
    ],
    "widePreview": true
  },
{
    slug: "agent-dependency-graph",
    docPath: "/docs/agent-dependency-graph/",
    registryId: "agent-dependency-graph",
    registryDependencies: [
      "theme",
      "workflow-canvas",
      "runtime-status-badge",
      "data-region",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "AgentDependencyGraph",
    category: "组合模块",
    description: "仅展示来源明确的运行依赖；只读画布与可访问列表同步。",
    source: "components/blocks/agent-dependency-graph.tsx",
    relatedSources: ["components/blocks/agent-board-p2.module.css"],
    example: "components/examples/agent-board/p2-demos.tsx",
    usage:
      'import { AgentDependencyGraph } from "@/components/blocks/agent-dependency-graph"',
    props: [
      {
        name: "records / dependencies / scopeRunIds",
        type: "readonly AgentRunSnapshot[] / AgentRunDependency[] / string[]",
        description: "仅展示来源明确的运行依赖；只读画布与可访问列表同步。",
      },
      {
        name: "selectedRunId / onOpen",
        type: "string | null / (runId: string) => void",
        description: "仅展示来源明确的运行依赖；只读画布与可访问列表同步。",
      },
      {
        name: "maxNodes / data",
        type: "number (1–500, default 200) / DataRegionProps",
        description: "仅展示来源明确的运行依赖；只读画布与可访问列表同步。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
    widePreview: true,
  },
{
    slug: "agent-usage-history",
    docPath: "/docs/agent-usage-history/",
    registryId: "agent-usage-history",
    registryDependencies: [
      "theme",
      "segmented",
      "data-table",
      "data-region",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "AgentUsageHistory",
    category: "组合模块",
    description: "来源区间历史；运行与币种独立，缺失观测保留断点。",
    source: "components/blocks/agent-usage-history.tsx",
    relatedSources: ["components/blocks/agent-board-p2.module.css"],
    example: "components/examples/agent-board/p2-demos.tsx",
    usage:
      'import { AgentUsageHistory } from "@/components/blocks/agent-usage-history"',
    props: [
      {
        name: "points / scopeRunIds / scopeLabel",
        type: "readonly AgentUsageHistoryPoint[] / string[] / string",
        description: "来源区间历史；运行与币种独立，缺失观测保留断点。",
      },
      {
        name: "metric / onMetricChange",
        type: "AgentUsageMetric / (metric) => void",
        description: "来源区间历史；运行与币种独立，缺失观测保留断点。",
      },
      {
        name: "data",
        type: "DataRegionProps",
        description: "来源区间历史；运行与币种独立，缺失观测保留断点。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
    widePreview: true,
  },
{
    slug: "agent-run-virtual-list",
    docPath: "/docs/agent-run-virtual-list/",
    registryId: "agent-run-virtual-list",
    registryDependencies: [
      "theme",
      "agent-run-row",
      "agent-run-list",
      "data-region",
      "agent-board-model",
      "i18n",
    ],
    installType: "block",
    displayCategory: "patterns",
    availability: "available",
    name: "AgentRunVirtualList",
    category: "组合模块",
    description: "可变行高的受控运行列表，保留离屏焦点和完整加载口径。",
    source: "components/blocks/agent-run-virtual-list.tsx",
    relatedSources: ["components/blocks/agent-board-p2.module.css"],
    example: "components/examples/agent-board/p2-demos.tsx",
    usage:
      'import { AgentRunVirtualList } from "@/components/blocks/agent-run-virtual-list"',
    props: [
      {
        name: "records / selectedRunId / onOpen",
        type: "readonly AgentRunSnapshot[] / string | null / (runId) => void",
        description: "可变行高的受控运行列表，保留离屏焦点和完整加载口径。",
      },
      {
        name: "height / overscan / data",
        type: "number (240–900) / number (1–30) / DataRegionProps",
        description: "可变行高的受控运行列表，保留离屏焦点和完整加载口径。",
      },
    ],
    notes: ["示例仅证明本地组件交互；真实授权、执行和存储由调用方提供。"],
    widePreview: true,
  },
  {
    "slug": "work-items-batch-actions",
    "docPath": "/docs/work-items-batch-actions/",
    "registryId": "work-items-enhancements",
    "registryDependencies": [
      "theme",
      "work-item",
      "work-item-properties",
      "work-items-model",
      "work-items-styles",
      "i18n",
      "button",
      "input",
      "dialog",
      "popover",
      "data-region"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemsBatchActions",
    "category": "组合模块",
    "description": "受控批量字段修改、逐项回执与调用方保存视图接口。",
    "source": "components/blocks/work-items-enhancements.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-enhancements-demo.tsx",
    "usage": "import { WorkItemsBatchActions } from \"@/components/blocks/work-items-enhancements\"",
    "props": [
      {
        "name": "items / selectedIds / capabilities / mutations / onApply",
        "type": "WorkItemsBatchActionsProps",
        "description": "调用方持有权威快照、版本、权限、写入与未知结果；组件不存储业务数据。"
      }
    ],
    "notes": [
      "批量仅状态/优先级；保存视图无默认持久化。真实服务由调用方接入。"
    ],
    "widePreview": true
  },
  {
    "slug": "work-items-saved-views",
    "docPath": "/docs/work-items-saved-views/",
    "registryId": "work-items-enhancements",
    "registryDependencies": [
      "theme",
      "work-item",
      "work-item-properties",
      "work-items-model",
      "work-items-styles",
      "i18n",
      "button",
      "input",
      "dialog",
      "popover",
      "data-region"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "name": "WorkItemsSavedViews",
    "category": "组合模块",
    "description": "受控批量字段修改、逐项回执与调用方保存视图接口。",
    "source": "components/blocks/work-items-enhancements.tsx",
    "relatedSources": [],
    "example": "components/examples/work-items-enhancements-demo.tsx",
    "usage": "import { WorkItemsSavedViews } from \"@/components/blocks/work-items-enhancements\"",
    "props": [
      {
        "name": "views / view / mutation / onApply / onSave / onDelete / onUnknown",
        "type": "WorkItemsSavedViewsProps",
        "description": "调用方持有权威快照、版本、权限、写入与未知结果；组件不存储业务数据。"
      }
    ],
    "notes": [
      "批量仅状态/优先级；保存视图无默认持久化。真实服务由调用方接入。"
    ],
    "widePreview": true
  },
{
  "slug": "timeline",
  "docPath": "/docs/timeline/",
  "registryId": "timeline",
  "registryDependencies": [
    "theme",
    "button",
    "i18n",
    "work-items-model"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "Timeline",
  "category": "组合模块",
  "description": "业务无关的排期行、按日吸附与区间裁切。",
  "source": "components/blocks/timeline.tsx",
  "relatedSources": [
    "components/blocks/timeline.module.css"
  ],
  "example": "components/examples/work-items-schedule-demo.tsx",
  "usage": "import { Timeline } from \"@/components/blocks/timeline\"",
  "props": [
    {
      "name": "items / viewport / scale / today / queryKey",
      "type": "readonly TimelineRecord[] / ScheduleViewport / TimelineScale / string",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "renderSidebar / onEdit / onDateChange",
      "type": "(item) => ReactNode / (item) => void / (change: TimelineDateChange) => void",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "selectedIds / activeId / getScrollPosition / onScrollPosition",
      "type": "readonly string[] / string | null / scroll callbacks",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    }
  ],
  "notes": [
    "本地示例刷新清除；真实服务仍由调用方接入。"
  ],
  "widePreview": true
},
{
  "slug": "calendar",
  "docPath": "/docs/calendar/",
  "registryId": "calendar",
  "registryDependencies": [
    "theme",
    "button",
    "i18n",
    "work-items-model",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "Calendar",
  "category": "组合模块",
  "description": "受控月、周与当日Agenda，消费权威按日快照。",
  "source": "components/blocks/calendar.tsx",
  "relatedSources": [
    "components/blocks/calendar.module.css"
  ],
  "example": "components/examples/work-items-schedule-demo.tsx",
  "usage": "import { Calendar } from \"@/components/blocks/calendar\"",
  "props": [
    {
      "name": "value / onChange / today",
      "type": "CalendarSettings / (value: CalendarSettings) => void / string",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "buckets / queryKey / getItem / renderEntry",
      "type": "readonly DateBucketSnapshot[] / string / (id) => T | undefined / (item, context) => ReactNode",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "onDropItem / onCreate / onLoadMore / onRetry / maxVisible",
      "type": "caller capability callbacks / number",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    }
  ],
  "notes": [
    "本地示例刷新清除；真实服务仍由调用方接入。"
  ],
  "widePreview": true
},
{
  "slug": "schedule-view-controls",
  "docPath": "/docs/schedule-view-controls/",
  "registryId": "schedule-view-controls",
  "registryDependencies": [
    "theme",
    "button",
    "i18n",
    "work-items-model",
    "input"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "ScheduleViewControls",
  "category": "组合模块",
  "description": "受控排期锚点、刻度、每周首日与周末显隐。",
  "source": "components/blocks/schedule-view-controls.tsx",
  "relatedSources": [
    "components/blocks/schedule.module.css"
  ],
  "example": "components/examples/work-items-schedule-demo.tsx",
  "usage": "import { ScheduleViewControls } from \"@/components/blocks/schedule-view-controls\"",
  "props": [
    {
      "name": "kind / value / onChange / today",
      "type": "timeline | calendar / TimelineSettings | CalendarSettings / controlled callback / string",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    }
  ],
  "notes": [
    "本地示例刷新清除；真实服务仍由调用方接入。"
  ],
  "widePreview": true
},
{
  "slug": "work-item-date-range-field",
  "docPath": "/docs/work-item-date-range-field/",
  "registryId": "work-item-date-range-field",
  "registryDependencies": [
    "theme",
    "button",
    "i18n",
    "work-items-model",
    "input",
    "field",
    "popover",
    "schedule-view-controls"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkItemDateRangeField",
  "category": "组合模块",
  "description": "成对日期意图、字段权限、校验与失败草稿保留。",
  "source": "components/blocks/work-item-date-range-field.tsx",
  "relatedSources": [],
  "example": "components/examples/work-items-schedule-demo.tsx",
  "usage": "import { WorkItemDateRangeField } from \"@/components/blocks/work-item-date-range-field\"",
  "props": [
    {
      "name": "item / capabilities / mutation / queryKey / dueOnly",
      "type": "WorkItemRecord / WorkItemCapabilities / MutationState / string / boolean",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "proposedDates / onDraftChange / onChange",
      "type": "ScheduleDates / (dates) => void / (intent: ScheduleChangeIntent) => void",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    }
  ],
  "notes": [
    "本地示例刷新清除；真实服务仍由调用方接入。"
  ],
  "widePreview": true
},
{
  "slug": "work-items-schedule",
  "docPath": "/docs/work-items-schedule/",
  "registryId": "work-items-schedule",
  "registryDependencies": [
    "theme",
    "button",
    "i18n",
    "work-items-model",
    "checkbox",
    "work-item",
    "work-items-views",
    "work-item-date-range-field",
    "schedule-view-controls",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "UnscheduledWorkItems",
  "category": "组合模块",
  "description": "去重未排期队列与紧凑工作项日历条目。",
  "source": "components/blocks/work-items-schedule.tsx",
  "relatedSources": [],
  "example": "components/examples/work-items-schedule-demo.tsx",
  "usage": "import { UnscheduledWorkItems } from \"@/components/blocks/work-items-schedule\"",
  "props": [
    {
      "name": "props / kind",
      "type": "WorkItemScheduleViewProps / timeline | calendar",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "props.unscheduled / onLoadUnscheduled / onRetryUnscheduled",
      "type": "authoritative snapshot / read callbacks",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    }
  ],
  "notes": [
    "本地示例刷新清除；真实服务仍由调用方接入。"
  ],
  "widePreview": true
},
{
  "slug": "work-item-timeline",
  "docPath": "/docs/work-item-timeline/",
  "registryId": "work-item-timeline",
  "registryDependencies": [
    "theme",
    "button",
    "i18n",
    "work-items-model",
    "timeline",
    "work-items-schedule",
    "work-item-date-range-field",
    "dialog",
    "data-region"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkItemTimeline",
  "category": "组合模块",
  "description": "工作项排期，平移与两端调整使用独立字段能力。",
  "source": "components/blocks/work-item-timeline.tsx",
  "relatedSources": [],
  "example": "components/examples/work-items-schedule-demo.tsx",
  "usage": "import { WorkItemTimeline } from \"@/components/blocks/work-item-timeline\"",
  "props": [
    {
      "name": "items / getPresentation / interaction / onSelectionChange",
      "type": "WorkItemsViewProps",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "settings / today / range / queryKey",
      "type": "TimelineSettings / string / ScheduleRangeSnapshot / string",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "onScheduleChange / onDateDraftChange / proposedDates / onReorder",
      "type": "atomic intent / draft callback / retained drafts / independent manual-order intent",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "onLoadRange / onRetryRange",
      "type": "authoritative range callbacks",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    }
  ],
  "notes": [
    "本地示例刷新清除；真实服务仍由调用方接入。"
  ],
  "widePreview": true
},
{
  "slug": "work-item-calendar",
  "docPath": "/docs/work-item-calendar/",
  "registryId": "work-item-calendar",
  "registryDependencies": [
    "theme",
    "button",
    "i18n",
    "work-items-model",
    "calendar",
    "work-items-schedule"
  ],
  "installType": "block",
  "displayCategory": "patterns",
  "availability": "available",
  "name": "WorkItemCalendar",
  "category": "组合模块",
  "description": "仅修改截止日的日历、逐日分页与未排期工作项。",
  "source": "components/blocks/work-item-calendar.tsx",
  "relatedSources": [],
  "example": "components/examples/work-items-schedule-demo.tsx",
  "usage": "import { WorkItemCalendar } from \"@/components/blocks/work-item-calendar\"",
  "props": [
    {
      "name": "items / getPresentation / interaction / onSelectionChange",
      "type": "WorkItemsViewProps",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "settings / onSettingsChange / today / buckets / queryKey",
      "type": "CalendarSettings / controlled callback / string / readonly DateBucketSnapshot[] / string",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "onScheduleChange / onDateDraftChange / proposedDates",
      "type": "atomic due-date intent / draft callback / retained drafts",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    },
    {
      "name": "onLoadDate / onRetryDate / onCreateOnDate",
      "type": "authoritative daily callbacks / preset-only creation callback",
      "description": "调用方持有记录、权限、分页、原子写入与结果对账。"
    }
  ],
  "notes": [
    "本地示例刷新清除；真实服务仍由调用方接入。"
  ],
  "widePreview": true
},

{
    "slug": "toolbar",
    "name": "Toolbar",
    "docPath": "/docs/toolbar/",
    "registryId": "toolbar",
    "registryDependencies": [
      "button",
      "input",
      "utils"
    ],
    "installType": "ui",
    "displayCategory": "primitives",
    "availability": "available",
    "category": "基础组件",
    "description": "单个Tab入口、方向键导航与输入框光标兼容的命令工具栏。",
    "source": "components/ui/toolbar.tsx",
    "example": "components/examples/gap-audit-demo.tsx",
    "usage": "import { Toolbar, ToolbarButton } from \"@/components/ui/toolbar\"\nexport function Commands() { return <Toolbar aria-label=\"Commands\"><ToolbarButton>Save</ToolbarButton></Toolbar> }",
    "props": [
      {
        "name": "orientation / loopFocus",
        "type": "Base UI Toolbar.Root props",
        "description": "使用Base UI键盘模型；禁用命令跳过方向键导航。"
      }
    ],
    "notes": [
      "仅提供受控界面；请求、权限、持久化及业务结果由调用方负责。"
    ],
    "docGroup": "interaction"
  },
{
    "slug": "command-toolbar",
    "name": "CommandToolbar",
    "docPath": "/docs/command-toolbar/",
    "registryId": "command-toolbar",
    "registryDependencies": [
      "toolbar",
      "menu",
      "button",
      "i18n",
      "command-toolbar-model"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "category": "组合模块",
    "description": "按可用宽度与优先级收纳命令，保留菜单可发现性及焦点。",
    "source": "components/blocks/command-toolbar.tsx",
    "example": "components/examples/gap-audit-demo.tsx",
    "usage": "import { CommandToolbar } from \"@/components/blocks/command-toolbar\"\nexport function Commands() { return <CommandToolbar label=\"Commands\" actions={[{id:\"save\",label:\"Save\",onInvoke:()=>{}}]} /> }",
    "props": [
      {
        "name": "actions / leading / leadingWidth",
        "type": "CommandToolbarAction[] / ReactNode / number",
        "description": "稳定ID、标签、宽度、优先级及显式调用回调。"
      }
    ],
    "notes": [
      "仅提供受控界面；请求、权限、持久化及业务结果由调用方负责。"
    ],
    "docGroup": "interaction"
  },
{
    "slug": "data-table-controls",
    "name": "DataTableControls",
    "docPath": "/docs/data-table-controls/",
    "registryId": "data-table-controls",
    "registryDependencies": [
      "button",
      "checkbox",
      "input",
      "popover",
      "i18n",
      "data-table-model"
    ],
    "installType": "block",
    "displayCategory": "patterns",
    "availability": "available",
    "category": "组合模块",
    "description": "受控列显隐、顺序与宽度配置，全部操作有键盘入口。",
    "source": "components/blocks/data-table-controls.tsx",
    "example": "components/examples/gap-audit-demo.tsx",
    "usage": "import { DataTableControls } from \"@/components/blocks/data-table-controls\"\nexport function Columns() { return <DataTableControls columns={[{id:\"title\",label:\"Title\"}]} value={{}} onValueChange={()=>{}} /> }",
    "props": [
      {
        "name": "columns / value / onValueChange",
        "type": "ConfigurableColumn[] / DataTableColumnConfig / callback",
        "description": "配置请求由调用方回传，列身份独立于显示顺序。"
      }
    ],
    "notes": [
      "仅提供受控界面；请求、权限、持久化及业务结果由调用方负责。"
    ],
    "docGroup": "data"
  },
{
    "slug": "data-table-model",
    "name": "DataTableModel",
    "docPath": "/docs/data-table-model/",
    "registryId": "data-table-model",
    "registryDependencies": [],
    "installType": "lib",
    "displayCategory": "patterns",
    "availability": "available",
    "category": "组合模块",
    "description": "列配置与只读查询会话：绑定完整查询身份并丢弃迟到响应。",
    "source": "lib/data-table-model.ts",
    "example": "components/examples/gap-audit-demo.tsx",
    "usage": "import { dataTableQueryKey } from \"@/lib/data-table-model\"\nexport const key = dataTableQueryKey({scope:\"local\",filter:\"\",sort:null,page:1,pageSize:20})",
    "props": [
      {
        "name": "DataTableQuery / createDataTableQuerySession",
        "type": "scope, filter, sort, page, pageSize, cursor / optional adapter",
        "description": "未知总数保持undefined；刷新失败保留同一查询已有行。"
      }
    ],
    "notes": [
      "仅提供受控界面；请求、权限、持久化及业务结果由调用方负责。"
    ],
    "docGroup": "data"
  }
]

// Documentation metadata is derived from this inventory, independently of install type.
function inferDocGroup(entry: ComponentManifestEntry): DocGroup {
  if (entry.displayCategory === "canvas" || /^(canvas|workflow|node-|variable-)/.test(entry.slug)) return "canvas"
  if (/^(agent|session|activity|chat|conversation|tool-call|runtime-status)/.test(entry.slug)) return "agent"
  if (entry.displayCategory === "workspace" || /^(workspace|inspector|style-workbench)/.test(entry.slug)) return "workspace"
  if (/^(work-item|grouped|board|timeline|calendar|schedule|data-|table|tree|filter|metric|rating|avatar|property)/.test(entry.slug)) return "data"
  return entry.displayCategory === "primitives" ? "interaction" : "other"
}
const aliases: Record<string, string[]> = {
  button: ["按钮", "action"], input: ["输入框", "text field"], dialog: ["对话框", "弹窗"],
  "data-table": ["数据表格", "排序", "selection"], "tool-call": ["工具调用", "审批", "approval"],
  "work-items-workspace": ["任务", "工作项", "日历", "时间线"], "workflow-canvas": ["流程画布", "节点", "工作流"],
  "calendar": ["日历", "日期"], "timeline": ["时间线", "排期"], "sheet": ["抽屉"],
}
const docUsage: Record<string, string> = {
  "button": "\"use client\"\nimport { Button } from \"@/components/ui/button\"\nexport function SaveButton() {\n  return <Button onClick={() => console.log(\"save\")}>Save</Button>\n}",
  "data-table": "\"use client\"\nimport { DataTable } from \"@/components/blocks/data-table\"\nconst rows = [{ id: \"task-1\", title: \"Review changes\" }]\nexport function Tasks() {\n  return <DataTable rows={rows} caption=\"Tasks\"\n    getRowId={row => row.id} getRowLabel={row => row.title}\n    columns={[{ id: \"title\", header: \"Title\", cell: row => row.title }]} />\n}",
  "tool-call": "import { ToolCall } from \"@/components/blocks/tool-call\"\nexport function ToolResult() {\n  return <ToolCall call={{ id: \"read-1\", name: \"read_file\",\n    target: \"README.md\", status: \"completed\",\n    arguments: { path: \"README.md\" }, output: \"Local preview\" }} />\n}",
  "work-items-workspace": "\"use client\"\nimport { WorkItemsWorkspace, type WorkItemsWorkspaceProps } from \"@/components/blocks/work-items-workspace\"\n// The caller supplies the complete controlled snapshot and callbacks.\nexport function WorkItemsPage(props: WorkItemsWorkspaceProps) {\n  return <WorkItemsWorkspace {...props} />\n}",
  "workflow-canvas": "\"use client\"\nimport { WorkflowCanvas, type WorkflowCanvasProps } from \"@/components/blocks/workflow-canvas\"\n// The caller supplies the graph, selection and command callbacks.\nexport function Graph(props: WorkflowCanvasProps) {\n  return <div style={{ height: 400 }}><WorkflowCanvas {...props} /></div>\n}"
}
const docVariants: Record<string, DocVariant[]> = {
  "button": [
    {
      "title": {
        "zh-CN": "禁用操作",
        "en": "Disabled action"
      },
      "code": "import { Button } from \"@/components/ui/button\"\nexport function DisabledAction() {\n  return <Button disabled>Save</Button>\n}"
    },
    {
      "title": {
        "zh-CN": "等待调用方结果",
        "en": "Waiting for a caller result"
      },
      "code": "import { Button } from \"@/components/ui/button\"\nexport function PendingAction() {\n  return <Button loading>Save</Button>\n}"
    }
  ],
  "data-table": [
    {
      "title": {
        "zh-CN": "只读行",
        "en": "Read-only rows"
      },
      "code": "\"use client\"\nimport { DataTable } from \"@/components/blocks/data-table\"\nconst rows = [{ id: \"task-1\", title: \"Review changes\" }]\nexport function Tasks() {\n  return <DataTable rows={rows} caption=\"Tasks\"\n    getRowId={row => row.id} getRowLabel={row => row.title}\n    columns={[{ id: \"title\", header: \"Title\", cell: row => row.title }]} />\n}"
    },
    {
      "title": {
        "zh-CN": "受控选择",
        "en": "Controlled selection"
      },
      "code": "\"use client\"\nimport { useState } from \"react\"\nimport { DataTable } from \"@/components/blocks/data-table\"\nconst rows = [{ id: \"task-1\", title: \"Review changes\" }]\nexport function SelectableTasks() {\n  const [selectedIds, setSelectedIds] = useState<string[]>([])\n  return <DataTable rows={rows} caption=\"Tasks\" getRowId={row => row.id}\n    getRowLabel={row => row.title} selectedIds={selectedIds} onSelectionChange={setSelectedIds}\n    columns={[{ id: \"title\", header: \"Title\", cell: row => row.title }]} />\n}"
    }
  ],
  "tool-call": [
    {
      "title": {
        "zh-CN": "已确认结果",
        "en": "Confirmed result"
      },
      "code": "import { ToolCall } from \"@/components/blocks/tool-call\"\nexport function ToolResult() {\n  return <ToolCall call={{ id: \"read-1\", name: \"read_file\",\n    target: \"README.md\", status: \"completed\",\n    arguments: { path: \"README.md\" }, output: \"Local preview\" }} />\n}"
    },
    {
      "title": {
        "zh-CN": "未知结果先对账",
        "en": "Reconcile an unknown result"
      },
      "code": "import { ToolCall } from \"@/components/blocks/tool-call\"\nexport function UnknownResult({ queryReceipt }: { queryReceipt: () => Promise<void> }) {\n  return <ToolCall onReconcile={queryReceipt} call={{ id: \"write-1\", name: \"write_file\",\n    target: \"output.txt\", status: \"waiting\", outcome: \"unknown\" }} />\n}"
    }
  ],
  "work-items-workspace": [
    {
      "title": {
        "zh-CN": "列表布局",
        "en": "List layout"
      },
      "code": "\"use client\"\nimport { WorkItemsWorkspace, type WorkItemsWorkspaceProps } from \"@/components/blocks/work-items-workspace\"\nexport function TaskList(props: WorkItemsWorkspaceProps) {\n  return <WorkItemsWorkspace {...props} view={{ ...props.view, layout: \"list\" }} />\n}"
    },
    {
      "title": {
        "zh-CN": "看板布局",
        "en": "Board layout"
      },
      "code": "\"use client\"\nimport { WorkItemsWorkspace, type WorkItemsWorkspaceProps } from \"@/components/blocks/work-items-workspace\"\nexport function TaskBoard(props: WorkItemsWorkspaceProps) {\n  return <WorkItemsWorkspace {...props} view={{ ...props.view, layout: \"board\" }} />\n}"
    }
  ],
  "workflow-canvas": [
    {
      "title": {
        "zh-CN": "只读图",
        "en": "Read-only graph"
      },
      "code": "\"use client\"\nimport { WorkflowCanvas, type WorkflowCanvasProps } from \"@/components/blocks/workflow-canvas\"\nexport function ReadOnlyGraph(props: WorkflowCanvasProps) {\n  return <div style={{ height: 400 }}><WorkflowCanvas {...props} readOnly /></div>\n}"
    },
    {
      "title": {
        "zh-CN": "调用方控制编辑",
        "en": "Caller-controlled editing"
      },
      "code": "\"use client\"\nimport { WorkflowCanvas, type WorkflowCanvasProps } from \"@/components/blocks/workflow-canvas\"\n// The caller supplies the graph, selection and command callbacks.\nexport function Graph(props: WorkflowCanvasProps) {\n  return <div style={{ height: 400 }}><WorkflowCanvas {...props} /></div>\n}"
    }
  ]
}
const readingOrder = ["button", "input", "label", "textarea", "native-select", "select", "combobox", "checkbox", "radio-group", "switch", "dialog", "sheet", "popover", "menu", "dropdown-menu", "tabs", "data-region", "data-table", "table", "tree", "work-items-workspace", "work-items-toolbar", "work-item-properties", "work-item-row", "work-item-card", "runtime-status-badge", "agent-row", "session-row", "chat-message", "conversation", "chat-composer", "tool-call", "activity-timeline", "workflow-canvas", "canvas-workspace", "node-palette", "node-inspector", "variable-picker", "workspace-shell", "inspector"]
export const componentManifest: ComponentManifestEntry[] = sourceManifest.map((entry, index) => ({
  ...entry, docGroup: entry.docGroup ?? inferDocGroup(entry), docOrder: entry.docOrder ?? (readingOrder.includes(entry.slug) ? readingOrder.indexOf(entry.slug) : 100 + index),
  aliases: entry.aliases ?? aliases[entry.slug] ?? [],
  related: entry.related ?? ({button:["input","dialog","field"],"data-table":["data-region","checkbox","table"],"tool-call":["runtime-status-badge","chat-message","activity-timeline"],"work-items-workspace":["work-item-list","work-item-board","work-item-calendar"],"workflow-canvas":["canvas-workspace","node-palette","node-inspector"]} as Record<string,string[]>)[entry.slug],
  usage: docUsage[entry.slug] ?? entry.usage, variants: docVariants[entry.slug] ?? entry.variants,
}))
