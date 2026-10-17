import { useCallback, useEffect, useState } from 'react'
import { EMPTY_ROUTE, useRouter } from '@/router'
import { useSearchHistory } from '@/features/history'
import { useClientConfig, useSettings } from '@/features/settings'
import { search } from '@/services/deepseek'

/** 页面无关的搜索动作：提交搜索、“手气不错” */
export function useSearchActions() {
  const { navigate } = useRouter()
  const { add: remember } = useSearchHistory()
  const { openSettings } = useSettings()
  const config = useClientConfig()
  const [luckyPending, setLuckyPending] = useState(false)

  // 跳转后用户返回时，页面可能从往返缓存（bfcache）恢复、或标签页重新可见，
  // 此时要撤销“正在跳转”状态，否则按钮会一直停留在跳转中
  useEffect(() => {
    if (!luckyPending) return
    const reset = () => {
      if (document.visibilityState === 'visible') setLuckyPending(false)
    }
    window.addEventListener('pageshow', reset)
    document.addEventListener('visibilitychange', reset)
    return () => {
      window.removeEventListener('pageshow', reset)
      document.removeEventListener('visibilitychange', reset)
    }
  }, [luckyPending])

  /**
   * keepFilters：在结果页内换词时保留时间 / 语言 / 排序等筛选；
   * question：原始问题（ori_question），换词时默认清除
   */
  const submit = useCallback(
    (query: string, { keepFilters = false, question = '' } = {}) => {
      remember(query)
      navigate(keepFilters ? { q: query, ori: question } : { ...EMPTY_ROUTE, q: query, ori: question })
    },
    [navigate, remember],
  )

  /** 直接跳转到第一条结果；失败或无结果时退回结果页 */
  const lucky = useCallback(
    async (query: string) => {
      if (!config.apiKey) {
        openSettings()
        return
      }
      remember(query)
      setLuckyPending(true)
      try {
        const { data } = await search(config, { query, count: 1 })
        if (data[0]?.url) {
          window.location.assign(data[0].url)
          return
        }
      } catch {
        // 由结果页展示错误
      }
      setLuckyPending(false)
      navigate({ ...EMPTY_ROUTE, q: query })
    },
    [config, navigate, openSettings, remember],
  )

  return { submit, lucky, luckyPending }
}
