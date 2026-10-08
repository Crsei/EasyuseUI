import { SiteText } from "@/components/site/site-i18n"
import { CodeBlock } from "@/components/docs/code-block"
import { registryUrl } from "@/lib/site"

export const metadata = { title: "安装与主题" }

export default function InstallationPage() {
  return (
    <>
      <p className="mb-3 text-xs font-medium text-primary">
        <SiteText messageKey="site.start" />
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        <SiteText messageKey="site.installationAndTheme" />
      </h1>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.prepareAProjectWithReactTypescriptAndTailwindCss" />
      </p>
      <h2 className="mt-10 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.1InitializeShadcn" />
      </h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.runInTheReceivingProjectSRootSkipThis" />
      </p>
      <CodeBlock
        lang="bash"
        code="pnpm dlx shadcn@latest init"
        title="Terminal"
      />
      <h2 className="mt-10 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.2InstallAComponent" />
      </h2>
      <CodeBlock
        lang="bash"
        code={`pnpm dlx shadcn@latest add ${registryUrl}/button.json`}
        title="Terminal"
      />
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.theInstallerResolvesComponentDependenciesAndTheEasyuseuiTheme" />
      </p>
      <h2 className="mt-10 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.3UseItOnAPage" />
      </h2>
      <CodeBlock
        code={
          '"use client"\n\nimport { Button } from "@/components/ui/button"\n\nexport function Example() {\n  return <Button onClick={() => alert("你好，EasyuseUI")}>开始使用</Button>\n}'
        }
      />
      <h2 className="mt-10 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.themeAndCustomization" />
      </h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.componentsUseSemanticColorsSuchAsBackgroundForegroundPrimary" />
      </p>
      <CodeBlock
        lang="bash"
        title="安装组合模块"
        code={`pnpm dlx shadcn@latest add ${registryUrl}/task-panel.json`}
      />
      <h2 className="mt-10 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.optimization.themeScope" />
      </h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.optimization.themeInstallNote" />
      </p>
      <CodeBlock
        lang="bash"
        code={`pnpm dlx shadcn@4.21.2 add ${registryUrl}/host/dialog.json
# or
pnpm dlx shadcn@4.21.2 add ${registryUrl}/scoped/dialog.json`}
      />
      <CodeBlock
        code={
          'import { ThemeBoundary } from "@/components/ui/theme-boundary"\n\n<ThemeBoundary mode="scoped" theme="dark">{children}</ThemeBoundary>'
        }
      />
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.optimization.themeModeContract" />
      </p>
      <h2 className="mt-10 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.deployYourOwnRegistry" />
      </h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.setNextPublicSiteUrlToYourSiteAddress" />
      </p>
      <CodeBlock
        lang="bash"
        title="在 EasyuseUI 仓库中执行"
        code={
          "NEXT_PUBLIC_SITE_URL=https://你的域名 pnpm build\n\n# 本地预览构建产物，默认端口 3011\npnpm preview"
        }
      />
      <h2 className="mt-12 mb-4 text-xl font-semibold">
        <SiteText messageKey="site.i18nInstallation" />
      </h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.i18nInstallationProse" />
      </p>
      <CodeBlock
        code={
          'import { I18nProvider } from "@/lib/i18n-provider"\n\n<I18nProvider defaultLocale="en">{children}</I18nProvider>'
        }
      />
    </>
  )
}
