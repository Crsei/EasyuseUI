"use client"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import { exampleManifest } from "@/lib/example-manifest"
import { useSiteI18n } from "../site-i18n"
import { SceneImage } from "./scene-image"
import styles from "../site.module.css"
export function ScenePreview() {
  const { t, locale } = useSiteI18n()
  return (
    <div className={styles.scene} data-home-scenes>
      <Tabs defaultValue="agent">
        <div className={styles.sceneControls}>
          <TabsList className={styles.sceneTabs}>
            {exampleManifest.map((example) => (
              <TabsTab key={example.id} value={example.id}>
                {example.title[locale]}
              </TabsTab>
            ))}
          </TabsList>
          <span className={styles.localLabel}>
            {t("site.redesign.localDemo")}
          </span>
        </div>
        {exampleManifest.map((example) => (
          <TabsPanel key={example.id} value={example.id} className="p-0">
            <div className={styles.sceneDescription}>
              <p>{example.description[locale]}</p>
              <span className={styles.mobileLocalLabel}>
                {t("site.redesign.localDemo")}
              </span>
              <Link prefetch={false} href={example.href}>
                {t("site.redesign.openExample")}
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <SceneImage example={example} priority={example.id === "agent"} />
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  )
}
