export const primaryNavigation = [
  { href: "/docs/", key: "site.documentation" },
  { href: "/components/", key: "site.components" },
  { href: "/examples/", key: "site.examples.navigation" },
  { href: "/blog/", key: "site.optimization.blog" },
] as const
export const resourceNavigation = [
  { href: "/dictionary/", key: "site.visualDictionary" },
  { href: "/style-workbench/", key: "site.styleWorkbench" },
  { href: "/scroll/", key: "site.scrollLab" },
  { href: "/components/?category=patterns", key: "site.blocks" },
] as const
export const repositoryUrl = "https://github.com/Crsei/EasyuseUI"
export function isNavigationActive(pathname: string, href: string) {
  const root = href.replace(/\/$/, "")
  return pathname === root || pathname.startsWith(root + "/")
}
