export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export interface ViewTransitionOptions {
  /** 过渡期间加在 <html> 上的类名，用于定制该次过渡的 CSS */
  rootClass?: string
  /** 新旧快照就绪后回调，可在此对伪元素做自定义动画 */
  onReady?: () => void
}

/**
 * 在 View Transition 中执行 DOM 更新；浏览器不支持或用户偏好减少动效时直接执行。
 * update 内应同步提交 React 更新（配合 flushSync）。
 */
export function withViewTransition(update: () => void, { rootClass, onReady }: ViewTransitionOptions = {}) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  if (rootClass) root.classList.add(rootClass)
  const transition = document.startViewTransition(update)

  // 连续触发时上一个过渡会被跳过，ready 随之 reject——这是预期行为，无需上报
  transition.ready.then(onReady, () => {})
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (rootClass) root.classList.remove(rootClass)
    })
}
