"use client"

import {
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import { I18nProvider } from "@/lib/i18n-provider"
import {
  defaultLocale,
  isLocale,
  type Locale,
  createTranslator,
} from "@/lib/i18n-core"
import { pageDescriptionKeys } from "@/lib/site-i18n-metadata"
import type { DocGuide } from "@/lib/doc-guides"
import blogIndex from "@/lib/blog-index.json"
import { siteMessages } from "@/lib/site-i18n-runtime"

export const localeStorageKey = "easyuseui-locale"
const localeEvent = "easyuseui:locale"
function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(localeStorageKey)
    return isLocale(stored) ? stored : defaultLocale
  } catch {
    return defaultLocale
  }
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === localeStorageKey || event.key === null) {
      memoryLocale = undefined
      listener()
    }
  }
  window.addEventListener("storage", storage)
  window.addEventListener(localeEvent, listener)
  return () => {
    window.removeEventListener("storage", storage)
    window.removeEventListener(localeEvent, listener)
  }
}
// The in-memory value also works when browser storage is unavailable.
let memoryLocale: Locale | undefined
function getSnapshot() {
  return memoryLocale ?? readLocale()
}
function subscribeLocale(listener: () => void) {
  return subscribe(listener)
}
const pageTitles: Record<string, string> = {
  "/examples": "组件示例",
  "/examples/work-items": "Work Items 组件示例",
  "/workspace/work-items": "Work Items 组件示例",
  "/components": "组件目录",
  "/blog": "优化日志",
  "/dictionary": "视觉词典",
  "/docs": "介绍",
  "/docs/installation": "安装与主题",
  "/scroll": "滚动实验室",
  "/style-workbench": "样式工作台",
  "/workspace": "工作台",
  "/workspace/canvas": "流程画布",
  "/workspace/canvas/project": "嵌套流程",
  "/workspace/canvas/services": "服务接口",
  "/workspace/canvas/stress": "压力图",
}
const sourceKeys = new Map<string, keyof (typeof siteMessages)["zh-CN"]>(
  Object.entries(siteMessages["zh-CN"]).map(([key, source]) => [
    source,
    key as keyof (typeof siteMessages)["zh-CN"],
  ]),
)
export function SiteI18nProvider({ children, componentPages, guides }: {
  children: ReactNode
  componentPages: Record<string, { title: string; description: string }>
  guides: Pick<DocGuide, "slug" | "title" | "summary">[]
}) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getSnapshot,
    () => defaultLocale,
  )
  const pathname = usePathname().replace(/\/$/, "") || "/"
  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return
    memoryLocale = next
    try {
      localStorage.setItem(localeStorageKey, next)
    } catch {
      /* Memory preference remains usable. */
    }
    window.dispatchEvent(new Event(localeEvent))
    // Storage denial must not replace the in-memory preference.
    memoryLocale = next
  }, [])
  useEffect(() => {
    document.documentElement.lang = locale
    const t = createTranslator(locale, siteMessages)
    const translated = (source: string) => {
      const key = sourceKeys.get(source)
      return key ? t(key) : source
    }
    const guide = guides.find(guide => pathname === `/docs/${guide.slug}`)
    const blog = blogIndex.find((post) => pathname === `/blog/${post.slug}`)
    const blogTitle = blog
      ? (blog.title[locale] ?? blog.title["zh-CN"])
      : undefined
    const component = componentPages[pathname]
    const title =
      guide?.title[locale] ??
      blogTitle ??
      pageTitles[pathname] ??
      component?.title ??
      (pathname.startsWith("/docs/") ? pathname.split("/").at(-1) : undefined)
    const localizedTitle = title
      ? `${translated(title)} · EasyuseUI`
      : locale === "en"
        ? "EasyuseUI — Make usability the default"
        : "EasyuseUI — 让好用，成为默认"
    const descriptionKey =
      pageDescriptionKeys[pathname as keyof typeof pageDescriptionKeys] ??
      pageDescriptionKeys["/"]
    const localizedDescription = (component ? translated(component.description) : undefined) ?? guide?.summary[locale] ?? (
      blog
        ? (blog.summary[locale] ?? blog.summary["zh-CN"])
        : pathname === "/blog"
          ? t("site.optimization.blogIntro")
          : t(descriptionKey)
    )
    const syncMetadata = () => {
      if (document.title !== localizedTitle) document.title = localizedTitle
      const description = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      )
      if (description && description.content !== localizedDescription)
        description.content = localizedDescription
    }
    // Route metadata may arrive after the locale effect during client navigation.
    const observer = new MutationObserver(syncMetadata)
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content"],
    })
    syncMetadata()
    return () => observer.disconnect()
  }, [locale, pathname, componentPages, guides])
  return (
    <I18nProvider locale={locale} onLocaleChange={setLocale}>
      {children}
    </I18nProvider>
  )
}
