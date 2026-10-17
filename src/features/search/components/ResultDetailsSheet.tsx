import type { ReactNode } from 'react'
import { useI18n } from '@/i18n'
import { Button, Icon, SideSheet, type IconName } from '@/ui'
import type { SearchResult } from '@/services/deepseek'
import { formatDate, formatRelativeDate, siteNameOf } from '../lib/format'
import { AUTHORITY_LEVEL, QUALITY_SCORE } from '../lib/query'
import { useCopyLink } from '../hooks/useCopyLink'
import { Favicon } from './Favicon'
import { PageContent, SearchContent } from './PageContent'
import styles from './ResultDetailsSheet.module.css'

/** 近期显示“3 天前 · 2026年10月14日”，较早的只显示日期 */
function describeDate(iso: string, locale: string): string {
  const relative = formatRelativeDate(iso, locale)
  const absolute = formatDate(iso, locale)
  return relative === absolute ? absolute : `${relative} · ${absolute}`
}

function Meter({ value, max }: { value: number; max: number }) {
  return (
    <span className={styles.meter} aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? styles.meterOn : undefined} />
      ))}
    </span>
  )
}

function MetaRow({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <li className={styles.metaRow}>
      <Icon name={icon} className={styles.metaIcon} />
      <div className={styles.metaText}>
        <span className={styles.metaLabel}>{label}</span>
        <span className={styles.metaValue}>{children}</span>
      </div>
    </li>
  )
}

function ResultDetails({ result }: { result: SearchResult }) {
  const { m, locale } = useI18n()
  const t = m.details
  const name = siteNameOf(result)
  const authority = result.authority
  const score = result.rerank_score

  return (
    <div className={styles.details}>
      <div className={styles.source}>
        <Favicon src={result.site_icon} name={name} size="large" />
        <div className={styles.sourceText}>
          <span className={styles.siteName}>{name}</span>
          <a className={styles.url} href={result.url} target="_blank" rel="noreferrer">
            {result.url}
          </a>
        </div>
      </div>

      <h3 className={styles.title}>{result.title}</h3>

      <ul className={styles.meta}>
        <MetaRow icon="calendar" label={t.published}>
          {result.date ? describeDate(result.date, locale) : m.common.unknown}
        </MetaRow>
        <MetaRow icon="shield" label={t.authority}>
          {authority >= 0 ? (
            <>
              <Meter value={authority} max={4} />
              {authority} / 4 · {t.authorityLevels[authority]}
              {authority >= AUTHORITY_LEVEL && <span className={styles.badge}>{t.veryAuthoritative}</span>}
            </>
          ) : (
            m.common.unknown
          )}
        </MetaRow>
        <MetaRow icon="trending" label={t.score}>
          {typeof score === 'number' ? (
            <>
              {score.toFixed(2)} / 3
              {score >= QUALITY_SCORE && <span className={styles.badge}>{t.quality}</span>}
            </>
          ) : (
            m.common.unknown
          )}
        </MetaRow>
      </ul>

      {result.summary && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>{t.summary}</h4>
          <p className={styles.summary}>{result.summary}</p>
        </section>
      )}

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>{t.content}</h4>
        {/* 开启 need_content 时正文已随搜索返回，无需再调用 Fetch */}
        {result.content ? <SearchContent text={result.content} /> : <PageContent url={result.url} />}
      </section>
    </div>
  )
}

export interface ResultDetailsSheetProps {
  result: SearchResult | null
  open: boolean
  onClose: () => void
}

/** “关于此结果”侧边面板：元数据、长摘要，以及按需抓取的网页正文 */
export function ResultDetailsSheet({ result, open, onClose }: ResultDetailsSheetProps) {
  const copyLink = useCopyLink()
  const { m } = useI18n()

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      headline={m.details.title}
      actions={
        result && (
          <>
            <Button variant="filled" icon="openInNew" href={result.url} target="_blank" rel="noreferrer">
              {m.details.openPage}
            </Button>
            <Button variant="outlined" icon="copy" onClick={() => copyLink(result.url)}>
              {m.common.copyLink}
            </Button>
          </>
        )
      }
    >
      {result && <ResultDetails key={result.url} result={result} />}
    </SideSheet>
  )
}
