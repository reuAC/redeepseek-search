import { useEffect, useState } from 'react'
import { useClientConfig } from '@/features/settings'
import { fetchPage, toApiError, type ApiError, type FetchResponse } from '@/services/deepseek'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; page: FetchResponse }
  | { status: 'error'; error: ApiError }

/**
 * 按需抓取网页正文：调用 load() 后才发起请求（Fetch 接口按次计费）；
 * autoLoad 为 true 时挂载即抓取。
 */
export function usePageContent(url: string, autoLoad = false) {
  const config = useClientConfig()
  const [attempt, setAttempt] = useState(autoLoad ? 1 : 0)
  const [result, setResult] = useState<{ attempt: number; state: State } | null>(null)

  useEffect(() => {
    if (attempt === 0) return
    let ignore = false
    fetchPage(config, url).then(
      (page) => !ignore && setResult({ attempt, state: { status: 'success', page } }),
      (error: unknown) =>
        !ignore && setResult({ attempt, state: { status: 'error', error: toApiError(error) } }),
    )
    return () => {
      ignore = true
    }
  }, [attempt, config, url])

  const state: State =
    attempt === 0 ? { status: 'idle' } : result?.attempt === attempt ? result.state : { status: 'loading' }

  return { ...state, load: () => setAttempt((n) => n + 1) }
}
