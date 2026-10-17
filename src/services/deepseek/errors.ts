/**
 * DeepSeek 接口错误。只携带状态码与服务端原始信息，面向用户的文案由界面层按状态码本地化。
 * status 为 0 表示网络层失败（断网、CORS 等）。
 */
export class ApiError extends Error {
  readonly status: number
  readonly detail?: string

  constructor(status: number, detail?: string) {
    super(status === 0 ? 'Network request failed' : `DeepSeek API error (HTTP ${status})`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail || undefined
  }

  /** 文档约定：408 / 429 / 5xx 及网络错误可等待后重试 */
  get retryable(): boolean {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500
  }

  /** 需要用户检查 API 配置的错误 */
  get needsConfiguration(): boolean {
    return this.status === 401 || this.status === 402
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError(0, error instanceof Error ? error.message : String(error))
}
