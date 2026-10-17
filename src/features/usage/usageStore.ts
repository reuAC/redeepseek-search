import { readJson, writeJson } from '@/lib/storage'
import { onBillableRequest, type BillableApi } from '@/services/deepseek'

const STORAGE_KEY = 'ds-search:usage'

export interface Usage {
  search: number
  fetch: number
  /** 开始统计的时间（ISO） */
  since: string
}

const fresh = (): Usage => ({ search: 0, fetch: 0, since: new Date().toISOString() })

let usage: Usage = readJson(STORAGE_KEY, fresh())
const listeners = new Set<() => void>()

function commit(next: Usage) {
  usage = next
  writeJson(STORAGE_KEY, usage)
  listeners.forEach((listener) => listener())
}

/** 本浏览器内的计费请求累计（仅为估算，以 DeepSeek 平台账单为准） */
export const usageStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: () => usage,
  record(api: BillableApi) {
    commit({ ...usage, [api]: usage[api] + 1 })
  },
  reset() {
    commit(fresh())
  },
}

/** 开始监听服务层的计费事件；返回取消函数 */
export function startUsageTracking(): () => void {
  return onBillableRequest(usageStore.record)
}
