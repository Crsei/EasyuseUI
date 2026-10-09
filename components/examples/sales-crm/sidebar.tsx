"use client"
import Link from "next/link"
import { useId } from "react"
import {
  Blocks,
  Building2,
  Clipboard,
  ChartNoAxesColumn,
  List,
  Contact,
  Mail,
  Target,
  Crosshair,
  Users,
  ChartColumn,
  TriangleAlert,
  UserPlus,
  CircleHelp,
  CreditCard,
  BookOpen,
  FlaskConical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function SalesCrmSidebar({
  count,
  onAbout,
  onNavigate,
}: {
  count: number
  onAbout: () => void
  onNavigate?: () => void
}) {
  const { t } = useCrmI18n()
  const unavailableId = useId()
  const groups = [
    {
      label: null,
      items: [
        [Building2, t("crm.companies"), String(count), true],
        [Clipboard, t("crm.dealsBoard")],
        [ChartNoAxesColumn, t("crm.forecast"), "9"],
        [List, t("crm.activities")],
        [Contact, t("crm.contacts"), "38"],
        [Mail, t("crm.sequences")],
      ],
    },
    {
      label: t("crm.team"),
      items: [
        [Target, t("crm.strategicAEs")],
        [Crosshair, t("crm.midMarket")],
        [Users, t("crm.sdrTeam")],
      ],
    },
    {
      label: t("crm.reporting"),
      items: [
        [ChartColumn, t("crm.q1")],
        [TriangleAlert, t("crm.slipping")],
      ],
    },
  ] as const
  return (
    <div className={styles.sidebarInner}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>
          <Blocks size={18} aria-hidden="true" />
        </span>
        <span className={styles.navText}>
          <strong>Sales CRM</strong>
          <small>{t("crm.pipelineSubtitle")}</small>
        </span>
      </div>
      <nav aria-label={t("crm.navigation")} className={styles.navigation}>
        <span id={unavailableId} className="sr-only">
          {t("crm.unavailable")}
        </span>
        {groups.map((group, i) => (
          <div className={styles.navGroup} key={i}>
            {group.label && <p className={styles.navText}>{group.label}</p>}
            {group.items.map(([Icon, label, badge, active]) => (
              <Button
                key={label}
                aria-label={label}
                variant="ghost"
                className={styles.navItem}
                disabled={!active}
                aria-current={active ? "page" : undefined}
                aria-describedby={!active ? unavailableId : undefined}
                title={!active ? t("crm.unavailable") : undefined}
                onClick={onNavigate}
              >
                <Icon aria-hidden="true" />
                <span className={styles.navText}>{label}</span>
                {badge && (
                  <span
                    className={styles.navCount}
                    title={active ? undefined : t("crm.exampleCount")}
                  >
                    {badge}
                  </span>
                )}
              </Button>
            ))}
          </div>
        ))}
        <div className={styles.navGroup}>
          <p className={styles.navText}>{t("crm.pipelines")}</p>
          {[t("crm.northAmerica"), t("crm.emea"), t("crm.apac")].map(
            (label, i) => (
              <Button
                key={label}
                aria-label={label}
                variant="ghost"
                className={styles.navItem}
                disabled
                aria-describedby={unavailableId}
              >
                <span className={styles.dot} data-color={i} />
                <span className={styles.navText}>{label}</span>
              </Button>
            ),
          )}
        </div>
      </nav>
      <div className={styles.sidebarBottom}>
        <Button
          variant="ghost"
          className={styles.navItem}
          disabled
          aria-describedby={unavailableId}
        >
          <UserPlus aria-hidden="true" />
          <span className={styles.navText}>{t("crm.invite")}</span>
        </Button>
        <Button
          variant="ghost"
          className={styles.navItem}
          disabled
          aria-describedby={unavailableId}
        >
          <CircleHelp aria-hidden="true" />
          <span className={styles.navText}>{t("crm.help")}</span>
        </Button>
        <Link
          href="/docs/data-table/"
          aria-label={t("crm.docs")}
          className={styles.navLink}
        >
          <BookOpen size={16} aria-hidden="true" />
          <span className={styles.navText}>{t("crm.docs")}</span>
        </Link>
        <Button
          variant="ghost"
          className={styles.navItem}
          aria-label={t("crm.about")}
          onClick={onAbout}
        >
          <FlaskConical aria-hidden="true" />
          <span className={styles.navText}>{t("crm.about")}</span>
        </Button>
        <div className={styles.trial}>
          <div className={styles.navText}>
            <strong>{t("crm.daysLeft")}</strong>
            <small>{t("crm.trial")}</small>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled
            title={t("crm.trialExample")}
          >
            <CreditCard aria-hidden="true" />
            <span className={styles.navText}>{t("crm.billing")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
