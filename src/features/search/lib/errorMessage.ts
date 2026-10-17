import type { Messages } from '@/i18n'
import type { ApiError } from '@/services/deepseek'

/** 把接口错误转换为当前语言的标题文案 */
export function apiErrorMessage(m: Messages, error: ApiError): string {
  if (error.status === 0) return m.errors.network
  return m.errors.status[error.status] ?? m.errors.generic(error.status)
}
