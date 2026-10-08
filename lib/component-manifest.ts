type Prop = {
  name: string
  type: string
  default?: string
  description: string
}
export type ComponentManifestEntry = {
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

export const componentManifest: ComponentManifestEntry[] = [
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
    registryDependencies: [
      "theme",
      "button",
      "checkbox",
      "table",
      "data-region",
      "i18n",
    ],
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
        name: "rows / columns / getRowId / getRowLabel / selectedIds / onSelectionChange / activeRowId / onActivateRow / sort / onSortChange / data / footer",
        type: "DataTableProps<T>",
        description:
          "全选只修改当前可选行并保留隐藏选择；调用方提供排序后的数据与汇总。",
      },
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
    registryDependencies: [
      "theme",
      "utils",
      "theme-boundary",
      "button",
      "i18n",
    ],
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
        name: "groups / query / onQueryChange / onSelect / open / shortcut / finalFocus / loading / error",
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
    registryDependencies: ["theme", "utils", "theme-boundary"],
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
    registryDependencies: ["theme", "utils", "theme-boundary"],
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
    registryDependencies: ["theme", "utils", "theme-boundary"],
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
    registryDependencies: ["theme", "utils", "theme-boundary"],
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
    registryDependencies: [
      "canvas-model",
      "canvas-controls",
      "canvas-editor",
      "canvas-validation",
      "workspace-shell",
      "workflow-canvas",
      "node-palette",
      "node-inspector",
      "inspector",
      "input",
      "button",
      "dialog",
      "data-region",
      "canvas-execution-panel",
      "canvas-services",
      "canvas-service-panel",
      "i18n",
      "menu",
      "tabs",
    ],
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
    registryDependencies: ["theme-boundary", "theme", "utils"],
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
    registryDependencies: ["theme-boundary", "theme", "utils", "i18n"],
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
    registryDependencies: [
      "theme-boundary",
      "theme",
      "utils",
      "button",
      "i18n",
    ],
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
    registryDependencies: ["button", "theme", "i18n", "runtime-status"],
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
    registryDependencies: [
      "theme",
      "metric-summary",
      "runtime-status-badge",
      "data-table",
      "agent-board-model",
      "i18n",
    ],
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
      "button"
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
      "button"
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
      "button"
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
    "registryDependencies": [
      "theme",
      "button",
      "input",
      "field",
      "work-item",
      "work-item-properties",
      "work-items-model",
      "work-items-styles",
      "i18n"
    ],
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
    "registryDependencies": [
      "theme",
      "workspace-shell",
      "work-items-toolbar",
      "work-items-views",
      "work-item-detail",
      "data-region",
      "button",
      "checkbox",
      "work-items-model",
      "grouped-items-model",
      "work-items-styles",
      "i18n"
    ],
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
]
