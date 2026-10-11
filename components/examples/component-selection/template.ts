import type {
  SelectionTemplate,
  SelectionText,
} from "@/lib/component-selection-model"

const text = (zh: string, en: string): SelectionText => ({ "zh-CN": zh, en })
const source = {
  origin: "EasyuseUI repository source",
  version: "source@4d66f39",
  license: "Repository license unspecified; retain dependency MIT/ISC notices",
}
/** Copy this data declaration and provide a real preview for every added candidate. */
export const componentSelectionTemplate: SelectionTemplate = {
  id: "new-project-starter",
  revision: "1",
  groups: [
    {
      id: "navigation",
      title: text("01 · 模块导航", "01 · Module navigation"),
      purpose: text(
        "选择项目各模块的组织方式。先比较层级导航与平级内容切换，再按信息结构决定。",
        "Choose how project modules are organized. Compare hierarchical navigation with switching between peer sections.",
      ),
      candidates: [
        {
          ...source,
          id: "tree",
          name: "Tree",
          registryId: "tree",
          source: "packages/ui/components/ui/tree.tsx",
          description: text(
            "可展开的层级导航，支持单选和键盘访问。",
            "Expandable hierarchy with controlled selection and keyboard navigation.",
          ),
          suitableFor: text(
            "项目 → 模块 → 资源等父子关系。",
            "Parent-child relationships such as project → module → resources.",
          ),
          limitation: text(
            "需要真实层级；移动与持久化由调用方提供。",
            "Requires a meaningful hierarchy; moving and persistence are caller responsibilities.",
          ),
        },
        {
          ...source,
          id: "tabs",
          name: "Tabs",
          registryId: "tabs",
          source: "packages/ui/components/ui/tabs.tsx",
          description: text(
            "平级模块的内容面板切换，采用 Base UI 键盘模型。",
            "Switch between peer content panels using Base UI keyboard behavior.",
          ),
          suitableFor: text(
            "少量平级视图，例如概览、任务、资源。",
            "A small number of peer views, such as overview, tasks and resources.",
          ),
          limitation: text(
            "不表达多级关系；URL、历史和草稿保留由适配器负责。",
            "Does not express hierarchy; adapters own URLs, history and draft retention.",
          ),
        },
      ],
    },
    {
      id: "collection",
      title: text("02 · 记录集合", "02 · Record collection"),
      purpose: text(
        "同一组数据选择列表或表格，比较阅读密度、字段数量与批量操作需求。",
        "Choose a list or table for the same records, considering reading density, field count and batch actions.",
      ),
      candidates: [
        {
          ...source,
          id: "item",
          name: "Item",
          registryId: "item",
          source: "packages/ui/components/ui/item.tsx",
          description: text(
            "紧凑的单行或双行记录，可组合状态和尾部操作。",
            "Compact one-line or two-line records with optional status and trailing actions.",
          ),
          suitableFor: text(
            "标题优先、少量元数据、导航列表。",
            "Title-first records, light metadata and navigation lists.",
          ),
          limitation: text(
            "多字段横向比较、排序和批量选择需组合其他组件。",
            "Comparing many fields, sorting and batch selection require additional composition.",
          ),
        },
        {
          ...source,
          id: "data-table",
          name: "DataTable",
          registryId: "data-table",
          source: "packages/ui/components/blocks/data-table.tsx",
          description: text(
            "带列头的原生表格，选择、激活与排序请求分别受控。",
            "Native table with separately controlled selection, activation and sort requests.",
          ),
          suitableFor: text(
            "多字段比较、批量选择、结构化业务记录。",
            "Multi-field comparisons, batch selection and structured business records.",
          ),
          limitation: text(
            "调用方提供数据与排序；不附带后端查询或虚拟分页。",
            "Callers provide records and sorting; no built-in backend querying or virtual pagination.",
          ),
        },
      ],
    },
    {
      id: "details",
      title: text("03 · 对象详情", "03 · Object details"),
      purpose: text(
        "比较查看选中对象的属性与展示独立内容的方式，明确主区和详情的关系。",
        "Compare inspecting a selected object's properties with presenting standalone content.",
      ),
      candidates: [
        {
          ...source,
          id: "inspector",
          name: "Inspector",
          registryId: "inspector",
          source: "packages/ui/components/blocks/inspector.tsx",
          description: text(
            "围绕当前对象展示属性，完整受控快照与数据状态。",
            "Inspect the current object using a controlled snapshot and explicit data states.",
          ),
          suitableFor: text(
            "主从工作台、选中记录后的属性面板。",
            "Master-detail workspaces and properties for the selected record.",
          ),
          limitation: text(
            "停靠、收起和尺寸由 WorkspaceShell 管理。",
            "WorkspaceShell manages docking, collapsing and panel sizing.",
          ),
        },
        {
          ...source,
          id: "card",
          name: "Card",
          registryId: "card",
          source: "packages/ui/components/ui/card.tsx",
          description: text(
            "用于独立内容的容器，组合标题与正文。",
            "Container for standalone content with a composed title and body.",
          ),
          suitableFor: text(
            "独立对象摘要或说明模块。",
            "Standalone object summaries or explanatory modules.",
          ),
          limitation: text(
            "不自带属性/选择逻辑；Session、活动和日志应使用列表或表格。",
            "No built-in property or selection behavior; sessions, activity and logs use lists or tables.",
          ),
        },
      ],
    },
  ],
}
