import { createContext, useContext, useMemo } from 'react'
import type { ClientConfig } from '@/services/deepseek'
import type { ApiSettings } from './model'

export interface SettingsContextValue {
  settings: ApiSettings
  saveSettings: (next: ApiSettings) => void
  openSettings: () => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings 必须在 <SettingsProvider> 内使用')
  return value
}

/** 供服务层调用的连接配置；引用稳定，仅在 key / 地址变化时更新 */
export function useClientConfig(): ClientConfig {
  const { apiKey, baseUrl } = useSettings().settings
  return useMemo(() => ({ apiKey, baseUrl }), [apiKey, baseUrl])
}
