import { useState, type FormEvent } from 'react'
import { cx } from '@/lib/cx'
import {
  Button,
  Dialog,
  IconButton,
  SegmentedButton,
  Switch,
  TextField,
  useSnackbar,
  type Segment,
} from '@/ui'
import { AppearanceSettings } from '@/features/appearance'
import { useI18n } from '@/i18n'
import { UsageSummary } from '@/features/usage'
import {
  DIRECT_BASE_URL,
  PROXY_AVAILABLE,
  PROXY_BASE_URL,
  endpointModeOf,
  isValidIp,
  type ApiSettings,
  type EndpointMode,
} from '../model'
import styles from './SettingsDialog.module.css'

export interface SettingsDialogProps {
  open: boolean
  settings: ApiSettings
  onSave: (settings: ApiSettings) => void
  onClose: () => void
}

export function SettingsDialog({ open, settings, onSave, onClose }: SettingsDialogProps) {
  const showSnackbar = useSnackbar()
  const { m } = useI18n()
  const t = m.settings
  const [draft, setDraft] = useState(settings)
  const [mode, setMode] = useState<EndpointMode>(endpointModeOf(settings.baseUrl))
  // 输入过程中保留原始文本，允许清空后重新输入；保存时再规范化
  const [countText, setCountText] = useState(String(settings.count))
  const [revealKey, setRevealKey] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  // 每次打开时以当前已保存的设置为草稿
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDraft(settings)
      setMode(endpointModeOf(settings.baseUrl))
      setCountText(String(settings.count))
      setRevealKey(false)
    }
  }

  const endpointSegments: ReadonlyArray<Segment<EndpointMode>> = [
    ...(PROXY_AVAILABLE ? [{ value: 'proxy' as const, label: t.endpointProxy }] : []),
    { value: 'direct', label: t.endpointDirect },
    { value: 'custom', label: t.endpointCustom },
  ]
  const endpointHints: Record<EndpointMode, string> = {
    proxy: t.hintProxy(DIRECT_BASE_URL),
    direct: t.hintDirect(DIRECT_BASE_URL, !PROXY_AVAILABLE),
    custom: t.hintCustom,
  }

  const count = Number(countText)
  const countInvalid = !Number.isInteger(count) || count < 1 || count > 50
  const ipInvalid = !isValidIp(draft.localization)

  const update = (patch: Partial<ApiSettings>) => setDraft((d) => ({ ...d, ...patch }))

  const changeMode = (next: EndpointMode) => {
    setMode(next)
    if (next === 'proxy') update({ baseUrl: PROXY_BASE_URL })
    else if (next === 'direct') update({ baseUrl: DIRECT_BASE_URL })
    else update({ baseUrl: '' })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (countInvalid || ipInvalid) return
    onSave({ ...draft, count })
    onClose()
    showSnackbar(draft.apiKey.trim() ? t.saved : t.savedNoKey)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      headline={t.title}
      onSubmit={submit}
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            {m.common.cancel}
          </Button>
          <Button variant="filled" type="submit">
            {m.common.save}
          </Button>
        </>
      }
    >
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.apiSection}</h3>

        <TextField
          label={t.apiKey}
          leadingIcon="key"
          type={revealKey ? 'text' : 'password'}
          value={draft.apiKey}
          onChange={(e) => update({ apiKey: e.target.value })}
          autoComplete="off"
          spellCheck={false}
          autoFocus={!settings.apiKey}
          trailing={
            <IconButton
              icon={revealKey ? 'visibilityOff' : 'visibility'}
              label={revealKey ? t.hideKey : t.showKey}
              tooltip="top"
              onClick={() => setRevealKey((v) => !v)}
            />
          }
          supportingText={
            <>
              {t.keyHintBefore}
              <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer">
                {t.keyHintLink}
              </a>
              {t.keyHintAfter}
            </>
          }
        />

        <div className={styles.group}>
          <span className={styles.groupLabel}>{t.endpoint}</span>
          <SegmentedButton
            aria-label={t.endpoint}
            segments={endpointSegments}
            value={mode}
            onChange={changeMode}
          />
          <p className={styles.hint}>{endpointHints[mode]}</p>
        </div>

        <div className={cx(styles.collapse, mode === 'custom' && styles.expanded)}>
          <div className={styles.collapseInner}>
            <TextField
              label={t.customUrl}
              leadingIcon="link"
              value={mode === 'custom' ? draft.baseUrl : ''}
              onChange={(e) => update({ baseUrl: e.target.value })}
              supportingText={t.customUrlHint}
            />
          </div>
        </div>

        <TextField
          label={t.count}
          type="number"
          min={1}
          max={50}
          inputMode="numeric"
          value={countText}
          error={countInvalid}
          onChange={(e) => setCountText(e.target.value)}
          supportingText={t.countHint}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.searchSection}</h3>
        <Switch
          label={t.needContent}
          supportingText={t.needContentHint}
          checked={draft.needContent}
          onChange={(needContent) => update({ needContent })}
        />
        <TextField
          label={t.localization}
          leadingIcon="translate"
          value={draft.localization}
          error={ipInvalid}
          onChange={(e) => update({ localization: e.target.value })}
          spellCheck={false}
          supportingText={ipInvalid ? t.ipInvalid : t.localizationHint}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t.usageSection}</h3>
        <UsageSummary />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t.appearanceSection} <span className={styles.badge}>{t.instant}</span>
        </h3>
        <AppearanceSettings />
      </section>
    </Dialog>
  )
}
