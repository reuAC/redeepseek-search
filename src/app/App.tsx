import { useEffect } from 'react'
import { startUsageTracking } from '@/features/usage'
import { useI18n } from '@/i18n'
import { HomePage } from '@/pages/HomePage/HomePage'
import { ResultsPage } from '@/pages/ResultsPage/ResultsPage'
import { pageOf, useRouter } from '@/router'

export function App() {
  const { route } = useRouter()
  const { m } = useI18n()
  const page = pageOf(route)

  useEffect(() => startUsageTracking(), [])

  useEffect(() => {
    document.title = route.q ? m.app.pageTitle(route.q) : m.app.name
  }, [route.q, m])

  return page === 'home' ? <HomePage /> : <ResultsPage />
}
