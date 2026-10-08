import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

export async function themeModes(root) {
  const source = await readFile(path.join(root, "styles/theme.css"), "utf8")
  const tokens = (selector) => {
    const body = source.match(new RegExp(`${selector}\\s*\\{([^}]+)\\}`))?.[1]
    if (!body) throw new Error(`Missing theme selector ${selector}`)
    return Object.fromEntries(
      [...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, key, value]) => [
        key,
        value.trim(),
      ]),
    )
  }
  const light = tokens(":root"),
    dark = tokens("\\.dark"),
    inline = tokens("@theme inline")
  const names = Object.keys(light)
  const variables = (content) =>
    names.reduce(
      (value, name) =>
        value.replace(new RegExp(`--${name}(?![\\w-])`, "g"), `--eu-${name}`),
      content,
    )
  const hostMapping = {
    background: "--background",
    foreground: "--foreground",
    surface: "--background",
    "surface-hover": "--accent",
    "surface-raised": "--muted",
    "surface-pressed": "--accent",
    "text-secondary": "--muted-foreground",
    "text-muted": "--muted-foreground",
    primary: "--primary",
    "primary-foreground": "--primary-foreground",
    muted: "--muted",
    "muted-foreground": "--muted-foreground",
    border: "--border",
    "border-hover": "--border",
    ring: "--ring",
    destructive: "--destructive",
    info: "--primary",
    success: "--primary",
    warning: "--primary",
    agent: "--primary",
  }
  const declarations = (values) =>
    Object.entries(values)
      .map(([key, value]) => `  --eu-${key}: ${variables(value)};`)
      .join("\n")
  const host = Object.fromEntries(
    Object.entries(light).map(([key, value]) => [
      key,
      hostMapping[key]
        ? `var(${hostMapping[key]}, ${key === "surface-hover" || key === "surface-pressed" ? "var(--muted)" : "inherit"})`
        : variables(value),
    ]),
  )
  // Host references must retain their public names rather than being rewritten to themselves.
  const hostDeclarations = Object.entries(host)
    .map(
      ([key, value]) =>
        `  --eu-${key}: ${hostMapping[key] ? value : variables(value)};`,
    )
    .join("\n")
  const aliases = names.map((key) => `  --${key}: var(--eu-${key});`).join("\n")
  const css = `/* Generated from styles/theme.css by scripts/theme-modes.mjs. No root defaults, resets or fonts. */\n:where([data-eu-mode]) {\n  color: var(--eu-foreground);\n  background: var(--eu-background);\n}\n:where([data-eu-mode="host"]) {\n${hostDeclarations}\n}\n:where([data-eu-mode="scoped"][data-eu-theme="light"]) {\n${declarations(light)}\n  color-scheme: light;\n}\n:where([data-eu-mode="scoped"][data-eu-theme="dark"]) {\n${declarations({ ...light, ...dark })}\n  color-scheme: dark;\n}\n:where([data-eu-legacy-aliases="true"]) {\n${aliases}\n}\n`
  await writeFile(path.join(root, "styles/theme-boundary.css"), css)
  const theme = {}
  for (const [key, value] of Object.entries(inline)) {
    if (key.startsWith("font-")) continue
    const category = ["color-", "spacing-", "radius-"].find((prefix) =>
      key.startsWith(prefix),
    )
    if (category)
      theme[`${category}eu-${key.slice(category.length)}`] = variables(value)
  }
  theme["shadow-eu-floating"] = "var(--eu-shadow-floating)"
  const groups = {
    color: Object.keys(inline)
      .filter((key) => key.startsWith("color-"))
      .map((key) => key.slice(6)),
    spacing: Object.keys(inline)
      .filter((key) => key.startsWith("spacing-"))
      .map((key) => key.slice(8)),
    radius: Object.keys(inline)
      .filter((key) => key.startsWith("radius-"))
      .map((key) => key.slice(7)),
  }
  const replaceUtility = (content, prefixes, names) =>
    content.replace(
      new RegExp(
        `(?<![\\w-])(${prefixes})-(${names.sort((a, b) => b.length - a.length).join("|")})(?=[/\\s"'\x60\\]\\),]|$)`,
        "g",
      ),
      "$1-eu-$2",
    )
  function namespace(content) {
    let value = variables(content).replace(
      "var(--${meta.token})",
      "var(--eu-${meta.token})",
    )
    value = replaceUtility(
      value,
      "bg|text|border|ring|outline|fill|stroke|decoration|divide|caret|accent|ring-offset",
      groups.color,
    )
    value = replaceUtility(
      value,
      "h|w|size|min-h|min-w|max-h|max-w|p|px|py|m|gap",
      groups.spacing,
    )
    value = replaceUtility(
      value,
      "rounded|rounded-t|rounded-b|rounded-l|rounded-r",
      groups.radius,
    )
    return value.replace(
      /(?<![\w-])shadow-floating(?![\w-])/g,
      "shadow-eu-floating",
    )
  }
  return { theme, namespace }
}
