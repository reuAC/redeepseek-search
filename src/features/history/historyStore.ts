import { readJsonArray, writeJson } from '@/lib/storage'

const STORAGE_KEY = 'ds-search:history'
const MAX_ITEMS = 20

type Listener = () => void

let items: readonly string[] = readJsonArray<unknown>(STORAGE_KEY).filter(
  (item): item is string => typeof item === 'string',
)
const listeners = new Set<Listener>()

function commit(next: readonly string[]) {
  items = next
  writeJson(STORAGE_KEY, items)
  listeners.forEach((listener) => listener())
}

/** 本地搜索历史（最近优先、去重），以外部 store 形式供多个组件共享 */
export const historyStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: () => items,
  add(query: string) {
    const q = query.trim()
    if (q) commit([q, ...items.filter((item) => item !== q)].slice(0, MAX_ITEMS))
  },
  remove(query: string) {
    commit(items.filter((item) => item !== query))
  },
  clear() {
    commit([])
  },
}
