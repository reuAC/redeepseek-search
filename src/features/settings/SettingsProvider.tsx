import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { readJson, writeJson } from '@/lib/storage'
import { DEFAULT_SETTINGS, normalizeSettings, type ApiSettings } from './model'
import { SettingsContext, type SettingsContextValue } from './SettingsContext'
import { SettingsDialog } from './components/SettingsDialog'

const STORAGE_KEY = 'ds-search:settings'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ApiSettings>(() =>
    normalizeSettings(readJson(STORAGE_KEY, DEFAULT_SETTINGS)),
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  const saveSettings = useCallback((next: ApiSettings) => {
    const normalized = normalizeSettings(next)
    setSettings(normalized)
    writeJson(STORAGE_KEY, normalized)
  }, [])

  const openSettings = useCallback(() => setDialogOpen(true), [])
  const closeSettings = useCallback(() => setDialogOpen(false), [])

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, saveSettings, openSettings }),
    [settings, saveSettings, openSettings],
  )

  return (
    <SettingsContext value={value}>
      {children}
      <SettingsDialog open={dialogOpen} settings={settings} onSave={saveSettings} onClose={closeSettings} />
    </SettingsContext>
  )
}
