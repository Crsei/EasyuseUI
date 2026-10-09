import { notFound } from "next/navigation"
import { catalog } from "@/lib/catalog"
import { docGuides } from "@/lib/doc-guides"
import { ComponentDoc } from "@/components/docs/component-doc"
import { GuideDoc } from "@/components/docs/guide-doc"
export const dynamicParams = false
export function generateStaticParams() {
  return [
    ...catalog.map(({ slug }) => ({ slug })),
    ...docGuides
      .filter((guide) => guide.slug !== "installation")
      .map(({ slug }) => ({ slug })),
  ]
}
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params,
    entry = catalog.find((item) => item.slug === slug),
    guide = docGuides.find((item) => item.slug === slug)
  return {
    title: entry?.name ?? guide?.title["zh-CN"],
    description: entry?.description ?? guide?.summary["zh-CN"],
    alternates: { canonical: `/docs/${slug}/` },
  }
}
export default async function ComponentPage({ params }: Props) {
  const { slug } = await params,
    entry = catalog.find((item) => item.slug === slug),
    guide = docGuides.find((item) => item.slug === slug)
  if (guide) return <GuideDoc guide={guide} />
  if (!entry) notFound()
  return <ComponentDoc entry={entry} />
}
