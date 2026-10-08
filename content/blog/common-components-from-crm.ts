import type { BlogPost } from "../../lib/blog-model"
export const commonComponentsFromCrm: BlogPost = {
  slug: "common-components-from-crm",
  title: {
    "zh-CN": "从 CRM 页面提炼通用组件",
    en: "Extracting reusable components from a CRM page",
  },
  summary: {
    "zh-CN":
      "以九列表格为切口，把选择、查看、筛选、表单和浮层拆成可独立安装的通用能力。",
    en: "Use a nine-column table to separate selection, activation, filtering, forms and overlays into independently installable capabilities.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: true,
  visibility: "published",
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["Table", "Forms", "Registry"],
  optimizationIds: ["G0", "G1", "G2", "G3", "G4", "G5"],
  relatedComponents: [
    "data-table",
    "checkbox",
    "sheet",
    "command-palette",
    "image-upload",
    "filter-toolbar",
    "workspace-shell",
  ],
  relatedPosts: ["on-demand-demos"],
  baselineVersion: null,
  resultVersion: null,
  sourceSnapshotId:
    "c1f3ebf2e5d0f26134dfea02bdeeebaa8d54aaae21f4d9f06dede907e95e165b",
  body: [
    {
      type: "heading",
      id: "boundaries",
      text: {
        "zh-CN": "先固定责任与状态",
        en: "Fix ownership and states first",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "表格不导入 Companies 类型、CRM store 或站点路由。调用方负责读取、筛选、排序、统计与保存，组件只展示数据并提出操作请求。勾选、当前查看对象与焦点分别建模，刷新失败保留旧数据。",
        en: "The table imports no Companies types, CRM store or site routes. Callers own reads, filtering, sorting, summaries and saving. Components display data and request changes. Row selection, activation and focus are separate, and refresh failures keep old content.",
      },
    },
    {
      type: "code",
      language: "tsx",
      code: '<DataTable rows={rows} columns={columns} caption="Workers"\n  getRowId={row => row.id} getRowLabel={row => row.name}\n  selectedIds={selectedIds} onSelectionChange={setSelectedIds}\n  activeRowId={activeId} onActivateRow={row => setActiveId(row.id)}\n  sort={sort} onSortChange={setSort} data={data} footer={summary} />',
    },
    {
      type: "heading",
      id: "selection",
      text: {
        "zh-CN": "全选的边界是当前可选行",
        en: "Select-all covers visible selectable rows",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "全选只增删当前传入且未禁用的行ID，保留过滤后隐藏的选择。名称按钮打开对象，负责人链接和尾部动作是独立目标。原生 table 结构保留辅助技术读取，不添加缺少单元格导航的 grid 角色。",
        en: "Select-all only adds or removes IDs of supplied selectable rows, preserving hidden selections. Name buttons open objects; owner links and trailing actions remain independent. Native tables retain assistive-technology reading without an incomplete grid role.",
      },
    },
    {
      type: "demo",
      componentSlug: "data-table",
    },
    {
      type: "heading",
      id: "inputs",
      text: {
        "zh-CN": "复用浮层与完整输入",
        en: "Reuse overlays and complete inputs",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "DropdownMenu复用已有Menu；Sheet复用Base UI Dialog并继承ThemeBoundary。Field把id和描述/错误关联交给现有Input。Slider分开连续变化与提交；ImageUpload只交付本地File，读取失败保留旧图片，不把预览当作上传完成。",
        en: "DropdownMenu builds on Menu. Sheet uses Base UI Dialog and inherits ThemeBoundary. Field passes IDs and description/error associations to Input. Slider separates changes from commits. ImageUpload only provides a local File; failed reads preserve the old image, and previews never imply upload completion.",
      },
    },
    {
      type: "demo",
      componentSlug: "image-upload",
    },
    {
      type: "heading",
      id: "distribution",
      text: {
        "zh-CN": "按真实源码分发与验证",
        en: "Distribute and verify actual source",
      },
    },
    {
      type: "code",
      language: "bash",
      code: "pnpm check:manifest\npnpm check:i18n\npnpm lint\npnpm typecheck\npnpm build\npnpm test\npnpm test:install",
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "每个公开项登记Manifest、Registry、按需示例与国际化资源。独立消费项目经CLI安装并构建，不复用文档站源码。具体接口见 /docs/data-table/、/docs/sheet/、/docs/command-palette/ 和 /docs/image-upload/；实现与验收记录位于 plans/common-components-completion-log.md，业务页面边界见 plans/sales-crm-replication-plan.md。",
        en: "Each public item registers its Manifest, Registry, lazy demo and translations. An independent consumer installs through the CLI and builds without reusing documentation-site source. APIs are documented at /docs/data-table/, /docs/sheet/, /docs/command-palette/ and /docs/image-upload/. Implementation evidence lives in plans/common-components-completion-log.md; business-page scope is defined in plans/sales-crm-replication-plan.md.",
      },
    },
    {
      type: "heading",
      id: "verification",
      text: {
        "zh-CN": "功能与分发验证结果",
        en: "Functional and distribution results",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "冻结实现的完整浏览器回归183项通过，其中包含15项新增交互检查和17项逐组件依赖闭包检查。独立消费项目经CLI安装、类型检查、生产构建及浏览器操作通过。工程检查、59个目录组件与72项Registry清单校验通过。验证报告区分冻结实现、独立组合安装与共享主机性能记录；不是17个单独构建的消费应用。",
        en: "The frozen implementation passed 183 browser checks, including 15 new interaction cases and 17 individual dependency-closure checks. A separate consumer passed CLI installation, type checking, production build and browser operations. Engineering checks and metadata validation passed for 59 catalog components and 72 Registry items. The report separates the frozen implementation, combined independent installation and shared-host performance observations; it does not claim 17 separately built consumer applications.",
      },
    },
  ],
  evidence: [
    {
      id: "common-components-verification",
      type: "test",
      file: "/blog/common-components-from-crm/2026-10-08/verification.json",
      capturedAt: "2026-10-08T09:11:23.215760+00:00",
      sourceSnapshotId:
        "c1f3ebf2e5d0f26134dfea02bdeeebaa8d54aaae21f4d9f06dede907e95e165b",
      command:
        "pnpm lint; pnpm typecheck; pnpm build; pnpm check:i18n; pnpm check:manifest; pnpm test; pnpm test:install",
      environment:
        "Node 24.21.0 / Next 16.3.8 / Base UI 1.8.0 / Linux GLIBC 2.28 / Webpack + WASM / Chrome / shared host",
      method:
        "Frozen source on isolated port 33817. 183 full-suite checks, 17 individual static Registry closures and one independently installed production consumer. Source ID hashes 73 explicitly listed implementation, example, theme, metadata and test files, excluding this article/report to avoid recursion; it is not a whole Git tree hash.",
      sampleCount: 183,
      scope: {
        "zh-CN":
          "通用组件与现有工作台的本地功能回归、独立组合安装；不证明真实服务、CRM页面或人工读屏验收。",
        en: "Local common-component and workspace regression plus independent combined installation; not real-service, CRM-page or manual screen-reader acceptance.",
      },
    },
  ],
  limitations: [
    {
      "zh-CN": "本篇不声称已经复刻CRM页面或连接真实上传、查询、保存服务。",
      en: "This article does not claim the CRM page has been replicated or real upload, query and save services connected.",
    },
    {
      "zh-CN":
        "组件功能验证不等于性能改善对比；本篇不提供虚构的优化前后指标，也不标为性能verified。",
      en: "Functional verification is not a performance comparison. This article supplies no invented before/after metrics and is not marked performance verified.",
    },
    {
      "zh-CN":
        "既有Canvas测量中，200节点冷启动为2815ms，超过2000ms预算；Inspector p95为72.3ms，拖拽49fps。这些共享主机样本如实保留，不声称全部性能预算已达标。",
      en: "Existing Canvas measurements recorded 2815ms cold startup for 200 nodes, exceeding the 2000ms budget, with 72.3ms Inspector p95 and 49 drag fps. Shared-host samples are retained without claiming every performance budget passed.",
    },
  ],
}
