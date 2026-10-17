import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { withViewTransition } from '@/lib/motion'
import { formatRoute, pageOf, parseRoute, type Route } from './route'
import { RouterContext, type NavigateOptions, type RouterContextValue } from './RouterContext'

/**
 * 跨页面（首页 ↔ 结果页）的切换使用 View Transition，共享元素平滑变形。
 * page-transition 类用于只在页面切换期间启用共享元素命名。
 */
function commit(from: Route, to: Route, apply: () => void) {
  if (pageOf(from) === pageOf(to)) apply()
  else withViewTransition(() => flushSync(apply), { rootClass: 'page-transition' })
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.search))
  const routeRef = useRef(route)

  useEffect(() => {
    const onPopState = () => {
      const next = parseRoute(window.location.search)
      const current = routeRef.current
      routeRef.current = next
      commit(current, next, () => setRoute(next))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((patch: Partial<Route>, options: NavigateOptions = {}) => {
    const current = routeRef.current
    const next = { ...current, ...patch }
    const url = formatRoute(next)
    if (url === formatRoute(current)) return

    routeRef.current = next
    commit(current, next, () => {
      window.history[options.replace ? 'replaceState' : 'pushState'](null, '', url)
      setRoute(next)
      if (next.q !== current.q) window.scrollTo({ top: 0 })
    })
  }, [])

  const value = useMemo<RouterContextValue>(() => ({ route, navigate }), [route, navigate])
  return <RouterContext value={value}>{children}</RouterContext>
}
