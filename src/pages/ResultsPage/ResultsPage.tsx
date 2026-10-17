import { useMemo, useState } from 'react'
import { cx } from '@/lib/cx'
import { useScrolled } from '@/lib/hooks/useScrolled'
import { Logo } from '@/components/Logo/Logo'
import { ThemeToggleButton } from '@/features/appearance'
import { useSearchHistory } from '@/features/history'
import {
  AdvancedSearchDialog,
  apiErrorMessage,
  PageReaderSheet,
  ResultDetailsSheet,
  ResultList,
  ResultSkeleton,
  SearchBar,
  SearchFilters,
  SearchMessage,
  buildQuery,
  extractTerms,
  refineResults,
  useSearch,
  useSearchActions,
} from '@/features/search'
import { useSettings } from '@/features/settings'
import { useI18n } from '@/i18n'
import { EMPTY_ROUTE, useRouter } from '@/router'
import { MAX_QUERY_LENGTH, MAX_RESULT_COUNT, isFetchableUrl, type SearchResult } from '@/services/deepseek'
import { Button, Chip, Icon, IconButton, LinearProgress } from '@/ui'
import styles from './ResultsPage.module.css'

export function ResultsPage() {
  const { route, navigate } = useRouter()
  const { settings, openSettings } = useSettings()
  const { submit } = useSearchActions()
  const history = useSearchHistory()
  const scrolled = useScrolled()
  const { m } = useI18n()
  const t = m.results

  const query = buildQuery(route.q, route.time, route.lang)
  const tooLong = query.length > MAX_QUERY_LENGTH
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null)
  const count = expandedQuery === query ? MAX_RESULT_COUNT : settings.count
  const search = useSearch(tooLong ? '' : query, count, route.ori)
  const terms = useMemo(() => extractTerms(route.q), [route.q])
  const isUrl = isFetchableUrl(route.q)

  const [details, setDetails] = useState<SearchResult | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [readerOpen, setReaderOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const showDetails = (result: SearchResult) => {
    setDetails(result)
    setDetailsOpen(true)
  }

  const loading = search.status === 'loading'
  const { results } = search
  const visible = useMemo(
    () => (results ? refineResults(results, route.refine, route.sort) : undefined),
    [results, route.refine, route.sort],
  )
  const hasServerFilters = Boolean(route.time || route.lang)
  const canLoadMore =
    search.status === 'success' && !!results && results.length >= count && count < MAX_RESULT_COUNT

  const renderBody = () => {
    if (!settings.apiKey) {
      return (
        <SearchMessage
          icon="key"
          title={t.needKeyTitle}
          actions={
            <Button icon="settings" onClick={openSettings}>
              {m.common.openSettings}
            </Button>
          }
        >
          {t.needKeyBody(route.q)}
        </SearchMessage>
      )
    }
    if (tooLong) {
      return (
        <SearchMessage icon="error" tone="error" title={t.tooLongTitle}>
          {t.tooLongBody(MAX_QUERY_LENGTH, query.length)}
        </SearchMessage>
      )
    }
    if (search.status === 'error' && search.error) {
      const { error } = search
      return (
        <SearchMessage
          icon="error"
          tone="error"
          title={apiErrorMessage(m, error)}
          actions={
            <>
              {error.retryable && (
                <Button icon="refresh" onClick={search.retry}>
                  {m.common.retry}
                </Button>
              )}
              {error.needsConfiguration && (
                <Button variant="tonal" icon="settings" onClick={openSettings}>
                  {t.checkSettings}
                </Button>
              )}
            </>
          }
        >
          {error.detail && <p>{error.detail}</p>}
          {error.status === 0 && <p>{t.networkHint}</p>}
          {error.retryable && error.status !== 0 && <p>{t.retriedHint}</p>}
        </SearchMessage>
      )
    }
    if (!results || !visible) return <ResultSkeleton />

    if (results.length === 0) {
      return (
        <SearchMessage
          icon="search"
          title={t.noResultsTitle}
          actions={
            hasServerFilters && (
              <Button variant="tonal" icon="close" onClick={() => navigate({ time: '', lang: '' })}>
                {t.clearServerFilters}
              </Button>
            )
          }
        >
          <p>{t.noResultsBody(route.q)}</p>
          <ul>
            <li>{t.tipSpelling}</li>
            <li>{t.tipOtherWords}</li>
            {hasServerFilters && <li>{t.tipRelax}</li>}
          </ul>
        </SearchMessage>
      )
    }

    if (visible.length === 0) {
      return (
        <SearchMessage
          icon="tune"
          title={t.noRefinedTitle}
          actions={
            <Button variant="tonal" icon="close" onClick={() => navigate({ refine: '' }, { replace: true })}>
              {t.showAll(results.length)}
            </Button>
          }
        >
          {route.refine === 'quality'
            ? t.noRefinedQuality(results.length)
            : t.noRefinedAuthority(results.length)}
        </SearchMessage>
      )
    }

    return (
      <>
        <ResultList results={visible} terms={terms} onShowDetails={showDetails} />
        {(canLoadMore || (loading && expandedQuery === query)) && (
          <div className={styles.more}>
            <Button
              variant="tonal"
              size="medium"
              trailingIcon="expandMore"
              disabled={loading}
              onClick={() => setExpandedQuery(query)}
            >
              {loading ? t.loadingMore : t.loadMore}
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={styles.page}>
      <header className={cx(styles.header, scrolled && styles.scrolled)}>
        <div className={styles.headerRow}>
          <div className={styles.logoCell}>
            <Logo size="compact" onClick={() => navigate(EMPTY_ROUTE)} />
          </div>
          <div className={styles.searchCell}>
            <SearchBar
              variant="compact"
              value={route.q}
              suggestions={history.items}
              onRemoveSuggestion={history.remove}
              onSubmit={(q) => submit(q, { keepFilters: true })}
            />
          </div>
          <div className={styles.actionsCell}>
            <ThemeToggleButton />
            <IconButton
              icon="settings"
              label={m.common.settings}
              tooltip="bottomEnd"
              onClick={openSettings}
            />
          </div>
        </div>
        <div className={styles.filtersRow}>
          <SearchFilters
            time={route.time}
            lang={route.lang}
            sort={route.sort}
            refine={route.refine}
            onChange={(patch) => navigate(patch, { replace: true })}
            onOpenAdvanced={() => setAdvancedOpen(true)}
          />
        </div>
        <LinearProgress active={loading} label={t.searching} className={styles.progress} />
      </header>

      <main className={styles.main}>
        {isUrl && (
          <section className={styles.urlCard}>
            <Icon name="link" className={styles.urlIcon} />
            <div className={styles.urlText}>
              <span className={styles.urlTitle}>{t.urlTitle}</span>
              <span className={styles.urlHint}>{t.urlHint}</span>
            </div>
            <Button variant="tonal" icon="article" onClick={() => setReaderOpen(true)}>
              {t.readPage}
            </Button>
          </section>
        )}

        {route.ori && (
          <div className={styles.question}>
            <Chip
              icon="question"
              trailingIcon="close"
              onClick={() => navigate({ ori: '' }, { replace: true })}
            >
              {t.question(route.ori)}
            </Chip>
          </div>
        )}

        {search.status === 'success' && results && results.length > 0 && visible && (
          <p className={styles.stats}>
            {t.stats(results.length, search.elapsed?.toFixed(2) ?? '0')}
            {visible.length !== results.length && t.filtered(visible.length)}
            {query !== route.q && (
              <span className={styles.actualQuery}>
                {t.actualQuery} <code>{query}</code>
              </span>
            )}
          </p>
        )}
        {renderBody()}
      </main>

      <ResultDetailsSheet result={details} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
      <PageReaderSheet url={isUrl ? route.q : null} open={readerOpen} onClose={() => setReaderOpen(false)} />
      <AdvancedSearchDialog
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        initialQuery={route.q}
        initialQuestion={route.ori}
        onSubmit={(q, question) => submit(q, { question })}
      />
    </div>
  )
}
