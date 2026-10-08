import { SiteText } from "@/components/site/site-i18n"
import { StyleWorkbench } from "@/components/blocks/style-workbench"

export const metadata = {
  title: "样式工作台",
  description:
    "并排比较基础样式，实时调整圆角、间距、边框、阴影、颜色和字体，查看参数差异并复制 CSS。",
}

export default function StyleWorkbenchPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8"
    >
      <header className="mb-6">
        <p className="mb-2 text-xs tracking-wider text-primary">
          STYLE WORKBENCH
        </p>
        <h1 className="text-xl leading-7 font-semibold">
          <SiteText messageKey="site.styleWorkbench" />
        </h1>
        <p className="mt-2 text-[13px] leading-5 text-text-secondary">
          <SiteText messageKey="site.identicalContentTwoStylesAdjustBAndCompareIt" />
        </p>
      </header>
      <StyleWorkbench />
    </main>
  )
}
