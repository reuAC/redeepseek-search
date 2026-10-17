import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import { LOCALES, LOCALE_NAMES, useI18n, type LocalePreference } from '@/i18n'
import { Chip, Icon, Menu, Ripple, SegmentedButton, type MenuItem, type Segment } from '@/ui'
import { SEED_COLORS, useTheme, type ThemeMode } from '@/theme'
import { originOf } from '../origin'
import styles from './AppearanceSettings.module.css'

/** 语言、主题模式与动态配色种子色选择 */
export function AppearanceSettings() {
  const { preferences, setPreferences } = useTheme()
  const { m, preference, setPreference } = useI18n()

  const modeSegments: ReadonlyArray<Segment<ThemeMode>> = [
    { value: 'light', label: m.appearance.light, icon: 'lightMode' },
    { value: 'dark', label: m.appearance.dark, icon: 'darkMode' },
    { value: 'system', label: m.appearance.system, icon: 'contrast' },
  ]

  const languageItems: ReadonlyArray<MenuItem<LocalePreference>> = [
    { value: 'auto', label: m.appearance.languageAuto },
    ...LOCALES.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] })),
  ]
  const currentLanguage = languageItems.find((item) => item.value === preference) ?? languageItems[0]

  return (
    <div className={styles.appearance}>
      <div className={styles.group}>
        <span className={styles.label}>{m.appearance.language}</span>
        <Menu
          items={languageItems}
          value={preference}
          onSelect={setPreference}
          trigger={(props) => (
            <Chip {...props} icon="translate" trailingIcon="arrowDropDown" className={styles.languageChip}>
              {currentLanguage.label}
            </Chip>
          )}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.label}>{m.appearance.theme}</span>
        <SegmentedButton
          aria-label={m.appearance.themeMode}
          segments={modeSegments}
          value={preferences.mode}
          onChange={(mode, event) => setPreferences({ mode }, originOf(event))}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.label}>{m.appearance.palette}</span>
        <div role="radiogroup" aria-label={m.appearance.paletteLabel} className={styles.swatches}>
          {SEED_COLORS.map((value) => {
            const selected = value === preferences.seed
            const label = m.appearance.seeds[value]
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={label}
                title={label}
                className={cx(styles.swatch, selected && styles.selected)}
                style={{ '--_seed': value } as CSSProperties}
                onClick={(event) => !selected && setPreferences({ seed: value }, originOf(event))}
              >
                <Ripple />
                <span className={styles.swatchColor} />
                {selected && <Icon name="check" size={20} className={styles.check} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
