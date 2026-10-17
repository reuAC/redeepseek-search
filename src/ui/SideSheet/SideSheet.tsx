import { useId, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { useI18n } from '@/i18n'
import { IconButton } from '../IconButton/IconButton'
import { useModalDialog } from '../hooks/useModalDialog'
import styles from './SideSheet.module.css'

export interface SideSheetProps {
  open: boolean
  onClose: () => void
  headline: ReactNode
  children: ReactNode
  actions?: ReactNode
}

/** MD3 Modal side sheet：从行尾滑入，窄屏下占满宽度 */
export function SideSheet({ open, onClose, headline, children, actions }: SideSheetProps) {
  const headlineId = useId()
  const { m } = useI18n()
  const { mounted, exiting, dialogProps } = useModalDialog(open, onClose, 250)
  if (!mounted) return null

  return (
    <dialog
      {...dialogProps}
      data-state={exiting ? 'closing' : 'open'}
      aria-labelledby={headlineId}
      className={cx(styles.sheet, exiting && styles.exiting)}
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 id={headlineId} className={styles.headline}>
            {headline}
          </h2>
          <IconButton icon="close" label={m.ui.close} onClick={onClose} tooltip="bottomEnd" />
        </header>
        <div className={styles.content}>{children}</div>
        {actions && <footer className={styles.actions}>{actions}</footer>}
      </div>
    </dialog>
  )
}
