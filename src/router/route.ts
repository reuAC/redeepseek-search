/** 应用的全部路由状态都编码在 URL 查询参数中，可分享、可前进后退 */
export interface Route {
  /** 搜索词（可含搜索语法）；为空时显示首页 */
  q: string
  /** 触发搜索的原始问题，对应 API 的 ori_question */
  ori: string
  /** 时间筛选：'' | d | w | m | y */
  time: string
  /** 语言筛选：'' | zh | en | zh,en */
  lang: string
  /** 结果排序（客户端）：'' 相关度 | date 最新 */
  sort: string
  /** 结果过滤（客户端）：'' | quality 优质 | authority 权威 */
  refine: string
}

export type Page = 'home' | 'results'

export const pageOf = (route: Route): Page => (route.q ? 'results' : 'home')

/** 路由字段与 URL 参数名的映射 */
const PARAMS: Record<keyof Route, string> = {
  q: 'q',
  ori: 'ori',
  time: 't',
  lang: 'lang',
  sort: 'sort',
  refine: 'refine',
}

export const EMPTY_ROUTE: Route = { q: '', ori: '', time: '', lang: '', sort: '', refine: '' }

export function parseRoute(search: string): Route {
  const params = new URLSearchParams(search)
  const route = { ...EMPTY_ROUTE }
  for (const key of Object.keys(PARAMS) as Array<keyof Route>) {
    route[key] = params.get(PARAMS[key])?.trim() ?? ''
  }
  return route
}

export function formatRoute(route: Route): string {
  const params = new URLSearchParams()
  for (const key of Object.keys(PARAMS) as Array<keyof Route>) {
    if (route[key]) params.set(PARAMS[key], route[key])
  }
  const search = params.toString()
  return search ? `?${search}` : window.location.pathname
}
