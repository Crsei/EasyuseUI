"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Carousel } from "@/components/ui/carousel"
import { Chart } from "@/components/blocks/chart"
import { Input } from "@/components/ui/input"
export function CardDemo() {
  const { t } = useSiteI18n()
  return (
    <Card className="w-full max-w-sm" aria-labelledby="card-demo-title">
      <CardHeader>
        <CardTitle id="card-demo-title">{t("site.completion.title")}</CardTitle>
        <CardDescription>{t("site.completion.content")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{t("site.completion.hint")}</p>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">2026-10-09</span>
      </CardFooter>
    </Card>
  )
}
export function AspectRatioDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="w-full max-w-sm">
      <AspectRatio
        ratio={16 / 9}
        className="flex items-center justify-center rounded-control border bg-surface-raised text-sm"
      >
        {t("site.completion.title")} · 16:9
      </AspectRatio>
    </div>
  )
}
export function CarouselDemo() {
  const { t } = useSiteI18n()
  const [drafts, setDrafts] = useState(["", "", ""])
  return (
    <Carousel
      className="w-full max-w-md"
      label={t("site.completion.title")}
      items={drafts.map((draft, i) => (
        <div key={i} className="grid min-h-40 gap-3 rounded-control border p-4">
          <p className="text-sm">
            {t("site.completion.content")} · {i + 1}
          </p>
          <Input
            aria-label={`${t("site.completion.draft")} ${i + 1}`}
            value={draft}
            onChange={(e) =>
              setDrafts((old) =>
                old.map((v, j) => (j === i ? e.target.value : v)),
              )
            }
          />
        </div>
      ))}
    />
  )
}
export function ChartDemo() {
  const { t } = useSiteI18n()
  const data = [
    { id: "a", label: "Alpha", value: 12 },
    { id: "b", label: "Beta", value: -8 },
    { id: "c", label: "Gamma", value: null },
    { id: "d", label: "Delta", value: 0 },
  ]
  return (
    <div className="grid w-full max-w-lg gap-6">
      <Chart label={t("site.completion.title")} data={data} />
      <Chart type="line" label={t("site.completion.content")} data={data} />
      <Chart label={t("site.completion.empty")} data={[]} />
    </div>
  )
}
