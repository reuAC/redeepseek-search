import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/google-sans-flex/full.css'
import '@/theme/styles/tokens.css'
import '@/theme/styles/global.css'
import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
