import Link from "next/link"
import { SiteText } from "./site-i18n"
import {
  primaryNavigation,
  resourceNavigation,
  repositoryUrl,
} from "@/lib/site-navigation"
import styles from "./site.module.css"
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div>
        <Link
          href="/"
          prefetch={false}
          className="font-semibold text-foreground"
        >
          EasyuseUI
        </Link>
        <p>
          <SiteText messageKey="site.redesign.sourceOwnership" />
        </p>
      </div>
      <nav aria-label="EasyuseUI">
        {[
          ...primaryNavigation,
          ...resourceNavigation,
          {
            href: "/docs/installation/",
            key: "site.installationGuide" as const,
          },
        ].map((item) => (
          <Link prefetch={false} key={item.href} href={item.href}>
            <SiteText messageKey={item.key} />
          </Link>
        ))}
        <a href={repositoryUrl}>
          <SiteText messageKey="site.redesign.repository" />
        </a>
      </nav>
    </footer>
  )
}
