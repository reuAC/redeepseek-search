import { createContext, useContext } from 'react'
import type { Route } from './route'

export interface NavigateOptions {
  /** 替换当前历史记录而不是新增 */
  replace?: boolean
}

export interface RouterContextValue {
  route: Route
  navigate: (patch: Partial<Route>, options?: NavigateOptions) => void
}

export const RouterContext = createContext<RouterContextValue | null>(null)

export function useRouter(): RouterContextValue {
  const value = useContext(RouterContext)
  if (!value) throw new Error('useRouter 必须在 <RouterProvider> 内使用')
  return value
}
