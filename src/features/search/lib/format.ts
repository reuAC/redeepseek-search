import type { SearchResult } from '@/services/deepseek'

function parseUrl(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/** 形如 https://web.dev › testing › get-started 的面包屑 */
export function breadcrumb(url: string, maxSegments = 3): string {
  const parsed = parseUrl(url)
  if (!parsed) return url
  const segments = parsed.pathname.split('/').filter(Boolean).map(safeDecode)
  const shown = segments.slice(0, maxSegments).map((s) => (s.length > 24 ? `${s.slice(0, 22)}…` : s))
  if (segments.length > maxSegments) shown.push('...')
  return [`${parsed.protocol}//${parsed.host}`, ...shown].join(' › ')
}

export function siteNameOf(result: SearchResult): string {
  return result.site_name || parseUrl(result.url)?.hostname.replace(/^www\./, '') || result.url
}

export function formatDate(iso: string | null, locale: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
}

/** 近 30 天内显示相对时间，否则显示日期 */
export function formatRelativeDate(iso: string | null, locale: string, now = Date.now()): string {
  if (!iso) return ''
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ''
  const days = Math.round((time - now) / 86_400_000)
  return days > -30 && days <= 0
    ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day')
    : formatDate(iso, locale)
}
