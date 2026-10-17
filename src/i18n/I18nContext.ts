import { createContext, useContext } from 'react'
import type { Locale, LocalePreference } from './locale'
import type { Messages } from './locales/zh-CN'

export interface I18nContextValue {
  /** 当前生效的语言 */
  locale: Locale
  /** 用户选择；auto 表示跟随浏览器 */
  preference: LocalePreference
  setPreference: (preference: LocalePreference) => void
  /** 当前语言的文案 */
  m: Messages
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used within <I18nProvider>')
  return value
}
