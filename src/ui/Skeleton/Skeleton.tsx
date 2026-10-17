import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  shape?: 'text' | 'rounded' | 'circle'
  className?: string
}

/** 占位骨架，带流动渐变 */
export function Skeleton({ width = '100%', height = 14, shape = 'text', className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.skeleton, styles[shape], className)}
      style={{ width, height }}
    />
  )
}
