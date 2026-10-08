import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/site/header"
import { SiteFrame } from "@/components/site/site-frame"
import { ThemeProvider } from "@/components/site/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
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
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-background p-3 focus:fixed focus:top-2 focus:left-2 focus:not-sr-only"
        >
          跳转到主要内容
        </a>
        <ThemeProvider>
          <SiteFrame
            header={<Header />}
            footer={
              <footer className="border-t">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-7 text-xs text-muted-foreground sm:px-8">
                  <p>EasyuseUI · 从好用的组件开始。</p>
                  <div className="flex flex-wrap gap-5">
                    <Link href="/docs">文档</Link>
                    <Link href="/components">组件目录</Link>
                    <Link href="/dictionary">视觉词典</Link>
                    <Link href="/style-workbench">样式工作台</Link>
                    <Link href="/docs/installation">安装指南</Link>
                  </div>
                </div>
              </footer>
            }
          >
            {children}
          </SiteFrame>
        </ThemeProvider>
      </body>
    </html>
  )
}
