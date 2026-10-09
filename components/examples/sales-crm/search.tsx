"use client"
import type { RefObject } from "react"
import { Building2, User, Plus } from "lucide-react"
import { CommandPalette } from "@/components/blocks/command-palette"
import { Avatar } from "@/components/ui/avatar"
import { SegmentBar } from "@/components/ui/segment-bar"
import { Tag } from "@/components/ui/tag"
import { CompanyTags } from "./controls"
import { visibleTags } from "./selectors"
import { owners, currentUser } from "./fixtures"
import type { Company } from "./model"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function SalesCrmSearch({
  open,
  onOpenChange,
  query,
  onQueryChange,
  companies,
  onCompany,
  onPerson,
  onNew,
  scope,
  finalFocus,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  query: string
  onQueryChange: (query: string) => void
  companies: readonly Company[]
  onCompany: (id: string) => void
  onPerson: (name: string) => void
  onNew: () => void
  scope: RefObject<HTMLElement | null>
  finalFocus: () => HTMLElement | null
}) {
  const { t, locale } = useCrmI18n()
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  const date = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
  const needle = query.trim().normalize("NFKC").toLocaleLowerCase()
  const matches = (text: string) =>
    text.normalize("NFKC").toLocaleLowerCase().includes(needle)
  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      title={t("crm.search")}
      description={t("crm.searchDescription")}
      query={query}
      onQueryChange={onQueryChange}
      emptyMessage={t("crm.noResults")}
      shortcut={{ key: "k", mod: true, scope }}
      finalFocus={finalFocus}
      className={styles.searchDialog}
      renderItem={(item) => {
        if (!item.id.startsWith("company:")) return undefined
        const company = companies.find((c) => c.id === item.id.slice(8))
        if (!company) return undefined
        const tags = visibleTags(company.tags)
        return (
          <div className={styles.searchResult}>
            <span className={styles.searchName}>
              <Avatar name={company.name} size={24} />
              {company.name}
            </span>
            <span className={styles.tags}>
              <CompanyTags tags={tags.visible} />
              {tags.hidden > 0 && (
                <Tag
                  className={styles.tag}
                  title={company.tags.slice(tags.visible.length).join(", ")}
                >
                  +{tags.hidden}
                </Tag>
              )}
            </span>
            <span className={styles.searchOwner}>
              <Avatar name={company.owner} size={24} />
              {company.owner}
            </span>
            <span className={styles.searchMoney}>
              {money.format(company.pipelineValue)}
            </span>
            <span className={styles.searchWin}>
              <SegmentBar
                className={styles.win}
                segments={18}
                value={company.winProbability}
                valueText={`${company.winProbability}%`}
                color="var(--crm-trend)"
                label={`${company.name} · ${t("crm.winProbability")}`}
              />
            </span>
            <span className={styles.searchDate}>
              {date.format(
                new Date(`${company.lastInteraction.date}T00:00:00Z`),
              )}{" "}
              · {company.lastInteraction.label}
            </span>
          </div>
        )
      }}
      groups={[
        {
          id: "companies",
          label: t("crm.companies"),
          items: companies
            .filter((c) => matches([c.name, c.owner, ...c.tags].join(" ")))
            .map((c) => ({
              id: `company:${c.id}`,
              label: c.name,
              description: `${c.owner} · ${c.tags.join(" / ")}`,
              icon: <Building2 aria-hidden="true" />,
            })),
        },
        {
          id: "owners",
          label: t("crm.searchOwners"),
          items: [...owners, currentUser]
            .filter((p) => matches(p.name))
            .map((p) => ({
              id: `person:${p.name}`,
              label: p.name,
              description: p.role,
              icon: <User aria-hidden="true" />,
            })),
        },
        {
          id: "actions",
          label: t("crm.searchActions"),
          items:
            !needle || matches(t("crm.newCompany"))
              ? [
                  {
                    id: "new",
                    label: t("crm.newCompany"),
                    description: t("crm.localOnly"),
                    icon: <Plus aria-hidden="true" />,
                  },
                ]
              : [],
        },
      ]}
      onSelect={(item) => {
        if (item.id === "new") onNew()
        else if (item.id.startsWith("company:")) onCompany(item.id.slice(8))
        else onPerson(item.id.slice(7))
      }}
    />
  )
}
