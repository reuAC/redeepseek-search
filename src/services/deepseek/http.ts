import { ApiError } from './errors'
import type { ClientConfig } from './types'

interface ErrorBody {
  error?: { message?: string }
}

/** 文档建议：408 / 429 / 5xx 等待后重试；其它 4xx 不修改请求则不应重试 */
const RETRY_DELAYS_MS = [800, 2000]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get('Retry-After'))
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 10_000)
  return RETRY_DELAYS_MS[attempt]
}

async function send(config: ClientConfig, url: string, body: unknown): Promise<Response> {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (error) {
    throw new ApiError(0, error instanceof Error ? error.message : undefined)
  }
}

export async function postJson<T>(config: ClientConfig, path: string, body: unknown): Promise<T> {
  if (!config.apiKey) throw new ApiError(401)

  const url = config.baseUrl.replace(/\/+$/, '') + path
  for (let attempt = 0; ; attempt++) {
    const response = await send(config, url, body)
    const payload: unknown = await response.json().catch(() => null)
    if (response.ok) return payload as T

    const error = new ApiError(response.status, (payload as ErrorBody | null)?.error?.message)
    if (!error.retryable || attempt >= RETRY_DELAYS_MS.length) throw error
    await sleep(retryDelay(response, attempt))
  }
}
