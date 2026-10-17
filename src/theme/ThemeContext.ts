import { createContext, useContext } from 'react'
import type { ThemePreferences } from './preferences'

export interface TransitionOrigin {
  x: number
  y: number
}

export interface ThemeContextValue {
  preferences: ThemePreferences
  isDark: boolean
  /** origin 存在时以该点为圆心做圆形揭示过渡 */
  setPreferences: (patch: Partial<ThemePreferences>, origin?: TransitionOrigin) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
  return value
}
