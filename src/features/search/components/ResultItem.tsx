import type { CSSProperties } from 'react'
import { useI18n } from '@/i18n'
import { Icon, IconButton, Tooltip } from '@/ui'
import type { SearchResult } from '@/services/deepseek'
import { breadcrumb, formatDate, siteNameOf } from '../lib/format'
import { Favicon } from './Favicon'
import { Highlight } from './Highlight'
import styles from './ResultItem.module.css'

export interface ResultItemProps {
  result: SearchResult
  terms: readonly string[]
  /** 列表中的序号，用于错峰入场动画 */
  index: number
  onShowDetails: (result: SearchResult) => void
}

export function ResultItem({ result, terms, index, onShowDetails }: ResultItemProps) {
  const { m, locale } = useI18n()
  const name = siteNameOf(result)
  const date = formatDate(result.date, locale)

  return (
    <article className={styles.result} style={{ '--_index': index } as CSSProperties}>
      <header className={styles.head}>
        <a className={styles.source} href={result.url} target="_blank" rel="noreferrer" tabIndex={-1}>
          <Favicon src={result.site_icon} name={name} />
          <span className={styles.site}>
            <span className={styles.siteName}>
              {name}
              {result.authority >= 3 && (
                <Tooltip label={m.results.authoritative} placement="top">
                  <Icon name="verified" size={14} className={styles.verified} />
                  <span className="visually-hidden">{m.results.authoritative}</span>
                </Tooltip>
              )}
            </span>
            <cite className={styles.cite}>{breadcrumb(result.url)}</cite>
          </span>
        </a>
        <IconButton
          icon="moreVert"
          label={m.results.aboutResult}
          size="small"
          className={styles.more}
          onClick={() => onShowDetails(result)}
        />
      </header>

      <a className={styles.titleLink} href={result.url} target="_blank" rel="noreferrer">
        <h3 className={styles.title}>
          <Highlight text={result.title || result.url} terms={terms} className={styles.titleMark} />
        </h3>
      </a>

      <p className={styles.snippet}>
        {date && <span className={styles.date}>{date} — </span>}
        <Highlight text={result.snippet || result.summary} terms={terms} className={styles.mark} />
      </p>
    </article>
  )
}
