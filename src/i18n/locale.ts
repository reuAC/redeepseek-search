export const LOCALES = ['zh-CN', 'zh-TW', 'en', 'ja-JP'] as const

export type Locale = (typeof LOCALES)[number]

/** auto 表示跟随浏览器语言 */
export type LocalePreference = Locale | 'auto'

/** 各语言的自称，用于语言切换菜单 */
export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  'ja-JP': '日本語',
}

export const FALLBACK_LOCALE: Locale = 'en'

/** 按浏览器偏好语言列表依次匹配；繁体中文地区与 Hant 脚本归入 zh-TW */
export function matchLocale(tags: readonly string[]): Locale {
  for (const raw of tags) {
    const tag = raw.toLowerCase()
    if (tag.startsWith('zh')) return /hant|-tw|-hk|-mo/.test(tag) ? 'zh-TW' : 'zh-CN'
    if (tag.startsWith('ja')) return 'ja-JP'
    if (tag.startsWith('en')) return 'en'
  }
  return FALLBACK_LOCALE
}

export function browserLocale(): Locale {
  if (typeof navigator === 'undefined') return FALLBACK_LOCALE
  return matchLocale(navigator.languages?.length ? navigator.languages : [navigator.language])
}

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}
