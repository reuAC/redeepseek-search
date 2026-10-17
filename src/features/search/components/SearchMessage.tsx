import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '@/ui'
import styles from './SearchMessage.module.css'

export interface SearchMessageProps {
  icon: IconName
  title: ReactNode
  tone?: 'neutral' | 'error'
  children?: ReactNode
  actions?: ReactNode
}

/** 结果区的状态卡片：未配置、无结果、出错 */
export function SearchMessage({ icon, title, tone = 'neutral', children, actions }: SearchMessageProps) {
  return (
    <section className={cx(styles.card, styles[tone])}>
      <span className={styles.iconWrap}>
        <Icon name={icon} size={28} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {children && <div className={styles.body}>{children}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  )
}
