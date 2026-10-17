import { useId, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from '../Icon/Icon'
import styles from './Switch.module.css'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  supportingText?: ReactNode
  disabled?: boolean
}

/** MD3 Switch（带标签的列表行）：开启时滑块变大并显示勾选图标 */
export function Switch({ checked, onChange, label, supportingText, disabled }: SwitchProps) {
  const id = useId()
  return (
    <div className={cx(styles.row, disabled && styles.disabled)}>
      <label htmlFor={id} className={styles.text}>
        <span className={styles.label}>{label}</span>
        {supportingText && <span className={styles.supporting}>{supportingText}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cx(styles.track, checked && styles.on)}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.handle}>
          <Icon name="check" size={16} className={styles.icon} />
        </span>
      </button>
    </div>
  )
}
