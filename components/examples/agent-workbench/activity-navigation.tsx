"use client"
import Link from "next/link"
import {
  MessageSquare,
  Files,
  Search,
  GitCompare,
  Package,
  ListTodo,
  Settings,
  CircleHelp,
  Menu as MenuIcon,
} from "lucide-react"
import { ButtonTooltip } from "@/components/ui/button-tooltip"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/menu"
import { useI18n } from "@/lib/i18n-provider"
import styles from "./enhancement.module.css"
export type ActivityArea = "sessions" | "files"
export function ActivityNavigation({
  area,
  page,
  href,
  onNavigate,
  onArea,
  onSearch,
  onSettings,
  onHelp,
  settingsOpen,
  taskCount,
  changeCount,
  artifactCount,
}: {
  area: ActivityArea
  page: string
  href: (page: string) => string
  onNavigate: (page: string) => void
  onArea: (area: ActivityArea) => void
  onSearch: () => void
  onSettings: () => void
  onHelp: () => void
  settingsOpen: boolean
  taskCount: number
  changeCount: number
  artifactCount: number
}) {
  const { locale, t } = useI18n(),
    en = locale === "en"
  const links = [
    { page: "session", label: en ? "Sessions" : "会话", icon: MessageSquare },
    {
      page: "review",
      label: t("workbench.changes"),
      icon: GitCompare,
      count: changeCount,
    },
    {
      page: "artifacts",
      label: t("workbench.artifacts"),
      icon: Package,
      count: artifactCount,
    },
    {
      page: "inbox",
      label: en ? "Tasks" : "任务",
      icon: ListTodo,
      count: taskCount,
    },
  ]
  const link = (entry: (typeof links)[number]) => (
    <ButtonTooltip key={entry.page} label={entry.label}>
      <Link
        href={href(entry.page)}
        prefetch={false}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          styles.railButton,
        )}
        aria-label={entry.label}
        aria-current={page === entry.page ? "page" : undefined}
        onClick={(event) => {
          if (
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            event.button === 0
          ) {
            event.preventDefault()
            onNavigate(entry.page)
            if (entry.page === "session") onArea("sessions")
          }
        }}
      >
        <entry.icon />
        <span className={styles.count}>{entry.count || ""}</span>
      </Link>
    </ButtonTooltip>
  )
  return (
    <nav
      className={styles.activityNav}
      aria-label={en ? "Workbench tools" : "工作台工具"}
    >
      <div className={styles.desktopRail}>
        {link(links[0])}
        <Button
          variant="ghost"
          size="icon"
          className={styles.railButton}
          aria-label={t("workbench.files")}
          aria-pressed={area === "files"}
          onClick={() => onArea("files")}
        >
          <Files />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={styles.railButton}
          aria-label={en ? "Search workbench" : "搜索工作台"}
          onClick={onSearch}
        >
          <Search />
        </Button>
        {links.slice(1).map(link)}
        <div className={styles.railBottom}>
          <Button
            variant="ghost"
            size="icon"
            className={styles.railButton}
            aria-label={t("resource.settings")}
            aria-expanded={settingsOpen}
            onClick={onSettings}
          >
            <Settings />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={styles.railButton}
            aria-label={en ? "Keyboard shortcuts" : "快捷键说明"}
            onClick={onHelp}
          >
            <CircleHelp />
          </Button>
        </div>
      </div>
      <div className={styles.mobileRail}>
        {link(links[0])}
        <Button
          variant="ghost"
          size="icon"
          className={styles.railButton}
          aria-label={t("workbench.files")}
          aria-pressed={area === "files"}
          onClick={() => onArea("files")}
        >
          <Files />
        </Button>
        {link(links[3])}
        <Menu>
          <MenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={styles.railButton}
                aria-label={en ? "More workbench tools" : "更多工作台工具"}
              />
            }
          >
            <MenuIcon />
          </MenuTrigger>
          <MenuContent>
            {links.slice(1, 3).map((entry) => (
              <MenuItem key={entry.page} onClick={() => onNavigate(entry.page)}>
                {entry.label} ({entry.count})
              </MenuItem>
            ))}
            <MenuItem onClick={onSearch}>
              {en ? "Search workbench" : "搜索工作台"}
            </MenuItem>
            <MenuItem onClick={onSettings}>{t("resource.settings")}</MenuItem>
            <MenuItem onClick={onHelp}>
              {en ? "Keyboard shortcuts" : "快捷键说明"}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </nav>
  )
}
