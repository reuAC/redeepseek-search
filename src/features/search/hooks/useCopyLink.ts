import { useCallback } from 'react'
import { useI18n } from '@/i18n'
import { useSnackbar } from '@/ui'

/** 复制链接到剪贴板并以 snackbar 反馈结果 */
export function useCopyLink() {
  const showSnackbar = useSnackbar()
  const { m } = useI18n()
  return useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url)
        showSnackbar(m.common.linkCopied)
      } catch {
        showSnackbar(m.common.copyFailed)
      }
    },
    [showSnackbar, m],
  )
}
