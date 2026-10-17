import {
  argbFromHex,
  Blend,
  DynamicScheme,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeTonalSpot,
  TonalPalette,
  Variant,
  type DynamicColor,
} from '@material/material-color-utilities'

/** MD3 颜色角色（与 --md-sys-color-* 一一对应） */
const ROLES = [
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'inversePrimary',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'background',
  'onBackground',
  'surface',
  'surfaceDim',
  'surfaceBright',
  'surfaceContainerLowest',
  'surfaceContainerLow',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'inverseSurface',
  'inverseOnSurface',
  'outline',
  'outlineVariant',
  'shadow',
  'scrim',
  'surfaceTint',
] as const

/** 应用自定义颜色：与种子色做 MD3 harmonize，保持整体色调和谐 */
const CUSTOM_COLORS = {
  highlight: '#d93025',
} as const

/**
 * 中性色调色板的色度。TonalSpot 默认约为 6 / 8，会让背景与容器带明显的蓝紫色调；
 * 搜索页以阅读为主，采用接近无彩的中性色（与 Google 搜索的灰阶一致）。
 */
const NEUTRAL_CHROMA = 1.5
const NEUTRAL_VARIANT_CHROMA = 3

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

export type CssVariables = Record<`--${string}`, string>

export function createSchemeVariables(seedHex: string, isDark: boolean): CssVariables {
  const seed = argbFromHex(seedHex)
  const seedHct = Hct.fromInt(seed)
  const base = new SchemeTonalSpot(seedHct, isDark, 0, '2021')
  const scheme = new DynamicScheme({
    sourceColorHct: seedHct,
    variant: Variant.TONAL_SPOT,
    contrastLevel: 0,
    isDark,
    specVersion: '2021',
    primaryPalette: base.primaryPalette,
    secondaryPalette: base.secondaryPalette,
    tertiaryPalette: base.tertiaryPalette,
    errorPalette: base.errorPalette,
    neutralPalette: TonalPalette.fromHueAndChroma(seedHct.hue, NEUTRAL_CHROMA),
    neutralVariantPalette: TonalPalette.fromHueAndChroma(seedHct.hue, NEUTRAL_VARIANT_CHROMA),
  })
  const vars: CssVariables = {}

  for (const role of ROLES) {
    const color = (MaterialDynamicColors as unknown as Record<string, DynamicColor>)[role]
    vars[`--md-sys-color-${kebab(role)}`] = hexFromArgb(color.getArgb(scheme))
  }

  // 浅色模式下页面背景使用纯白（surface-container-lowest），与 Google 的 MD3 网页产品一致
  if (!isDark) {
    const white = vars['--md-sys-color-surface-container-lowest']
    vars['--md-sys-color-surface'] = white
    vars['--md-sys-color-background'] = white
    vars['--md-sys-color-surface-bright'] = white
  }

  // 链接色：保留种子色的色相与饱和度（TonalSpot 的 primary 偏灰，不利于识别可点击标题）
  const link = Hct.from(seedHct.hue, Math.max(seedHct.chroma, 48), isDark ? 80 : 40)
  vars['--app-color-link'] = hexFromArgb(link.toInt())

  for (const [name, hex] of Object.entries(CUSTOM_COLORS)) {
    const harmonized = Hct.fromInt(Blend.harmonize(argbFromHex(hex), seed))
    harmonized.tone = isDark ? 80 : 45
    vars[`--app-color-${kebab(name)}`] = hexFromArgb(harmonized.toInt())
  }

  return vars
}
