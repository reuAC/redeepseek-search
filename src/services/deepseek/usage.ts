/** 计费口径（见文档“计费”）：仅 HTTP 200 且产生结果的请求计费 */
export type BillableApi = 'search' | 'fetch'

export const PRICE_PER_THOUSAND_CNY = 5

type Listener = (api: BillableApi) => void
const listeners = new Set<Listener>()

/** 订阅计费请求事件；服务层只负责通知，是否持久化由调用方决定 */
export function onBillableRequest(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function reportBillable(api: BillableApi): void {
  listeners.forEach((listener) => listener(api))
}
