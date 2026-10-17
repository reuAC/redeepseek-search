import { useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { cx } from '@/lib/cx'
import { Icon, IconButton, Ripple } from '@/ui'
import { useI18n } from '@/i18n'
import { MAX_QUERY_LENGTH } from '@/services/deepseek'
import styles from './SearchBar.module.css'

const MAX_SUGGESTIONS = 6

export interface SearchBarProps {
  value?: string
  variant?: 'hero' | 'compact'
  autoFocus?: boolean
  /** 外部按钮可通过 form 属性提交本表单（例如首页的“手气不错”） */
  formId?: string
  suggestions?: readonly string[]
  onRemoveSuggestion?: (query: string) => void
  /** submitter 为触发提交的按钮 name */
  onSubmit: (query: string, submitter?: string) => void
}

/** MD3 Search bar：聚焦时展开历史建议，键盘可导航 */
export function SearchBar({
  value = '',
  variant = 'hero',
  autoFocus,
  formId,
  suggestions = [],
  onRemoveSuggestion,
  onSubmit,
}: SearchBarProps) {
  const listId = useId()
  const { m } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  // 外部 value 变化（如浏览器后退）时同步输入框
  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(value)
  }

  const matches = useMemo(() => {
    const needle = text.trim().toLowerCase()
    return suggestions
      .filter((s) => s.toLowerCase() !== needle && s.toLowerCase().includes(needle))
      .slice(0, MAX_SUGGESTIONS)
  }, [suggestions, text])

  const expanded = open && matches.length > 0

  const commit = (query: string, submitter?: string) => {
    const q = query.trim()
    if (!q) {
      inputRef.current?.focus()
      return
    }
    setText(q)
    setOpen(false)
    setActive(-1)
    inputRef.current?.blur()
    onSubmit(q, submitter)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('name') ?? undefined
    commit(active >= 0 && matches[active] ? matches[active] : text, submitter)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!matches.length) return
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      // -1 表示焦点回到输入框本身，在 [-1, n-1] 间循环
      setActive((i) => {
        const next = i + step
        if (next < -1) return matches.length - 1
        if (next >= matches.length) return -1
        return next
      })
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault()
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className={cx(styles.slot, styles[variant])}>
      <form
        id={formId}
        role="search"
        className={cx(styles.surface, expanded && styles.expanded)}
        onSubmit={handleSubmit}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpen(false)
            setActive(-1)
          }
        }}
      >
        <div className={styles.row}>
          <Icon name="search" className={styles.leading} />
          <input
            ref={inputRef}
            className={styles.input}
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setOpen(true)
              setActive(-1)
            }}
            onClick={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            maxLength={MAX_QUERY_LENGTH}
            aria-label={m.searchBar.label}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          <span className={cx(styles.clear, text && styles.clearVisible)}>
            <IconButton
              icon="close"
              label={m.searchBar.clear}
              tooltip={false}
              tabIndex={text ? 0 : -1}
              onClick={() => {
                setText('')
                setOpen(true)
                inputRef.current?.focus()
              }}
            />
          </span>
          {variant === 'compact' && (
            <>
              <span className={styles.divider} />
              <IconButton
                icon="search"
                label={m.searchBar.submit}
                type="submit"
                className={styles.submit}
                tooltip="bottomEnd"
              />
            </>
          )}
        </div>

        <div className={styles.panel} aria-hidden={!expanded}>
          <div className={styles.panelInner}>
            <ul id={listId} role="listbox" aria-label={m.searchBar.history} className={styles.list}>
              {matches.map((item, index) => (
                <li
                  key={item}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={cx(styles.option, index === active && styles.optionActive)}
                  style={{ animationDelay: `${index * 30}ms` }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(item)}
                >
                  <Ripple />
                  <Icon name="history" size={20} className={styles.optionIcon} />
                  <span className={styles.optionText}>{item}</span>
                  {onRemoveSuggestion && (
                    <button
                      type="button"
                      tabIndex={-1}
                      className={styles.remove}
                      aria-label={m.searchBar.removeHistory(item)}
                      onClick={(event) => {
                        event.stopPropagation()
                        onRemoveSuggestion(item)
                      }}
                    >
                      <Icon name="close" size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>
    </div>
  )
}
