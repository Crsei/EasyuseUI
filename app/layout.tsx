import Link from "next/link"
import docs from "@/lib/docs-index.json"
import guides from "@/lib/guide-navigation.json"
import { SiteI18nProvider } from "@/components/site/site-i18n-provider"
import { SiteText } from "@/components/site/site-i18n"
import type { Metadata } from "next"
import { siteUrl } from "@/lib/site"
import { SiteFooter } from "@/components/site/site-footer"
import { Header } from "@/components/site/header"
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
        <SiteI18nProvider
          componentPages={Object.fromEntries(
            docs.map((entry) => [
              entry.docPath.replace(/\/$/, ""),
              { title: entry.name, description: entry.description["zh-CN"] },
            ]),
          )}
          guides={guides.map(({ slug, title, summary }) => ({
            slug,
            title,
            summary,
          }))}
        >
          <Link
            prefetch={false}
            href="#main-content"
            className="sr-only z-50 rounded-md bg-background p-3 focus:fixed focus:top-2 focus:left-2 focus:not-sr-only"
          >
            <SiteText messageKey="site.skipToMainContent" />
          </Link>
          <ThemeProvider>
            <SiteFrame header={<Header />} footer={<SiteFooter />}>
              {children}
            </SiteFrame>
          </ThemeProvider>
        </SiteI18nProvider>
      </body>
    </html>
  )
}
