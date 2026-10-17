import { useSyncExternalStore } from 'react'
import { useI18n } from '@/i18n'
import { Button } from '@/ui'
import { PRICE_PER_THOUSAND_CNY } from '@/services/deepseek'
import { usageStore } from './usageStore'
import styles from './UsageSummary.module.css'

/** 用量概览：搜索 / 抓取次数与估算费用 */
export function UsageSummary() {
  const usage = useSyncExternalStore(usageStore.subscribe, usageStore.getSnapshot)
  const { m, locale } = useI18n()
  const t = m.usage
  const since = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(usage.since))
  const cost = ((usage.search + usage.fetch) * PRICE_PER_THOUSAND_CNY) / 1000

  return (
    <div className={styles.usage}>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>{t.search}</dt>
          <dd>{usage.search.toLocaleString(locale)}</dd>
        </div>
        <div className={styles.stat}>
          <dt>{t.fetch}</dt>
          <dd>{usage.fetch.toLocaleString(locale)}</dd>
        </div>
        <div className={styles.stat}>
          <dt>{t.cost}</dt>
          <dd>¥{cost.toFixed(cost < 1 ? 3 : 2)}</dd>
        </div>
      </dl>
      <div className={styles.footer}>
        <span>
          {t.since(since)} · {t.note}
        </span>
        <Button variant="text" onClick={usageStore.reset}>
          {t.reset}
        </Button>
      </div>
    </div>
  )
}
