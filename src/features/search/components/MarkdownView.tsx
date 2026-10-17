import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './MarkdownView.module.css'

const components: Components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
  img: ({ node, alt, ...props }) => (
    <img {...props} alt={alt ?? ''} loading="lazy" referrerPolicy="no-referrer" />
  ),
}

/** 渲染抓取到的 Markdown 正文（不允许原始 HTML） */
export function MarkdownView({ children }: { children: string }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
