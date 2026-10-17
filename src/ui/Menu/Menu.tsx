import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import { Ripple } from '../Ripple/Ripple'
import { usePresence } from '../hooks/usePresence'
import styles from './Menu.module.css'

export interface MenuItem<T extends string> {
  value: T
  label: string
  icon?: IconName
}

export interface MenuTriggerProps {
  ref: Ref<HTMLButtonElement>
  onClick: () => void
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
}

export interface MenuProps<T extends string> {
  items: ReadonlyArray<MenuItem<T>>
  value?: T
  onSelect: (value: T) => void
  /** 渲染触发器，需把 props 展开到一个按钮上 */
  trigger: (props: MenuTriggerProps, open: boolean) => ReactNode
  align?: 'start' | 'end'
}

const GAP = 4
const VIEWPORT_MARGIN = 8

/**
 * MD3 Menu（单选）：以 popover 渲染在顶层，不会被滚动容器或对话框裁剪；
 * 默认位于触发器下方，空间不足时翻转到上方。支持方向键导航、Esc / 外部点击关闭。
 */
export function Menu<T extends string>({ items, value, onSelect, trigger, align = 'start' }: MenuProps<T>) {
  const [open, setOpen] = useState(false)
  const { mounted, exiting } = usePresence(open, 150)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const close = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  // 打开后进入顶层并按触发器位置定位；滚动 / 缩放时跟随
  useLayoutEffect(() => {
    const list = listRef.current
    const anchor = triggerRef.current
    if (!mounted || !list || !anchor) return
    list.showPopover?.()

    const place = () => {
      const rect = anchor.getBoundingClientRect()
      const { offsetWidth: width, offsetHeight: height } = list
      const fitsBelow = rect.bottom + GAP + height <= innerHeight - VIEWPORT_MARGIN
      const fitsAbove = rect.top - GAP - height >= VIEWPORT_MARGIN
      const below = fitsBelow || !fitsAbove
      const left = align === 'end' ? rect.right - width : rect.left
      list.style.top = `${below ? rect.bottom + GAP : rect.top - GAP - height}px`
      list.style.left = `${Math.min(Math.max(VIEWPORT_MARGIN, left), innerWidth - width - VIEWPORT_MARGIN)}px`
      list.dataset.placement = below ? 'bottom' : 'top'
    }
    place()
    window.addEventListener('resize', place)
    document.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      document.removeEventListener('scroll', place, true)
      if (list.matches?.(':popover-open')) list.hidePopover()
    }
  }, [mounted, align])

  useEffect(() => {
    if (!open) return
    const items = listRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]')
    const selected = listRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')
    ;(selected ?? items?.[0])?.focus({ preventScroll: true })

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])
    const index = nodes.indexOf(document.activeElement as HTMLElement)
    const focusAt = (i: number) => nodes[(i + nodes.length) % nodes.length]?.focus()
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusAt(index + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusAt(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusAt(0)
        break
      case 'End':
        event.preventDefault()
        focusAt(nodes.length - 1)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close()
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className={styles.anchor}>
      {trigger(
        {
          ref: triggerRef,
          onClick: () => setOpen((v) => !v),
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': menuId,
        },
        open,
      )}
      {mounted && (
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          popover="manual"
          className={cx(styles.menu, exiting && styles.exiting)}
          onKeyDown={onKeyDown}
        >
          {items.map((item, i) => {
            const checked = item.value === value
            return (
              <button
                key={item.value}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={-1}
                className={cx(styles.item, checked && styles.checked)}
                style={{ animationDelay: `${i * 25}ms` }}
                onClick={() => {
                  onSelect(item.value)
                  close()
                }}
              >
                <Ripple />
                {item.icon && <Icon name={item.icon} size={20} className={styles.itemIcon} />}
                <span className={styles.itemLabel}>{item.label}</span>
                {checked && <Icon name="check" size={20} className={styles.check} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
