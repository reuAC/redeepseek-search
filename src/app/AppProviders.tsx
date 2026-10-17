import type { ReactNode } from 'react'
import { SettingsProvider } from '@/features/settings'
import { I18nProvider } from '@/i18n'
import { RouterProvider } from '@/router'
import { ThemeProvider } from '@/theme'
import { SnackbarProvider } from '@/ui'

/** 全局 Provider 组合：语言 → 主题 → 消息条 → 路由 → 设置（设置对话框依赖消息条与语言） */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <SnackbarProvider>
          <RouterProvider>
            <SettingsProvider>{children}</SettingsProvider>
          </RouterProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}
