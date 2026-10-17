import { lazy, Suspense, useState } from 'react'
import { cx } from '@/lib/cx'
import { useI18n } from '@/i18n'
import { Button, Icon, Skeleton } from '@/ui'
import { usePageContent } from '../hooks/usePageContent'
import { apiErrorMessage } from '../lib/errorMessage'
import styles from './PageContent.module.css'

// Markdown 渲染器体积较大，仅在抓取正文时按需加载
const MarkdownView = lazy(() => import('./MarkdownView').then((m) => ({ default: m.MarkdownView })))

function ContentSkeleton() {
  const { m } = useI18n()
  return (
    <div className={styles.contentCard} role="status" aria-label={m.content.fetching}>
      <Skeleton width="55%" height={20} shape="rounded" />
      <Skeleton />
      <Skeleton />
      <Skeleton width="75%" />
      <Skeleton />
      <Skeleton width="60%" />
    </div>
  )
}

export interface PageContentProps {
  url: string
  /** 挂载后立即抓取（独立阅读模式）；否则等待用户点击 */
  autoLoad?: boolean
}

/** 通过 Fetch 接口抓取网页并以 Markdown 渲染 */
export function PageContent({ url, autoLoad = false }: PageContentProps) {
  const page = usePageContent(url, autoLoad)
  const { m } = useI18n()

  switch (page.status) {
    case 'idle':
      return (
        <div className={styles.fetchPrompt}>
          <Button variant="tonal" icon="article" onClick={page.load}>
            {m.content.fetch}
          </Button>
          <span className={styles.hint}>{m.content.fetchHint}</span>
        </div>
      )
    case 'loading':
      return <ContentSkeleton />
    case 'error':
      return (
        <div className={styles.fetchError}>
          <Icon name="error" />
          <div>
            <p>{apiErrorMessage(m, page.error)}</p>
            {page.error.detail && <p className={styles.hint}>{page.error.detail}</p>}
          </div>
          {page.error.retryable && (
            <Button variant="text" icon="refresh" onClick={page.load}>
              {m.common.retry}
            </Button>
          )}
        </div>
      )
    case 'success':
      return (
        <Suspense fallback={<ContentSkeleton />}>
          <article className={cx(styles.contentCard, styles.reveal)}>
            {page.page.title && <h3 className={styles.pageTitle}>{page.page.title}</h3>}
            <MarkdownView>{page.page.content || m.content.empty}</MarkdownView>
          </article>
        </Suspense>
      )
  }
}

const COLLAPSE_THRESHOLD = 600

/** 搜索时随结果返回的正文（need_content），纯文本，较长时可展开 */
export function SearchContent({ text }: { text: string }) {
  const { m, locale } = useI18n()
  const long = text.length > COLLAPSE_THRESHOLD
  const [expanded, setExpanded] = useState(!long)

  return (
    <div className={cx(styles.contentCard, styles.reveal)}>
      <div className={styles.source}>
        <span>{m.content.fromSearch(text.length.toLocaleString(locale))}</span>
      </div>
      <p className={cx(styles.plain, !expanded && styles.collapsed)}>{text}</p>
      {long && (
        <Button
          variant="text"
          trailingIcon="expandMore"
          className={expanded ? styles.collapseButton : undefined}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? m.content.collapse : m.content.expand}
        </Button>
      )}
    </div>
  )
}
