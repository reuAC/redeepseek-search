import { useMemo } from 'react'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export interface HighlightProps {
  text: string
  terms: readonly string[]
  className?: string
}

/** 把文本中命中的搜索词渲染为 <mark> */
export function Highlight({ text, terms, className }: HighlightProps) {
  const parts = useMemo(() => {
    if (!terms.length) return [text]
    const pattern = [...terms]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|')
    return text.split(new RegExp(`(${pattern})`, 'gi'))
  }, [text, terms])

  const lowered = useMemo(() => new Set(terms.map((t) => t.toLowerCase())), [terms])

  return parts.map((part, i) =>
    lowered.has(part.toLowerCase()) ? (
      <mark key={i} className={className}>
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
