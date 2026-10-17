import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './TextField.module.css'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string
  leadingIcon?: IconName
  /** 行尾操作区，通常是 IconButton */
  trailing?: ReactNode
  supportingText?: ReactNode
  error?: boolean
}

/** MD3 Outlined text field：浮动标签 + 描边缺口 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, leadingIcon, trailing, supportingText, error, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const supportId = `${inputId}-support`

  return (
    <div className={cx(styles.field, error && styles.error, rest.disabled && styles.disabled, className)}>
      <div
        className={cx(styles.box, leadingIcon && styles.withLeading, trailing != null && styles.withTrailing)}
      >
        {leadingIcon && <Icon name={leadingIcon} className={styles.leading} />}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          placeholder=" "
          aria-invalid={error || undefined}
          aria-describedby={supportingText ? supportId : undefined}
          {...rest}
        />
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <fieldset aria-hidden="true" className={styles.outline}>
          <legend className={styles.legend}>
            <span>{label}</span>
          </legend>
        </fieldset>
        {trailing && <span className={styles.trailing}>{trailing}</span>}
      </div>
      {supportingText && (
        <div id={supportId} className={styles.supporting}>
          {supportingText}
        </div>
      )}
    </div>
  )
})
