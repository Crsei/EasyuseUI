/** Build-time public addresses. A configured URL is not a health/service receipt. */
export const independentExampleApps = {
  "agent-workspace": {
    showcaseHref: "/examples/agent-workbench/elements/",
    origin: process.env.NEXT_PUBLIC_AGENT_WORKSPACE_ORIGIN,
  },
} as const

export function publicAppOrigin(value: string | undefined): string | undefined {
  if (!value) return
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') return
    return url.origin
  } catch { return }
}

const choices: Record<string, readonly string[]> = {
  template: ['coding', 'artifacts', 'console'],
  page: ['home', 'project', 'session', 'new', 'review', 'artifacts', 'inbox', 'settings'],
  layout: ['conversation', 'review', 'tasks'],
  panel: ['changes', 'files', 'plan', 'context', 'activity', 'agents', 'output', 'preview', 'git', 'browser'],
}
const identifiers = ['session', 'project', 'region', 'scenario']
export function agentAppHref(origin: string | undefined, pathname: string, params: URLSearchParams): string | undefined {
  const base = publicAppOrigin(origin)
  if (!base) return
  const route = /\/pi\/?$/.test(pathname) ? '/pi/' : /\/layouts\/?$/.test(pathname) ? '/layouts/' : /\/regions\/?$/.test(pathname) ? '/regions/' : '/'
  const url = new URL(route, base)
  for (const [key, value] of params) {
    if (url.searchParams.has(key)) continue
    if (choices[key]?.includes(value) || (identifiers.includes(key) && /^[a-zA-Z0-9][\w.-]{0,127}$/.test(value))) url.searchParams.set(key, value)
  }
  return url.href
}
