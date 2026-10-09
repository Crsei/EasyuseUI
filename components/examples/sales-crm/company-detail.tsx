"use client"
import { useState } from "react"
import { Mail, Phone } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SegmentBar } from "@/components/ui/segment-bar"
import { Sparkline } from "@/components/ui/sparkline"
import { RatingDisplay } from "@/components/ui/rating-display"
import { MetricSummary } from "@/components/blocks/metric-summary"
import { owners } from "./fixtures"
import type { Company } from "./model"
import { CompanyTags, CrmSelect } from "./controls"
import { activitySeries } from "./selectors"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function CompanyDetail({
  company,
  onPerson,
}: {
  company: Company
  onPerson: (name: string) => void
}) {
  const { t } = useCrmI18n()
  const [window, setWindow] = useState(30)
  const owner = owners.find((p) => p.name === company.owner)
  return (
    <>
      <div className={styles.objectHeading}>
        <Avatar name={company.name} src={company.logo} size={40} />
        <div>
          <h2>{company.name}</h2>
          <CompanyTags tags={company.tags} />
        </div>
      </div>
      <section className={styles.detailSection}>
        <h3>{t("crm.accountSummary")}</h3>
        <div className={styles.contactLine}>
          <Button
            variant="ghost"
            onClick={() => onPerson(company.owner)}
            aria-label={t("crm.openProfile", { name: company.owner })}
          >
            <Avatar name={company.owner} size={24} />
            {company.owner}
          </Button>
          {owner && (
            <>
              <span>
                <Mail size={13} aria-hidden="true" />
                {owner.email}
              </span>
              <span>
                <Phone size={13} aria-hidden="true" />
                {owner.phone}
              </span>
            </>
          )}
        </div>
      </section>
      <section className={styles.detailSection}>
        <h3>{t("crm.health")}</h3>
        <strong className={styles.largeValue}>{company.winProbability}%</strong>
        <p>{t("crm.probabilityDescription")}</p>
        {(
          [
            [t("crm.discovery"), 0.372, "#ff7878"],
            [t("crm.evaluation"), 0.651, "#facc15"],
            [t("crm.procurement"), 0.372, "#22c55e"],
          ] as const
        ).map(([label, factor, color]) => (
          <div className={styles.healthRow} key={label}>
            <span>{label}</span>
            <SegmentBar
              label={label}
              value={Math.round(company.winProbability * factor)}
              segments={50}
              valueText={`${Math.round(company.winProbability * factor)}%`}
              color={color}
              className={styles.healthMeter}
            />
          </div>
        ))}
      </section>
      <section className={styles.detailSection}>
        <div className={styles.sectionHeading}>
          <h3>{t("crm.trend")}</h3>
          <CrmSelect
            label={t("crm.activityWindow")}
            value={String(window)}
            options={[7, 30, 90].map((days) => ({
              value: String(days),
              label: t("crm.days", { count: days }),
            }))}
            onChange={(value) => setWindow(Number(value))}
          />
        </div>
        <p>{t("crm.sampleStats")}</p>
        <div className={styles.activityHeading}>
          <strong>{company.openDeals * 15}</strong>
          <Sparkline
            label={`${company.name} · ${t("crm.trend")} · ${t("crm.days", { count: window })}`}
            summary={company.trend.length ? undefined : t("crm.noTrend")}
            values={activitySeries(company, window)}
            className={styles.detailTrend}
            color={(v, i) =>
              i % 3 ? "var(--crm-trend)" : "var(--crm-trend-muted)"
            }
          />
        </div>
        <MetricSummary
          className={styles.activityMetrics}
          items={[
            {
              id: "touch",
              label: t("crm.touches"),
              value: company.openDeals * 4,
            },
            {
              id: "email",
              label: t("crm.emails"),
              value: company.openDeals + 4,
            },
            {
              id: "meeting",
              label: t("crm.meetings"),
              value: Math.ceil(company.openDeals / 2),
            },
            { id: "call", label: t("crm.calls"), value: company.openDeals + 1 },
          ]}
        />
      </section>
      <section className={styles.detailSection}>
        <h3>{t("crm.scoreCard")}</h3>
        <p>{t("crm.localStats")}</p>
        {[
          t("crm.businessFit"),
          t("crm.technicalFit"),
          t("crm.technicalFit"),
        ].map((label, i) => (
          <article className={styles.scoreCard} key={i}>
            <div className={styles.sectionHeading}>
              <h4>{label}</h4>
              <RatingDisplay label={`${label} · ${t("crm.rate")}`} value={4} />
            </div>
            <p>{t("crm.scoreDescription")}</p>
            <div className={styles.sectionHeading}>
              <span className={styles.reviewedBy}>
                {t("crm.reviewedBy")}{" "}
                <Avatar name={owners[12 + i].name} size={24} />
                {owners[12 + i].name}
              </span>
              <span className={styles.verdict}>{t("crm.highPotential")}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
