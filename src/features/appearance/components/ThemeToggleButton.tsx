import { IconButton } from '@/ui'
import { useTheme } from '@/theme'
import { useI18n } from '@/i18n'
import { originOf } from '../origin'

/** 在浅色 / 深色之间切换，以点击位置为圆心做圆形揭示 */
export function ThemeToggleButton() {
  const { isDark, setPreferences } = useTheme()
  const { m } = useI18n()
  return (
    <IconButton
      icon={isDark ? 'lightMode' : 'darkMode'}
      label={isDark ? m.appearance.toLight : m.appearance.toDark}
      onClick={(event) => setPreferences({ mode: isDark ? 'light' : 'dark' }, originOf(event))}
    />
  )
}
