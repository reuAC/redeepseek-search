import { useId, type FormEvent, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import { useModalDialog } from '../hooks/useModalDialog'
import styles from './Dialog.module.css'

export interface DialogProps {
  open: boolean
  onClose: () => void
  headline: ReactNode
  icon?: IconName
  actions?: ReactNode
  children: ReactNode
  /** 包裹内容与操作区的表单提交处理；提供时整个对话框为一个 <form> */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
}

/** MD3 Basic dialog */
export function Dialog({ open, onClose, headline, icon, actions, children, onSubmit }: DialogProps) {
  const headlineId = useId()
  const { mounted, exiting, dialogProps } = useModalDialog(open, onClose, 200)
  if (!mounted) return null

  const body = (
    <>
      <header className={cx(styles.header, icon && styles.withIcon)}>
        {icon && <Icon name={icon} className={styles.icon} />}
        <h2 id={headlineId} className={styles.headline}>
          {headline}
        </h2>
      </header>
      <div className={styles.content}>{children}</div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </>
  )

  return (
    <dialog
      {...dialogProps}
      data-state={exiting ? 'closing' : 'open'}
      aria-labelledby={headlineId}
      className={cx(styles.dialog, exiting && styles.exiting)}
    >
      {onSubmit ? (
        <form className={styles.container} onSubmit={onSubmit} noValidate>
          {body}
        </form>
      ) : (
        <div className={styles.container}>{body}</div>
      )}
    </dialog>
  )
}
