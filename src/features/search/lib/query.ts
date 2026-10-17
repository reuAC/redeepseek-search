const DAY_MS = 86_400_000

const TIME_RANGES: Record<string, number> = { d: 1, w: 7, m: 30, y: 365 }

/** 把筛选条件转换为 DeepSeek 搜索语法拼接进 query */
export function buildQuery(q: string, time: string, lang: string, now = Date.now()): string {
  const parts = [q.trim()]
  const days = TIME_RANGES[time]
  if (days) parts.push(`after:${new Date(now - days * DAY_MS).toISOString().slice(0, 10)}`)
  if (lang) parts.push(`lang:${lang}`)
  return parts.join(' ')
}

const OPERATOR = /^(site|lang|after|before):/i

/** 提取用于高亮的正向关键词：去掉 site: 等操作符、排除词与 OR */
export function extractTerms(q: string): string[] {
  const terms: string[] = []
  for (const match of q.matchAll(/-?"([^"]+)"|(\S+)/g)) {
    if (match[0].startsWith('-')) continue
    const term = match[1] ?? match[2]
    if (term && term !== 'OR' && !OPERATOR.test(term)) terms.push(term)
  }
  return terms
}

/* ---------- 高级搜索：表单字段 ⇄ 搜索语法 ---------- */

export interface AdvancedQuery {
  /** 包含全部字词 */
  allWords: string
  /** 完全匹配的短语 → "..." */
  exactPhrase: string
  /** 不包含的字词或 "短语" → -词 / -"短语" */
  excludeWords: string
  /** 限定站点，空格分隔 → site:a OR site:b */
  sites: string
  /** 排除站点，空格分隔 → -site:a */
  excludeSites: string
  /** → lang:zh,en */
  lang: string
  /** YYYY-MM-DD → after: */
  after: string
  /** YYYY-MM-DD → before: */
  before: string
}

export const EMPTY_ADVANCED: AdvancedQuery = {
  allWords: '',
  exactPhrase: '',
  excludeWords: '',
  sites: '',
  excludeSites: '',
  lang: '',
  after: '',
  before: '',
}

const words = (s: string) => s.match(/"[^"]+"|[^\s,，]+/g) ?? []

export function composeQuery(a: AdvancedQuery): string {
  const parts: string[] = []
  if (a.allWords.trim()) parts.push(a.allWords.trim())
  const phrase = a.exactPhrase.replace(/"/g, '').trim()
  if (phrase) parts.push(`"${phrase}"`)
  for (const w of words(a.excludeWords)) parts.push(`-${w}`)
  const sites = words(a.sites).map((s) => `site:${s}`)
  if (sites.length) parts.push(sites.join(' OR '))
  for (const s of words(a.excludeSites)) parts.push(`-site:${s}`)
  if (a.lang) parts.push(`lang:${a.lang}`)
  if (a.after) parts.push(`after:${a.after}`)
  if (a.before) parts.push(`before:${a.before}`)
  return parts.join(' ')
}

/** composeQuery 的逆过程，用于以当前搜索词预填高级搜索表单 */
export function parseQuery(q: string): AdvancedQuery {
  const result = { ...EMPTY_ADVANCED }
  const all: string[] = []
  const exclude: string[] = []
  const sites: string[] = []
  const excludeSites: string[] = []
  let previousWasSite = false

  for (const [token] of q.matchAll(/-?\w+:\S+|-?"[^"]*"|\S+/g)) {
    const negative = token.startsWith('-') && token.length > 1
    const body = negative ? token.slice(1) : token
    const operator = /^(site|lang|after|before):(.+)$/i.exec(body)
    const isSite = operator?.[1].toLowerCase() === 'site'

    if (token === 'OR' && previousWasSite) continue
    previousWasSite = isSite

    if (operator) {
      const [, name, value] = operator
      const key = name.toLowerCase()
      if (key === 'site') (negative ? excludeSites : sites).push(value)
      else if (!negative && key === 'lang') result.lang = value
      else if (!negative && (key === 'after' || key === 'before')) result[key] = value
      else all.push(token)
    } else if (negative) {
      exclude.push(body)
    } else if (/^"[^"]*"$/.test(token) && !result.exactPhrase) {
      result.exactPhrase = token.slice(1, -1)
    } else {
      all.push(token)
    }
  }

  result.allWords = all.join(' ')
  result.excludeWords = exclude.join(' ')
  result.sites = sites.join(' ')
  result.excludeSites = excludeSites.join(' ')
  return result
}

/* ---------- 结果的客户端排序 / 过滤（基于响应中的 date、rerank_score、authority） ---------- */

/** 文档：rerank_score >= 1.5 为优质结果；authority >= 3 为极权威结果 */
export const QUALITY_SCORE = 1.5
export const AUTHORITY_LEVEL = 3

export function refineResults<T extends { rerank_score: number; authority: number; date: string | null }>(
  results: readonly T[],
  refine: string,
  sort: string,
): T[] {
  let list = results.filter((r) => {
    if (refine === 'quality') return r.rerank_score >= QUALITY_SCORE
    if (refine === 'authority') return r.authority >= AUTHORITY_LEVEL
    return true
  })
  if (sort === 'date') {
    const time = (r: T) => (r.date ? new Date(r.date).getTime() || 0 : 0)
    list = [...list].sort((a, b) => time(b) - time(a))
  }
  return list
}
