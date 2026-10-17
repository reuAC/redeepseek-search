import { useState } from 'react'
import { Logo } from '@/components/Logo/Logo'
import { ThemeToggleButton } from '@/features/appearance'
import { useSearchHistory } from '@/features/history'
import { AdvancedSearchDialog, SearchBar, useSearchActions } from '@/features/search'
import { useSettings } from '@/features/settings'
import { LOCALES, LOCALE_NAMES, useI18n } from '@/i18n'
import { Button, IconButton } from '@/ui'
import styles from './HomePage.module.css'

const FORM_ID = 'home-search-form'

export function HomePage() {
  const { settings, openSettings } = useSettings()
  const { submit, lucky, luckyPending } = useSearchActions()
  const history = useSearchHistory()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const { m, locale, setPreference } = useI18n()
  const t = m.home

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <ThemeToggleButton />
        <IconButton icon="settings" label={m.common.settings} tooltip="bottomEnd" onClick={openSettings} />
      </header>

      <main className={styles.main}>
        <h1 className={styles.brand}>
          <Logo />
          <span className="visually-hidden">{m.app.name}</span>
        </h1>

        <div className={styles.search}>
          <SearchBar
            formId={FORM_ID}
            variant="hero"
            autoFocus
            suggestions={history.items}
            onRemoveSuggestion={history.remove}
            onSubmit={(query, submitter) => (submitter === 'lucky' ? lucky(query) : submit(query))}
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="tonal"
            shape="square"
            className={styles.action}
            type="submit"
            form={FORM_ID}
            name="search"
          >
            {t.search}
          </Button>
          <Button
            variant="tonal"
            shape="square"
            className={styles.action}
            type="submit"
            form={FORM_ID}
            name="lucky"
            disabled={luckyPending}
          >
            {luckyPending ? t.redirecting : t.lucky}
          </Button>
        </div>

        {!settings.apiKey && (
          <p className={styles.notice}>
            {t.noKey}
            <button type="button" className={styles.inlineLink} onClick={openSettings}>
              {t.goToSettings}
            </button>
          </p>
        )}

        <p className={styles.languages}>
          {t.offeredIn}
          {LOCALES.filter((l) => l !== locale).map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              className={styles.inlineLink}
              onClick={() => setPreference(l)}
            >
              {LOCALE_NAMES[l]}
            </button>
          ))}
        </p>
      </main>

      <footer className={styles.footer}>
        <nav className={styles.links}>
          <button type="button" className={styles.footerLink} onClick={() => setAdvancedOpen(true)}>
            {t.advanced}
          </button>
          <a className={styles.footerLink} href={m.links.docs} target="_blank" rel="noreferrer">
            {t.docs}
          </a>
          <a
            className={styles.footerLink}
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noreferrer"
          >
            {t.getKey}
          </a>
        </nav>
        <span className={styles.caption}>{t.poweredBy}</span>
      </footer>

      <AdvancedSearchDialog
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        onSubmit={(query, question) => submit(query, { question })}
      />
    </div>
  )
}
