import { useState, type FormEvent } from 'react'
import { useI18n } from '@/i18n'
import { Button, Dialog, SegmentedButton, TextField, type Segment } from '@/ui'
import { MAX_QUERY_LENGTH, MAX_QUESTION_LENGTH } from '@/services/deepseek'
import { EMPTY_ADVANCED, composeQuery, parseQuery, type AdvancedQuery } from '../lib/query'
import styles from './AdvancedSearchDialog.module.css'

/** after: / before: 接受年份或完整日期 */
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/
const isDate = (v: string) => !v || DATE.test(v.trim())

export interface AdvancedSearchDialogProps {
  open: boolean
  onClose: () => void
  /** 打开时用于预填表单的当前搜索词与原始问题 */
  initialQuery?: string
  initialQuestion?: string
  onSubmit: (query: string, question: string) => void
}

/** 高级搜索：以表单方式组合 DeepSeek 支持的全部搜索语法，并可附带原始问题（ori_question） */
export function AdvancedSearchDialog({
  open,
  onClose,
  initialQuery = '',
  initialQuestion = '',
  onSubmit,
}: AdvancedSearchDialogProps) {
  const { m } = useI18n()
  const t = m.advanced
  const langSegments: ReadonlyArray<Segment<string>> = [
    { value: '', label: t.langAny },
    { value: 'zh', label: t.langZh },
    { value: 'en', label: t.langEn },
    { value: 'zh,en', label: t.langBoth },
  ]
  const [fields, setFields] = useState<AdvancedQuery>(EMPTY_ADVANCED)
  const [question, setQuestion] = useState('')
  const [wasOpen, setWasOpen] = useState(false)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setFields(parseQuery(initialQuery))
      setQuestion(initialQuestion)
    }
  }

  const set = (patch: Partial<AdvancedQuery>) => setFields((f) => ({ ...f, ...patch }))
  const query = composeQuery(fields)
  const tooLong = query.length > MAX_QUERY_LENGTH
  const datesInvalid = !isDate(fields.after) || !isDate(fields.before)
  const canSubmit = Boolean(query) && !tooLong && !datesInvalid

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(query, question.trim())
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      headline={t.title}
      onSubmit={submit}
      actions={
        <>
          <Button
            variant="text"
            className={styles.reset}
            onClick={() => {
              setFields(EMPTY_ADVANCED)
              setQuestion('')
            }}
          >
            {t.reset}
          </Button>
          <Button variant="text" onClick={onClose}>
            {m.common.cancel}
          </Button>
          <Button variant="filled" type="submit" disabled={!canSubmit}>
            {m.common.search}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <h3 className={styles.title}>{t.findSection}</h3>
        <TextField
          label={t.allWords}
          value={fields.allWords}
          onChange={(e) => set({ allWords: e.target.value })}
          autoFocus
        />
        <TextField
          label={t.exactPhrase}
          value={fields.exactPhrase}
          onChange={(e) => set({ exactPhrase: e.target.value })}
          supportingText={t.exactPhraseHint}
        />
        <TextField
          label={t.exclude}
          value={fields.excludeWords}
          onChange={(e) => set({ excludeWords: e.target.value })}
          supportingText={t.excludeHint}
        />

        <h3 className={styles.title}>{t.narrowSection}</h3>
        <div className={styles.row}>
          <TextField
            label={t.sites}
            value={fields.sites}
            onChange={(e) => set({ sites: e.target.value })}
            supportingText={t.sitesHint}
            spellCheck={false}
          />
          <TextField
            label={t.excludeSites}
            value={fields.excludeSites}
            onChange={(e) => set({ excludeSites: e.target.value })}
            supportingText={t.excludeSitesHint}
            spellCheck={false}
          />
        </div>
        <div className={styles.row}>
          <TextField
            label={t.after}
            value={fields.after}
            error={!isDate(fields.after)}
            onChange={(e) => set({ after: e.target.value })}
            supportingText={t.dateHint}
            inputMode="numeric"
          />
          <TextField
            label={t.before}
            value={fields.before}
            error={!isDate(fields.before)}
            onChange={(e) => set({ before: e.target.value })}
            supportingText={t.dateHint}
            inputMode="numeric"
          />
        </div>
        <div className={styles.group}>
          <span className={styles.groupLabel}>{t.language}</span>
          <SegmentedButton
            aria-label={t.language}
            segments={langSegments}
            value={fields.lang}
            onChange={(lang) => set({ lang })}
          />
        </div>

        <h3 className={styles.title}>{t.intentSection}</h3>
        <TextField
          label={t.question}
          value={question}
          maxLength={MAX_QUESTION_LENGTH}
          onChange={(e) => setQuestion(e.target.value)}
          supportingText={t.questionHint(question.length, MAX_QUESTION_LENGTH)}
        />

        <div className={styles.preview} aria-live="polite">
          <span className={styles.previewLabel}>
            {t.preview}
            <span className={tooLong ? styles.counterError : styles.counter}>
              {query.length}/{MAX_QUERY_LENGTH}
            </span>
          </span>
          <code className={styles.previewCode}>{query || t.previewEmpty}</code>
        </div>
      </div>
    </Dialog>
  )
}
