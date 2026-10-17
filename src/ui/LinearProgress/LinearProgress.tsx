import { cx } from '@/lib/cx'
import styles from './LinearProgress.module.css'

export interface LinearProgressProps {
  /** 是否可见；隐藏时淡出而非立即消失 */
  active: boolean
  /** 无障碍名称 */
  label: string
  className?: string
}

/** MD3 Linear progress indicator（不确定进度） */
export function LinearProgress({ active, label, className }: LinearProgressProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-hidden={!active}
      className={cx(styles.progress, active && styles.active, className)}
    >
      <span className={cx(styles.bar, styles.primary)} />
      <span className={cx(styles.bar, styles.secondary)} />
    </div>
  )
}
