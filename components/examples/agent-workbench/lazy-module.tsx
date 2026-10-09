"use client"

import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import { DataRegion } from "@/components/ui/data-region"
import { useI18n } from "@/lib/i18n-provider"

function ModuleFailure({ onRetry }: { onRetry: () => void }) {
  const { locale } = useI18n()
  return (
    <DataRegion
      state="error"
      error={{
        category: "network",
        message:
          locale === "en" ? "This area could not load." : "该区域加载失败。",
        reason:
          locale === "en"
            ? "Check the connection and retry. Your draft is retained."
            : "请检查连接后重试，草稿仍保留。",
      }}
      onRetry={onRetry}
    />
  )
}

class ModuleBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <ModuleFailure onRetry={this.props.onRetry} />
    ) : (
      this.props.children
    )
  }
}

/** Example-only splitting. The retained Provider and all drafts stay outside. */
export function lazyExample<P extends object>(
  name: string,
  load: () => Promise<{ default: ComponentType<P> }>,
) {
  let resolved: ComponentType<P> | null = null
  let pending: Promise<ComponentType<P>> | null = null
  function request() {
    if (resolved) return Promise.resolve(resolved)
    if (!pending)
      pending = load()
        .then((module) => {
          resolved = module.default
          return module.default
        })
        .catch((error) => {
          pending = null
          throw error
        })
    return pending
  }
  return function ExampleModule(props: P) {
    const [module, setModule] = useState<{
      component: ComponentType<P> | null
      failed: boolean
    }>(() => ({ component: resolved, failed: false }))
    const [attempt, setAttempt] = useState(0)
    useEffect(() => {
      if (module.component) return
      let active = true
      request().then(
        (component) => {
          if (active) setModule({ component, failed: false })
        },
        () => {
          if (active) setModule({ component: null, failed: true })
        },
      )
      return () => {
        active = false
      }
    }, [attempt, module.component])
    const retry = () => {
      setModule({ component: resolved, failed: false })
      setAttempt((value) => value + 1)
    }
    const Loaded = module.component
    return (
      <div className="contents" data-workbench-module={name}>
        {module.failed ? (
          <ModuleFailure onRetry={retry} />
        ) : (
          <ModuleBoundary key={attempt} onRetry={retry}>
            {Loaded ? (
              <Suspense fallback={<DataRegion state="loading" />}>
                <Loaded {...props} />
              </Suspense>
            ) : (
              <DataRegion state="loading" />
            )}
          </ModuleBoundary>
        )}
      </div>
    )
  }
}
