import { useEffect, useState } from 'react'
import { useClientConfig, useSettings } from '@/features/settings'
import { search, toApiError, type ApiError, type SearchResult } from '@/services/deepseek'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

interface Entry {
  key: string
  query: string
  results?: SearchResult[]
  elapsed?: number
  error?: ApiError
}

export interface SearchState {
  status: SearchStatus
  /** 请求进行中时保留同一 query 的上一次结果（如“更多结果”），避免闪烁 */
  results?: SearchResult[]
  elapsed?: number
  error?: ApiError
  retry: () => void
}

/**
 * 订阅一次搜索：query 为空或未配置 API Key 时不发起请求。
 * question 对应 ori_question；need_content / localization 取自设置。
 */
export function useSearch(query: string, count: number, question = ''): SearchState {
  const config = useClientConfig()
  const { needContent, localization } = useSettings().settings
  const [attempt, setAttempt] = useState(0)
  const [entry, setEntry] = useState<Entry | null>(null)

  const key =
    config.apiKey && query
      ? JSON.stringify([query, count, question, needContent, localization, attempt, config])
      : null

  useEffect(() => {
    if (!key) return
    let ignore = false
    search(config, {
      query,
      count,
      ori_question: question,
      need_content: needContent,
      localization,
    }).then(
      ({ data, elapsed }) => !ignore && setEntry({ key, query, results: data, elapsed }),
      (error: unknown) => !ignore && setEntry({ key, query, error: toApiError(error) }),
    )
    return () => {
      ignore = true
    }
  }, [key, config, query, count, question, needContent, localization])

  const retry = () => setAttempt((n) => n + 1)
  if (!key) return { status: 'idle', retry }

  const current = entry?.key === key ? entry : null
  if (current) {
    return current.error
      ? { status: 'error', error: current.error, retry }
      : { status: 'success', results: current.results, elapsed: current.elapsed, retry }
  }
  const previous = entry?.query === query ? entry.results : undefined
  return { status: 'loading', results: previous, retry }
}
