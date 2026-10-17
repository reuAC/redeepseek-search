import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Tooltip.module.css'

export type TooltipPlacement = 'bottom' | 'bottomStart' | 'bottomEnd' | 'top'

export interface TooltipProps {
  label: ReactNode
  placement?: TooltipPlacement
  children: ReactNode
}

/** MD3 Plain tooltip：悬停 / 键盘聚焦后延迟出现。宿主元素需自行提供 aria-label。 */
export function Tooltip({ label, placement = 'bottom', children }: TooltipProps) {
  return (
    <span className={styles.host}>
      {children}
      <span aria-hidden="true" className={cx(styles.tooltip, styles[placement])}>
        {label}
      </span>
    </span>
  )
}
