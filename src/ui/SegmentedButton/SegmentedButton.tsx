import type { MouseEvent } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import { Ripple } from '../Ripple/Ripple'
import styles from './SegmentedButton.module.css'

export interface Segment<T extends string> {
  value: T
  label: string
  icon?: IconName
}

export interface SegmentedButtonProps<T extends string> {
  segments: ReadonlyArray<Segment<T>>
  value: T
  onChange: (value: T, event: MouseEvent<HTMLButtonElement>) => void
  'aria-label': string
}

/** MD3 Segmented button（单选）：选中段出现勾选图标并以弹簧动效过渡 */
export function SegmentedButton<T extends string>({
  segments,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedButtonProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={styles.group}>
      {segments.map((segment) => {
        const selected = segment.value === value
        const icon = selected ? 'check' : segment.icon
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cx(styles.segment, selected && styles.selected)}
            onClick={(event) => !selected && onChange(segment.value, event)}
          >
            <Ripple />
            {icon && <Icon key={icon} name={icon} size={18} className={styles.icon} />}
            <span className={styles.label}>{segment.label}</span>
          </button>
        )
      })}
    </div>
  )
}
