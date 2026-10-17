import { useLayoutEffect, useRef, type MouseEvent, type PointerEvent, type SyntheticEvent } from 'react'
import { usePresence } from './usePresence'

/**
 * 基于原生 <dialog>.showModal() 的模态层：自带焦点约束、顶层渲染与 Esc 处理。
 * 关闭时保留挂载直到退场动画结束，并把焦点还给打开前的元素。
 */
export function useModalDialog(open: boolean, onClose: () => void, exitMs: number) {
  const ref = useRef<HTMLDialogElement>(null)
  const pressedOnBackdrop = useRef(false)
  const { mounted, exiting } = usePresence(open, exitMs)

  useLayoutEffect(() => {
    const dialog = ref.current
    if (!mounted || !dialog) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [mounted])

  const dialogProps = {
    ref,
    onCancel: (event: SyntheticEvent) => {
      event.preventDefault()
      onClose()
    },
    // 浏览器在某些情况下会绕过 cancel 直接关闭对话框（如 CloseWatcher 防滥用策略），
    // 此时同步回调，避免 React 状态仍为“打开”导致再次打开无效
    onClose: () => {
      if (open) onClose()
    },
    onPointerDown: (event: PointerEvent) => {
      pressedOnBackdrop.current = event.target === event.currentTarget
    },
    onClick: (event: MouseEvent) => {
      if (pressedOnBackdrop.current && event.target === event.currentTarget) onClose()
      pressedOnBackdrop.current = false
    },
  }

  return { mounted, exiting, dialogProps }
}
