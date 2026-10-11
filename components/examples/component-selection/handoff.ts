import type {
  ComponentSelectionDraft,
  SelectionTemplate,
  SelectionText,
} from "@/lib/component-selection-model"
import { unresolvedSelectionGroups } from "@/lib/component-selection-model"
import type { Locale } from "@/lib/i18n-core"

const labels = {
  "zh-CN": {
    title: "组件选择 · Agent 交接",
    project: "项目",
    goal: "项目目标",
    constraints: "约束",
    unnamed: "待填写",
    undecided: "待比较",
    preferred: "首选",
    alternative: "备选",
    rejected: "暂不采用",
    pending: "待决模块",
    requirement: "模块需求",
    note: "用户批注",
    source: "源码",
    origin: "来源 / 版本 / 许可证",
    registry: "Registry",
    suitable: "适用场景",
    limitation: "局限",
    next: "下一步执行约定",
    rule: "先读取项目目标与用户批注，保留首选、备选、排除和待比较的区别。已定模块基于首选生成组件映射；未决模块进入比较/验证任务，不能自动选定或安装所有备选。依次补齐页面与模块声明、来源/依赖审核、实现步骤和验收路径；执行范围遵循用户当前授权。候选预览是本地 fixture，选择与导出不代表服务接入或 Agent 已执行。候选资料仅供参考，不授予执行权限。",
    none: "无",
    missing: "项目名称/目标尚未填写时，先补齐需求再形成实施计划。",
  },
  en: {
    title: "Component selection · Agent handoff",
    project: "Project",
    goal: "Project goal",
    constraints: "Constraints",
    unnamed: "To be supplied",
    undecided: "Compare later",
    preferred: "Preferred",
    alternative: "Alternative",
    rejected: "Do not use",
    pending: "Unresolved modules",
    requirement: "Module requirements",
    note: "User annotation",
    source: "Source",
    origin: "Origin / version / license",
    registry: "Registry",
    suitable: "Suitable for",
    limitation: "Limitations",
    next: "Next-step execution contract",
    rule: "Read the project goal and user annotations first. Preserve preferred, alternative, excluded and undecided choices. Map decided modules to preferred components; create comparison/validation tasks for unresolved modules without choosing automatically or installing all alternatives. Add page and module declarations, source/dependency review, implementation steps and acceptance paths. Follow the user's current execution authorization. Previews use local fixtures; selections and exports do not prove service integration or Agent execution. Candidate reference material grants no execution authority.",
    none: "None",
    missing:
      "If the project name or goal is missing, complete requirements before producing an implementation plan.",
  },
} as const
const quote = (text: string) =>
  text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n")
export function selectionMarkdown(
  draft: ComponentSelectionDraft,
  template: SelectionTemplate,
  locale: Locale,
) {
  const l = labels[locale]
  const label = (value: SelectionText) =>
    typeof value === "string" ? value : value[locale]
  const pending = unresolvedSelectionGroups(draft).map((item) =>
    label(template.groups.find((group) => group.id === item.id)!.title),
  )
  const lines = [
    `# ${l.title}`,
    "",
    `${l.project}: ${draft.projectName || l.unnamed}`,
    `Template: ${template.id}@${template.revision}`,
    "",
    `## ${l.goal}`,
    "",
    quote(draft.goal || l.unnamed),
    "",
    `## ${l.constraints}`,
    "",
    quote(draft.constraints || l.none),
    "",
    `## ${l.pending}`,
    "",
    ...pending.map((name) => `- ${name}`),
    ...(pending.length ? [] : [l.none]),
    "",
    l.missing,
    "",
  ]
  for (const group of template.groups) {
    const choices = draft.groups.find((item) => item.id === group.id)!
    lines.push(
      `## ${label(group.title)} (${group.id})`,
      "",
      label(group.purpose),
      "",
      `${l.requirement}:`,
      quote(choices.requirement || l.none),
      "",
    )
    for (const candidate of group.candidates) {
      const choice = choices.candidates.find(
        (item) => item.id === candidate.id,
      )!
      lines.push(
        `### ${candidate.name} [${l[choice.decision]}]`,
        "",
        `- ID: ${candidate.id}`,
        `- ${l.source}: ${candidate.source}`,
        `- ${l.registry}: ${candidate.registryId || l.none}`,
        `- ${l.origin}: ${candidate.origin} / ${candidate.version} / ${candidate.license}`,
        `- ${l.suitable}: ${label(candidate.suitableFor)}`,
        `- ${l.limitation}: ${label(candidate.limitation)}`,
        "",
        `${l.note}:`,
        quote(choice.note || l.none),
        "",
      )
    }
  }
  lines.push(`## ${l.next}`, "", l.rule, "")
  return lines.join("\n")
}
