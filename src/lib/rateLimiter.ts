/**
 * 滑动窗口限流：任意 intervalMs 时间窗内最多启动 limit 个任务，超出的任务排队等待。
 */
export function createRateLimiter(limit: number, intervalMs = 1000) {
  const startedAt: number[] = []
  let chain: Promise<unknown> = Promise.resolve()

  const waitForSlot = async () => {
    for (;;) {
      const now = performance.now()
      while (startedAt.length && now - startedAt[0] >= intervalMs) startedAt.shift()
      if (startedAt.length < limit) {
        startedAt.push(now)
        return
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs - (now - startedAt[0])))
    }
  }

  return function schedule<T>(task: () => Promise<T>): Promise<T> {
    // 串行地分配名额，保证先到先得；任务本身并发执行
    const slot = chain.then(waitForSlot)
    chain = slot
    return slot.then(task)
  }
}
