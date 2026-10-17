export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemePreferences {
  mode: ThemeMode
  seed: string
}

/** 可选的种子色；显示名称见各语言包 appearance.seeds */
export const SEED_COLORS = [
  '#4285f4',
  '#4d6bfe',
  '#34a853',
  '#00897b',
  '#f4511e',
  '#d81b60',
  '#8e24aa',
] as const

export const DEFAULT_THEME: ThemePreferences = {
  mode: 'system',
  seed: SEED_COLORS[0],
}
