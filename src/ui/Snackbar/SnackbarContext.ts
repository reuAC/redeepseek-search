import { createContext, useContext } from 'react'

export interface SnackbarOptions {
  action?: { label: string; onClick: () => void }
  /** 毫秒，默认 4000 */
  duration?: number
}

export type ShowSnackbar = (message: string, options?: SnackbarOptions) => void

export const SnackbarContext = createContext<ShowSnackbar | null>(null)

export function useSnackbar(): ShowSnackbar {
  const show = useContext(SnackbarContext)
  if (!show) throw new Error('useSnackbar 必须在 <SnackbarProvider> 内使用')
  return show
}
