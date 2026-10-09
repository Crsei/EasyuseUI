"use client"
import type { ReactNode, RefObject } from "react"
import { Menu, Search } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { currentUser } from "./fixtures"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function SalesCrmHeader({
  onNavigation,
  onSearch,
  onProfile,
  notifications,
  searchRef,
}: {
  onNavigation: () => void
  onSearch: () => void
  onProfile: () => void
  notifications: ReactNode
  searchRef: RefObject<HTMLButtonElement | null>
}) {
  const { t } = useCrmI18n()
  return (
    <div className={styles.header}>
      <Button
        size="icon"
        variant="ghost"
        className={styles.mobileNavigation}
        aria-label={t("crm.openNavigation")}
        onClick={onNavigation}
      >
        <Menu aria-hidden="true" />
      </Button>
      <h1>{t("crm.companies")}</h1>
      <span className={styles.active}>
        <i />
        {t("crm.active")}
      </span>
      <div className={styles.headerActions}>
        <Button
          ref={searchRef}
          variant="outline"
          size="icon"
          className={styles.roundButton}
          aria-label={t("crm.search")}
          onClick={onSearch}
        >
          <Search aria-hidden="true" />
        </Button>
        {notifications}
        <Button
          variant="outline"
          className={styles.profileButton}
          onClick={onProfile}
          aria-label={t("crm.openProfile", { name: currentUser.name })}
        >
          <Avatar name={currentUser.name} size={24} />
          <span>{currentUser.name}</span>
        </Button>
      </div>
    </div>
  )
}
