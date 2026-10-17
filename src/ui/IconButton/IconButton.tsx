import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import { Ripple } from '../Ripple/Ripple'
import { Tooltip, type TooltipPlacement } from '../Tooltip/Tooltip'
import styles from './IconButton.module.css'

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName
  /** 无障碍名称，同时作为 tooltip 文案 */
  label: string
  variant?: IconButtonVariant
  size?: 'small' | 'medium'
  /** 切换型按钮的选中态 */
  selected?: boolean
  tooltip?: TooltipPlacement | false
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'standard', size = 'medium', selected, tooltip = 'bottom', className, ...rest },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={selected}
      className={cx(styles.iconButton, styles[variant], styles[size], selected && styles.selected, className)}
      {...rest}
    >
      <Ripple disabled={rest.disabled} />
      <Icon name={icon} size={size === 'small' ? 20 : 24} className={styles.icon} />
    </button>
  )
  return tooltip ? (
    <Tooltip label={label} placement={tooltip}>
      {button}
    </Tooltip>
  ) : (
    button
  )
})
