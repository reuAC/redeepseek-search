import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/motion'
import styles from './Ripple.module.css'

const MIN_PRESS_MS = 225

/**
 * MD3 状态层 + 波纹。放在任意 position: relative 的交互元素内部即可：
 * hover / focus / pressed 状态层由 CSS 处理，按压波纹由指针事件驱动。
 */
export function Ripple({ disabled = false }: { disabled?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const surface = ref.current
    const host = surface?.parentElement
    if (!surface || !host || disabled) return

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || prefersReducedMotion()) return
      const rect = host.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))

      const wave = document.createElement('span')
      wave.className = styles.wave
      Object.assign(wave.style, {
        left: `${x - radius}px`,
        top: `${y - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
      })
      surface.appendChild(wave)
      wave.animate([{ transform: 'scale(0.2)' }, { transform: 'scale(1)' }], {
        duration: 450,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        fill: 'forwards',
      })

      const pressedAt = performance.now()
      const release = () => {
        window.removeEventListener('pointerup', release)
        window.removeEventListener('pointercancel', release)
        const wait = Math.max(0, MIN_PRESS_MS - (performance.now() - pressedAt))
        setTimeout(() => {
          // 只给出终点关键帧：起点沿用 CSS 中的按压态透明度（10%），
          // 若写成 1 → 0 会让波纹瞬间变为不透明色块
          wave.animate({ opacity: 0 }, { duration: 375, easing: 'linear', fill: 'forwards' }).finished.then(
            () => wave.remove(),
            () => wave.remove(),
          )
        }, wait)
      }
      window.addEventListener('pointerup', release)
      window.addEventListener('pointercancel', release)
    }

    host.addEventListener('pointerdown', onPointerDown)
    return () => host.removeEventListener('pointerdown', onPointerDown)
  }, [disabled])

  return <span ref={ref} aria-hidden="true" className={styles.ripple} />
}
