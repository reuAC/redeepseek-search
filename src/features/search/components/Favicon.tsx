import { useState } from 'react'
import { cx } from '@/lib/cx'
import styles from './Favicon.module.css'

export interface FaviconProps {
  src: string | null
  name: string
  size?: 'small' | 'large'
}

/** 站点图标；缺失或加载失败时回退为首字母 */
export function Favicon({ src, name, size = 'small' }: FaviconProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src && failedSrc !== src

  return (
    <span className={cx(styles.favicon, styles[size])} aria-hidden="true">
      {showImage ? (
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} />
      ) : (
        <span className={styles.letter}>{name.trim().charAt(0).toUpperCase() || '?'}</span>
      )}
    </span>
  )
}
