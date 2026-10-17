import { useSyncExternalStore } from 'react'
import { historyStore } from './historyStore'

export function useSearchHistory() {
  const items = useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot)
  return { items, add: historyStore.add, remove: historyStore.remove, clear: historyStore.clear }
}
