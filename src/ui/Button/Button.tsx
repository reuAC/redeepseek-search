import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import { Ripple } from '../Ripple/Ripple'
import styles from './Button.module.css'

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'
export type ButtonSize = 'small' | 'medium'
/** M3 Expressive 按钮形状：round 为胶囊形，square 为小圆角矩形 */
export type ButtonShape = 'round' | 'square'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  icon?: IconName
  trailingIcon?: IconName
  children: ReactNode
}

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export type ButtonProps = AsButton | AsLink

/** MD3 Expressive common button：按下时圆角收紧（shape morph），配合弹簧动效 */
export function Button(props: ButtonProps) {
  const {
    variant = 'filled',
    size = 'small',
    shape = 'round',
    icon,
    trailingIcon,
    children,
    className,
    ...rest
  } = props
  const classes = cx(
    styles.button,
    styles[variant],
    styles[size],
    shape === 'square' && styles.square,
    icon && styles.withIcon,
    trailingIcon && styles.withTrailing,
    className,
  )
  const content = (
    <>
      <Ripple disabled={'disabled' in rest && Boolean(rest.disabled)} />
      {icon && <Icon name={icon} size={18} className={styles.icon} />}
      <span className={styles.label}>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={18} className={styles.icon} />}
    </>
  )

  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    )
  }
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  )
}
