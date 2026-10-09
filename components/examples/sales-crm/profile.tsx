"use client"
import { Avatar } from "@/components/ui/avatar"
import { Item } from "@/components/ui/item"
import { SegmentBar } from "@/components/ui/segment-bar"
import { MetricSummary } from "@/components/blocks/metric-summary"
import { summarize } from "./selectors"
import { currentUser } from "./fixtures"
import type { Company, Person } from "./model"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function Profile({
  person,
  companies,
  onCompany,
}: {
  person: Person
  companies: readonly Company[]
  onCompany: (id: string) => void
}) {
  const { t, locale } = useCrmI18n()
  const accounts = companies
    .filter((c) => person.name === currentUser.name || c.owner === person.name)
    .sort((a, b) => b.pipelineValue - a.pipelineValue)
  const summary = summarize(accounts)
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n)
  return (
    <>
      <div className={styles.objectHeading}>
        <Avatar name={person.name} size={40} />
        <div>
          <h2>{person.name}</h2>
          <p>{person.role}</p>
        </div>
      </div>
      <section className={styles.detailSection}>
        <h3>{t("crm.contact")}</h3>
        <dl className={styles.contactDetails}>
          <div>
            <dt>{t("crm.email")}</dt>
            <dd>{person.email}</dd>
          </div>
          <div>
            <dt>{t("crm.phone")}</dt>
            <dd>{person.phone}</dd>
          </div>
        </dl>
      </section>
      <section className={styles.detailSection}>
        <h3>
          {t(
            person.name === currentUser.name
              ? "crm.teamPipeline"
              : "crm.pipelineSummary",
          )}
        </h3>
        <MetricSummary
          className={styles.profileMetrics}
          items={[
            { id: "count", label: t("crm.accounts"), value: summary.count },
            { id: "deals", label: t("crm.openDeals"), value: summary.deals },
            {
              id: "pipeline",
              label: t("crm.pipelineValue"),
              value: money(summary.pipeline),
            },
            {
              id: "win",
              label: t("crm.avgWin"),
              value: summary.win === null ? "—" : `${Math.round(summary.win)}%`,
            },
          ]}
        />
      </section>
      <section className={styles.detailSection}>
        <h3>{t("crm.assignedAccounts")}</h3>
        <p>{t("crm.sampleStats")}</p>
        {accounts.length ? (
          <div className={styles.profileAccounts}>
            {accounts.map((c) => (
              <Item
                key={c.id}
                title={c.name}
                description={`${c.openDeals} ${t("crm.openDeals")} · ${c.tags.join(", ")}`}
                trailing={
                  <div className={styles.profileValue}>
                    <span>{money(c.pipelineValue)}</span>
                    <SegmentBar
                      label={`${c.name} · ${t("crm.winProbability")}`}
                      value={c.winProbability}
                      valueText={`${c.winProbability}%`}
                      color="var(--crm-trend)"
                      segments={18}
                    />
                  </div>
                }
                leading={<Avatar name={c.name} src={c.logo} size={32} />}
                onSelect={() => onCompany(c.id)}
                ariaLabel={t("crm.openCompany", { name: c.name })}
                className={styles.profileAccount}
              />
            ))}
          </div>
        ) : (
          <p>{t("crm.noAccounts")}</p>
        )}
      </section>
    </>
  )
}
