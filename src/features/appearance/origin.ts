import type { MouseEvent } from 'react'
import type { TransitionOrigin } from '@/theme'

/** 取点击位置作为过渡圆心；键盘触发（无指针坐标）时取元素中心 */
export function originOf(event: MouseEvent<HTMLElement>): TransitionOrigin {
  if (event.clientX || event.clientY) return { x: event.clientX, y: event.clientY }
  const rect = event.currentTarget.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}
