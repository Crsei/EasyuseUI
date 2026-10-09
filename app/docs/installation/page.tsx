import { GuideDoc } from "@/components/docs/guide-doc"
import { docGuides } from "@/lib/doc-guides"
export const metadata = {
  title: "安装与主题",
  description: "在已有 React 项目安装、使用和验证 EasyuseUI 源码组件。",
  alternates: { canonical: "/docs/installation/" },
}
export default function InstallationPage() {
  return (
    <GuideDoc
      guide={docGuides.find((guide) => guide.slug === "installation")!}
    />
  )
}
