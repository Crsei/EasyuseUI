import type { BlogPost } from "../../lib/blog-model"
export const controlledLayout: BlogPost = {
  slug: "controlled-layout",
  title: {
    "zh-CN": "布局状态交给调用方管理",
    en: "Putting workspace layout state under caller control",
  },
  summary: {
    "zh-CN": "成对受控接口、独立移动端浮层与按工作区保存的示例适配器。",
    en: "Putting workspace layout state under caller control",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["reuse", "OPT-05", "OPT-07"],
  optimizationIds: ["OPT-05", "OPT-07"],
  relatedComponents: [
    "workspace-shell",
    "menu",
    "tabs",
    "segmented",
    "select",
    "combobox",
    "popover",
  ],
  relatedPosts: ["optimization-roadmap"],
  baselineVersion: null,
  resultVersion:
    "worktree:39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
  sourceSnapshotId:
    "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
  body: [
    {
      type: "heading",
      id: "interfaces",
      text: {
        "zh-CN": "接口和职责",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "WorkspaceShell 为侧栏折叠、Inspector 展开/宽度、底部展开/高度提供 value/default/onChange 成对接口，保留非受控默认。桌面停靠与窄屏 overlay 分开；测量和切换语言不回写偏好。组件不拥有 localStorage。",
      },
    },
    {
      type: "code",
      language: "tsx",
      code: "<WorkspaceShell\n  inspectorOpen={layout.inspectorOpen}\n  onInspectorOpenChange={(inspectorOpen) => saveLayout({ ...layout, inspectorOpen })}\n  inspectorWidth={layout.inspectorWidth}\n  onInspectorWidthChange={(inspectorWidth) => saveLayout({ ...layout, inspectorWidth })}\n/>",
    },
    {
      type: "heading",
      id: "example",
      text: {
        "zh-CN": "恢复与模式复用",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "/workspace/layout/ 演示按 alpha/beta 工作区保存、损坏存储恢复、越界尺寸限制，以及只在用户操作后写入。六种基础组件区分动作、补充信息、内容面板和选值；Canvas 的更多工具与底部面板已实际复用 Menu/Tabs。",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "Canvas 复制、粘贴、全选、删除、撤销只在编辑上下文触发，选中文本、Inspector、日志、输入和弹层保留原快捷键。语言切换保留选中对象、配置草稿和撤销历史。",
      },
    },
    {
      type: "demo",
      componentSlug: "workspace-shell",
    },
  ],
  evidence: [
    {
      id: "layout-regression",
      type: "test",
      file: "/blog/canvas-indexes/2026-10-08/verification.json",
      capturedAt: "2026-10-08T08:08:08.392Z",
      sourceSnapshotId:
        "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
      command:
        "pnpm exec playwright test --grep-invert @performance --workers=2",
      environment:
        '{"browser":"138.0.7204.92","viewport":{"width":1440,"height":1000},"node":"v24.21.0","sharedHost":true}',
      method: "See raw report for exact checks and boundaries",
      sampleCount: 3,
      scope: {
        "zh-CN": "受控/非受控布局、工作区偏好恢复、响应式与本地键盘交互回归。",
      },
    },
  ],
  limitations: [
    {
      "zh-CN": "持久化、权限和运行服务由调用方提供。示例仅证明本地布局偏好。",
    },
    {
      "zh-CN":
        "最终共享工作区含另一批并行组件，完整集成回归与本轮隔离验证分别记录。",
    },
  ],
}
