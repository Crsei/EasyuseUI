"use client"
import { useState } from "react"
import { Bell, Check } from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Item } from "@/components/ui/item"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import type { Company, Notification } from "./model"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function Notifications({
  notifications,
  companies,
  onRead,
  onReadAll,
  onCompany,
  open,
  onOpenChange,
}: {
  notifications: readonly Notification[]
  companies: readonly Company[]
  onRead: (id: string) => void
  onReadAll: () => void
  onCompany: (id: string) => void
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const { t } = useCrmI18n()
  const [filter, setFilter] = useState("all")
  const [missing, setMissing] = useState(false)
  const unread = notifications.filter((n) => n.unread).length
  const visible = notifications.filter((n) => filter === "all" || n.unread)
  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value)
        setMissing(false)
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={styles.roundButton}
            aria-label={t("crm.notificationCount", { count: unread })}
          />
        }
      >
        <Bell aria-hidden="true" />
        {unread > 0 && <span className={styles.unreadDot} />}
      </PopoverTrigger>
      <PopoverContent align="end" className={styles.notifications}>
        <div className={styles.notificationHeading}>
          <PopoverTitle>{t("crm.notifications")}</PopoverTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReadAll}
            disabled={!unread}
          >
            {t("crm.markAllRead")}
          </Button>
        </div>
        <PopoverDescription className="sr-only">
          {t("crm.localOnly")}
        </PopoverDescription>
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(String(value))}
        >
          <TabsList className={styles.tabs}>
            <TabsTab value="all">{t("crm.all")}</TabsTab>
            <TabsTab value="unread">
              {t("crm.unread")} ({unread})
            </TabsTab>
          </TabsList>
          <TabsPanel value={filter} className={styles.notificationList}>
            {missing && (
              <p role="alert" className={styles.notice}>
                {t("crm.missingCompany")}
              </p>
            )}
            {visible.length ? (
              visible.map((n) => {
                const company = companies.find((c) => c.id === n.companyId)
                return (
                  <Item
                    key={n.id}
                    className={styles.notificationItem}
                    title={
                      <>
                        {company?.name ?? n.companyId}
                        {n.unread && <span className={styles.unreadDot} />}
                      </>
                    }
                    description={t(
                      n.kind === "invite"
                        ? "crm.inviteNotice"
                        : `crm.${n.kind}`,
                      { name: n.person },
                    )}
                    leading={<Avatar name={n.person} size={32} />}
                    ariaLabel={t("crm.openCompany", {
                      name: company?.name ?? n.companyId,
                    })}
                    onSelect={() => {
                      if (!company) {
                        setMissing(true)
                        return
                      }
                      onOpenChange(false)
                      onCompany(company.id)
                    }}
                    trailing={
                      n.unread && (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`${t("crm.markRead")} · ${company?.name ?? n.companyId}`}
                          onClick={() => onRead(n.id)}
                        >
                          <Check aria-hidden="true" />
                        </Button>
                      )
                    }
                  />
                )
              })
            ) : (
              <p className={styles.notice}>
                {t(
                  filter === "unread" ? "crm.noUnread" : "crm.noNotifications",
                )}
              </p>
            )}
          </TabsPanel>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
