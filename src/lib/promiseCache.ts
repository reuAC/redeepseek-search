/**
 * 以 key 去重的 Promise 缓存：并发 / 重复的相同请求共享同一个 Promise，
 * 失败的请求会被移出缓存以便重试。
 */
export function createPromiseCache<T>(maxEntries = 100) {
  const cache = new Map<string, Promise<T>>()

  return {
    get(key: string, create: () => Promise<T>): Promise<T> {
      const hit = cache.get(key)
      if (hit) return hit

      const promise = create().catch((error: unknown) => {
        cache.delete(key)
        throw error
      })
      cache.set(key, promise)
      if (cache.size > maxEntries) cache.delete(cache.keys().next().value!)
      return promise
    },
  }
}
