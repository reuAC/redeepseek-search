import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import { Ripple } from '../Ripple/Ripple'
import styles from './Chip.module.css'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** assist：操作型；filter：可选中的筛选型（选中时出现勾选图标） */
  kind?: 'assist' | 'filter'
  selected?: boolean
  icon?: IconName
  trailingIcon?: IconName
  elevated?: boolean
  children: ReactNode
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { kind = 'assist', selected = false, icon, trailingIcon, elevated, className, children, ...rest },
  ref,
) {
  const leading = kind === 'filter' && selected ? 'check' : icon
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={kind === 'filter' && !rest['aria-haspopup'] ? selected : undefined}
      className={cx(
        styles.chip,
        selected && styles.selected,
        elevated && styles.elevated,
        leading && styles.withLeading,
        trailingIcon && styles.withTrailing,
        className,
      )}
      {...rest}
    >
      <Ripple disabled={rest.disabled} />
      <span className={cx(styles.leading, leading && styles.leadingVisible)}>
        {leading && <Icon key={leading} name={leading} size={18} className={styles.leadingIcon} />}
      </span>
      <span className={styles.label}>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={18} className={styles.trailing} />}
    </button>
  )
})
