import { SiteI18nProvider } from "@/components/site/site-i18n-provider"
import { SiteSkipLink } from "@/components/site/site-skip-link"
import type { Metadata } from "next"
import { siteUrl } from "@/lib/site"
import { SiteFrame } from "@/components/site/site-frame"
import { ThemeProvider } from "@/components/site/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: {
    images: [
      {
        url: "/site/scenes/agent-desktop-light.jpg",
        width: 1440,
        height: 900,
        alt: "EasyuseUI Agent workspace — local example",
      },
    ],
  },
  title: {
    default: "EasyuseUI — 让好用，成为默认",
    template: "%s · EasyuseUI",
  },
  description:
    "可组合、可修改的 React 组件。从基础交互到完整模块，把源码带进你自己的项目。",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <SiteI18nProvider>
          <SiteSkipLink />
          <ThemeProvider>
            <SiteFrame>{children}</SiteFrame>
          </ThemeProvider>
        </SiteI18nProvider>
      </body>
    </html>
  )
}
