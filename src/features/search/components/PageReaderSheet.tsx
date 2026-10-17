import { useI18n } from '@/i18n'
import { Button, SideSheet } from '@/ui'
import { useCopyLink } from '../hooks/useCopyLink'
import { PageContent } from './PageContent'
import styles from './PageReaderSheet.module.css'

export interface PageReaderSheetProps {
  url: string | null
  open: boolean
  onClose: () => void
}

/** 网页阅读模式：直接用 Fetch 接口抓取任意网址并以 Markdown 呈现 */
export function PageReaderSheet({ url, open, onClose }: PageReaderSheetProps) {
  const copyLink = useCopyLink()
  const { m } = useI18n()

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      headline={m.reader.title}
      actions={
        url && (
          <>
            <Button variant="filled" icon="openInNew" href={url} target="_blank" rel="noreferrer">
              {m.reader.openOriginal}
            </Button>
            <Button variant="outlined" icon="copy" onClick={() => copyLink(url)}>
              {m.common.copyLink}
            </Button>
          </>
        )
      }
    >
      {url && (
        <div className={styles.reader}>
          <a className={styles.url} href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
          <PageContent key={url} url={url} autoLoad />
        </div>
      )}
    </SideSheet>
  )
}
