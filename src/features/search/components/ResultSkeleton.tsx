import type { CSSProperties } from 'react'
import { useI18n } from '@/i18n'
import { Skeleton } from '@/ui'
import styles from './ResultSkeleton.module.css'

const TITLE_WIDTHS = ['62%', '48%', '71%', '55%', '66%']

export function ResultSkeleton({ count = 5 }: { count?: number }) {
  const { m } = useI18n()
  return (
    <div className={styles.list} role="status" aria-label={m.results.searching}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.item} style={{ '--_index': i } as CSSProperties}>
          <div className={styles.head}>
            <Skeleton shape="circle" width={28} height={28} />
            <div className={styles.site}>
              <Skeleton width={96} height={12} />
              <Skeleton width={220} height={10} />
            </div>
          </div>
          <Skeleton width={TITLE_WIDTHS[i % TITLE_WIDTHS.length]} height={22} shape="rounded" />
          <Skeleton height={13} />
          <Skeleton width="84%" height={13} />
        </div>
      ))}
    </div>
  )
}
