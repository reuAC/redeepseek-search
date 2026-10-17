import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/cx'
import { useI18n } from '@/i18n'
import { IconButton } from '../IconButton/IconButton'
import { usePresence } from '../hooks/usePresence'
import { SnackbarContext, type SnackbarOptions } from './SnackbarContext'
import styles from './Snackbar.module.css'

interface Message extends SnackbarOptions {
  id: number
  text: string
}

/**
 * 模态 <dialog> 打开时，对话框之外的内容都是 inert 的（无法点击、读屏不可达），
 * 因此 snackbar 需要渲染进最上层的模态框内部才能保持可交互。
 */
function topmostModal(): HTMLDialogElement | null {
  // 正在播放退场动画的对话框即将被移除，不能作为宿主
  const open = document.querySelectorAll<HTMLDialogElement>('dialog[open]:not([data-state="closing"])')
  return open[open.length - 1] ?? null
}

function subscribeModals(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open', 'data-state'],
  })
  return () => observer.disconnect()
}

let nextId = 0

/** MD3 Snackbar：同一时间只显示一条，新消息会替换旧消息 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const { m } = useI18n()
  const [message, setMessage] = useState<Message | null>(null)
  const [visible, setVisible] = useState(false)
  const { mounted, exiting } = usePresence(visible, 150)
  const host = useSyncExternalStore(subscribeModals, topmostModal)
  const show = useCallback((text: string, options?: SnackbarOptions) => {
    setMessage({ id: ++nextId, text, ...options })
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setVisible(false), message.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [message])

  const snackbar = mounted && message && (
    <div key={message.id} className={cx(styles.snackbar, exiting && styles.exiting)}>
      <span className={styles.text}>{message.text}</span>
      {message.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            message.action?.onClick()
            setVisible(false)
          }}
        >
          {message.action.label}
        </button>
      )}
      <IconButton
        icon="close"
        label={m.ui.close}
        size="small"
        tooltip={false}
        className={styles.close}
        onClick={() => setVisible(false)}
      />
    </div>
  )
  const region = (
    <div className={styles.region} role="status" aria-live="polite">
      {snackbar}
    </div>
  )
  return (
    <SnackbarContext value={show}>
      {children}
      {host ? createPortal(region, host) : region}
    </SnackbarContext>
  )
}
