import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

/**
 * 让元素在 open 变为 false 后继续挂载 exitMs 毫秒，以便播放退场动画。
 * @returns mounted 是否需要渲染；exiting 是否处于退场阶段
 */
export function usePresence(open: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    if (open || !mounted) return
    const timer = setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : exitMs)
    return () => clearTimeout(timer)
  }, [open, mounted, exitMs])

  return { mounted: open || mounted, exiting: mounted && !open }
}
