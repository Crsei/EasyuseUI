import { VisualDictionary } from "@/components/docs/visual-dictionary"

export const metadata = {
  title: "UI 视觉词典",
  description:
    "通过中文外观、英文名和别名查找 UI 组件、基础样式与视觉效果，比较外观并查看项目用法。",
}

export default function DictionaryPage() {
  return <VisualDictionary />
}
