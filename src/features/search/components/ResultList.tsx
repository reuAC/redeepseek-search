import type { SearchResult } from '@/services/deepseek'
import { ResultItem } from './ResultItem'
import styles from './ResultList.module.css'

export interface ResultListProps {
  results: readonly SearchResult[]
  terms: readonly string[]
  onShowDetails: (result: SearchResult) => void
}

export function ResultList({ results, terms, onShowDetails }: ResultListProps) {
  return (
    <div className={styles.list}>
      {results.map((result, index) => (
        <ResultItem
          key={`${result.url}#${index}`}
          result={result}
          terms={terms}
          index={index}
          onShowDetails={onShowDetails}
        />
      ))}
    </div>
  )
}
