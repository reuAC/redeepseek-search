import { useCallback, useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { readJson, writeJson } from '@/lib/storage'
import { browserLocale, isLocale, type Locale, type LocalePreference } from './locale'
import { I18nContext, type I18nContextValue } from './I18nContext'
import { en } from './locales/en'
import { jaJP } from './locales/ja-JP'
import { zhCN, type Messages } from './locales/zh-CN'
import { zhTW } from './locales/zh-TW'

const STORAGE_KEY = 'ds-search:locale'

const MESSAGES: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
  'ja-JP': jaJP,
}

function subscribeLanguages(onChange: () => void) {
  window.addEventListener('languagechange', onChange)
  return () => window.removeEventListener('languagechange', onChange)
}

function readPreference(): LocalePreference {
  const { preference } = readJson<{ preference: string }>(STORAGE_KEY, { preference: 'auto' })
  return isLocale(preference) ? preference : 'auto'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [preference, setState] = useState<LocalePreference>(readPreference)
  const detected = useSyncExternalStore(subscribeLanguages, browserLocale)
  const locale = preference === 'auto' ? detected : preference

  useLayoutEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setPreference = useCallback((next: LocalePreference) => {
    setState(next)
    writeJson(STORAGE_KEY, { preference: next })
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({ locale, preference, setPreference, m: MESSAGES[locale] }),
    [locale, preference, setPreference],
  )

  return <I18nContext value={value}>{children}</I18nContext>
}
