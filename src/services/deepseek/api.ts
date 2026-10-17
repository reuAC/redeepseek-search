import { createPromiseCache } from '@/lib/promiseCache'
import { createRateLimiter } from '@/lib/rateLimiter'
import { postJson } from './http'
import { reportBillable } from './usage'
import type {
  ClientConfig,
  FetchResponse,
  SearchRequest,
  SearchResponse,
  SearchResult,
  TimedResult,
} from './types'

export const MAX_QUERY_LENGTH = 128
export const MAX_QUESTION_LENGTH = 128
export const MAX_RESULT_COUNT = 50
/** 文档“限速”：每个账号 Search、Fetch 各自 5 QPS */
const QPS_LIMIT = 5

const searchCache = createPromiseCache<TimedResult<SearchResult[]>>()
const fetchCache = createPromiseCache<FetchResponse>()
const searchLimiter = createRateLimiter(QPS_LIMIT)
const fetchLimiter = createRateLimiter(QPS_LIMIT)

const cacheKey = (config: ClientConfig, ...parts: unknown[]) =>
  JSON.stringify([config.baseUrl, config.apiKey, ...parts])

/** 去掉空的可选字段：ori_question 要求 1～128 个字符，空字符串会被视为非法 */
function normalizeRequest({
  query,
  count,
  ori_question,
  localization,
  need_content,
}: SearchRequest): SearchRequest {
  return {
    query: query.trim(),
    ...(count !== undefined && { count }),
    ...(ori_question?.trim() && { ori_question: ori_question.trim().slice(0, MAX_QUESTION_LENGTH) }),
    ...(localization?.trim() && { localization: localization.trim() }),
    ...(need_content && { need_content: true }),
  }
}

/**
 * 网页搜索。按次计费，因此同一会话内相同请求会复用结果。
 * @see https://api-docs.deepseek.com/zh-cn/guides/search
 */
export function search(config: ClientConfig, request: SearchRequest): Promise<TimedResult<SearchResult[]>> {
  const body = normalizeRequest(request)
  return searchCache.get(cacheKey(config, body), () =>
    searchLimiter(async () => {
      const started = performance.now()
      const response = await postJson<SearchResponse>(config, '/v1/tools/search', body)
      const data = response?.results ?? []
      if (data.length) reportBillable('search')
      return { data, elapsed: (performance.now() - started) / 1000 }
    }),
  )
}

/** 抓取单个网页，返回 Markdown 正文 */
export function fetchPage(config: ClientConfig, url: string): Promise<FetchResponse> {
  return fetchCache.get(cacheKey(config, url), () =>
    fetchLimiter(async () => {
      const page = await postJson<FetchResponse>(config, '/v1/tools/fetch', { url })
      if (page?.content) reportBillable('fetch')
      return page
    }),
  )
}

/** 判断输入是否为可抓取的网址（http / https，含主机名） */
export function isFetchableUrl(input: string): boolean {
  try {
    const url = new URL(input.trim())
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname) && !url.username
  } catch {
    return false
  }
}
