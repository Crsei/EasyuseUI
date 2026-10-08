import { SiteText } from "@/components/site/site-i18n"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { CodeBlock } from "@/components/docs/code-block"
import { catalog } from "@/lib/catalog"

export const metadata = { title: "介绍" }

export default function DocsPage() {
  return (
    <>
      <p className="mb-3 text-xs font-medium text-primary">
        <SiteText messageKey="site.start" />
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        <SiteText messageKey="site.introduction" />
      </h1>
      <p className="mt-5 text-base leading-8 text-muted-foreground">
        <SiteText messageKey="site.easyuseuiIsASetOfReactComponentsYouCan" />
      </p>
      <h2 className="mt-12 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.howComponentsWork" />
      </h2>
      <p className="mb-5 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.afterInstallationThroughTheShadcnCliFilesLiveIn" />
      </p>
      <CodeBlock
        code={
          'import { Button } from "@/components/ui/button"\n\nexport function SaveButton() {\n  return <Button onClick={() => console.log("保存")}>保存更改</Button>\n}'
        }
      />
      <h2 className="mt-12 mb-5 text-xl font-semibold">
        <SiteText messageKey="site.currentlyAvailable" />
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.map((entry) => (
          <Link prefetch={false}
            key={entry.slug}
            href={`/docs/${entry.slug}`}
            className="rounded-xl border p-5 transition-colors hover:bg-muted/40"
          >
            <h3 className="font-medium">{entry.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {entry.description}
            </p>
          </Link>
        ))}
      </div>
      <h2 className="mt-12 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.designConventions" />
      </h2>
      <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
        <li>
          <SiteText messageKey="site.semanticColorsExpressPrimaryActionsErrorsAndCompletionIn" />
        </li>
        <li>
          <SiteText messageKey="site.interactiveControlsRetainKeyboardOperationFocusIndicatorsAndAccessible" />
        </li>
        <li>
          <SiteText messageKey="site.componentsReceiveDataAndCallbacksTheConsumingProjectOwns" />
        </li>
        <li>
          <SiteText messageKey="site.savingCreationAndTaskRetryInExamplesAreLocal" />
        </li>
      </ul>
      <Link prefetch={false} href="/docs/installation" className={`${buttonVariants()} mt-10`}>
        <SiteText messageKey="site.installYourFirstComponent" />
        <ArrowRight size={15} />
      </Link>
    </>
  )
}
