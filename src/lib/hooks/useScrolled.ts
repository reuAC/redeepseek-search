import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  return () => window.removeEventListener('scroll', onChange)
}

/** 页面是否已滚动超过阈值（用于顶部应用栏的 on-scroll 状态） */
export function useScrolled(threshold = 4): boolean {
  return useSyncExternalStore(subscribe, () => window.scrollY > threshold)
}
