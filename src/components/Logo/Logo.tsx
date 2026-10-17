import { cx } from '@/lib/cx'
import { useI18n } from '@/i18n'
import styles from './Logo.module.css'

/** 逐字母配色（与 Google 字标同样的四色节奏） */
const LETTERS = [
  ['D', 'blue'],
  ['e', 'red'],
  ['e', 'yellow'],
  ['p', 'blue'],
  ['S', 'green'],
  ['e', 'red'],
  ['e', 'yellow'],
  ['k', 'blue'],
] as const

export interface LogoProps {
  size?: 'hero' | 'compact'
  onClick?: () => void
}

/** DeepSeek 字标；在页面切换中作为共享元素过渡 */
export function Logo({ size = 'hero', onClick }: LogoProps) {
  const { m } = useI18n()
  const wordmark = (
    <span
      className={cx(styles.logo, styles[size])}
      style={{ viewTransitionName: 'app-logo' }}
      aria-hidden={onClick ? true : undefined}
    >
      {LETTERS.map(([letter, color], i) => (
        <span key={i} className={styles[color]}>
          {letter}
        </span>
      ))}
    </span>
  )
  if (!onClick) return wordmark
  return (
    <button type="button" className={styles.home} onClick={onClick} aria-label={m.app.backHome}>
      {wordmark}
    </button>
  )
}
