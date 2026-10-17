import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { readJson, writeJson } from '@/lib/storage'
import { withViewTransition } from '@/lib/motion'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { createSchemeVariables } from './scheme'
import { DEFAULT_THEME, type ThemePreferences } from './preferences'
import { ThemeContext, type ThemeContextValue, type TransitionOrigin } from './ThemeContext'

const STORAGE_KEY = 'ds-search:theme'

function revealFrom({ x, y }: TransitionOrigin) {
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    {
      duration: 600,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      pseudoElement: '::view-transition-new(root)',
    },
  )
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setState] = useState<ThemePreferences>(() => readJson(STORAGE_KEY, DEFAULT_THEME))
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const isDark = preferences.mode === 'dark' || (preferences.mode === 'system' && systemDark)
  const variables = useMemo(() => createSchemeVariables(preferences.seed, isDark), [preferences.seed, isDark])

  // 布局阶段注入颜色令牌，保证 View Transition 截取新快照时颜色已就绪
  useLayoutEffect(() => {
    const root = document.documentElement
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value)
    root.dataset.theme = isDark ? 'dark' : 'light'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', variables['--md-sys-color-surface'] ?? '')
  }, [variables, isDark])

  useEffect(() => writeJson(STORAGE_KEY, preferences), [preferences])

  const setPreferences = useCallback((patch: Partial<ThemePreferences>, origin?: TransitionOrigin) => {
    const apply = () => setState((prev) => ({ ...prev, ...patch }))
    if (!origin) {
      apply()
      return
    }
    withViewTransition(() => flushSync(apply), {
      rootClass: 'theme-transition',
      onReady: () => revealFrom(origin),
    })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ preferences, isDark, setPreferences }),
    [preferences, isDark, setPreferences],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
