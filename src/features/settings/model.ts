export const PROXY_BASE_URL = '/deepseek-api'
export const DIRECT_BASE_URL = 'https://api.deepseek.com'

/**
 * 本地代理只存在于 Vite 开发 / 预览服务器中；静态部署（如 GitHub Pages）没有代理，
 * 只能直连（DeepSeek 接口支持浏览器跨域请求）。
 */
export const PROXY_AVAILABLE = import.meta.env.DEV

export interface ApiSettings {
  apiKey: string
  baseUrl: string
  /** 每次搜索返回的结果数，1～50 */
  count: number
  /** 对应 need_content：搜索时一并返回网页正文（不额外计费），详情面板可直接阅读 */
  needContent: boolean
  /** 对应 localization：用于优先返回本地化结果的 IP 地址，留空则不传 */
  localization: string
}

export const DEFAULT_SETTINGS: ApiSettings = {
  apiKey: '',
  baseUrl: PROXY_AVAILABLE ? PROXY_BASE_URL : DIRECT_BASE_URL,
  count: 10,
  needContent: false,
  localization: '',
}

export type EndpointMode = 'proxy' | 'direct' | 'custom'

export function endpointModeOf(baseUrl: string): EndpointMode {
  if (baseUrl === PROXY_BASE_URL) return 'proxy'
  if (baseUrl === DIRECT_BASE_URL) return 'direct'
  return 'custom'
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
const IPV6 = /^[0-9a-f:]+$/i

/** 宽松校验 IPv4 / IPv6，空字符串视为合法（表示不传） */
export function isValidIp(value: string): boolean {
  const v = value.trim()
  return !v || IPV4.test(v) || (v.includes(':') && IPV6.test(v))
}

export function normalizeSettings(input: ApiSettings): ApiSettings {
  const count = Math.round(Number(input.count))
  const localization = input.localization.trim()
  const baseUrl = input.baseUrl.trim()
  return {
    apiKey: input.apiKey.trim(),
    baseUrl:
      !baseUrl || (baseUrl === PROXY_BASE_URL && !PROXY_AVAILABLE) ? DEFAULT_SETTINGS.baseUrl : baseUrl,
    count: Number.isFinite(count) ? Math.min(50, Math.max(1, count)) : DEFAULT_SETTINGS.count,
    needContent: Boolean(input.needContent),
    localization: isValidIp(localization) ? localization : '',
  }
}
