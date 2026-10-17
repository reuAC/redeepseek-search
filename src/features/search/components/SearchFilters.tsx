import { useI18n } from '@/i18n'
import { Chip, Menu, type IconName, type MenuItem } from '@/ui'
import styles from './SearchFilters.module.css'

export interface FilterState {
  time: string
  lang: string
  sort: string
  refine: string
}

export interface SearchFiltersProps extends FilterState {
  onChange: (patch: Partial<FilterState>) => void
  onOpenAdvanced: () => void
}

interface FilterMenuProps {
  items: ReadonlyArray<MenuItem<string>>
  value: string
  /** 未选择时 chip 上的文案 */
  chipLabel: string
  /** 选中后 chip 上的文案；缺省时使用选中项的文案 */
  selectedChipLabel?: string
  icon: IconName
  onSelect: (value: string) => void
}

function FilterMenu({ items, value, chipLabel, selectedChipLabel, icon, onSelect }: FilterMenuProps) {
  const current = items.find((item) => item.value === value)
  return (
    <Menu
      items={items}
      value={value}
      onSelect={onSelect}
      trigger={(props, open) => (
        <Chip
          {...props}
          kind="filter"
          icon={icon}
          selected={Boolean(value)}
          trailingIcon="arrowDropDown"
          className={open ? styles.open : undefined}
        >
          {value ? (selectedChipLabel ?? current?.label ?? chipLabel) : chipLabel}
        </Chip>
      )}
    />
  )
}

/**
 * 结果页工具条。
 * - 时间 / 语言：转换为 after: / lang: 语法，由服务端过滤
 * - 排序 / 优质 / 权威：基于响应中的 date、rerank_score、authority 在客户端处理
 */
export function SearchFilters({ time, lang, sort, refine, onChange, onOpenAdvanced }: SearchFiltersProps) {
  const { m } = useI18n()
  const f = m.filters
  const active = Boolean(time || lang || sort || refine)

  const timeItems = [
    { value: '', label: f.time.any },
    { value: 'd', label: f.time.day },
    { value: 'w', label: f.time.week },
    { value: 'm', label: f.time.month },
    { value: 'y', label: f.time.year },
  ]
  const langItems = [
    { value: '', label: f.lang.any },
    { value: 'zh', label: f.lang.zh },
    { value: 'en', label: f.lang.en },
    { value: 'zh,en', label: f.lang.both },
  ]
  const sortItems = [
    { value: '', label: f.sort.relevance },
    { value: 'date', label: f.sort.date },
  ]
  const refineChips: ReadonlyArray<{ value: string; label: string; icon: IconName }> = [
    { value: 'quality', label: f.quality, icon: 'trending' },
    { value: 'authority', label: f.authority, icon: 'verified' },
  ]

  return (
    <div className={styles.filters} role="toolbar" aria-label={f.toolbar}>
      <FilterMenu
        items={timeItems}
        value={time}
        chipLabel={f.time.chip}
        icon="schedule"
        onSelect={(v) => onChange({ time: v })}
      />
      <FilterMenu
        items={langItems}
        value={lang}
        chipLabel={f.lang.chip}
        icon="translate"
        onSelect={(v) => onChange({ lang: v })}
      />
      <FilterMenu
        items={sortItems}
        value={sort}
        chipLabel={f.sort.relevanceChip}
        selectedChipLabel={f.sort.dateChip}
        icon="sort"
        onSelect={(v) => onChange({ sort: v })}
      />

      <span className={styles.divider} aria-hidden="true" />

      {refineChips.map((chip) => (
        <Chip
          key={chip.value}
          kind="filter"
          icon={chip.icon}
          selected={refine === chip.value}
          onClick={() => onChange({ refine: refine === chip.value ? '' : chip.value })}
        >
          {chip.label}
        </Chip>
      ))}

      <span className={styles.divider} aria-hidden="true" />

      <Chip icon="tune" onClick={onOpenAdvanced}>
        {f.advanced}
      </Chip>
      {active && (
        <Chip
          icon="close"
          className={styles.reset}
          onClick={() => onChange({ time: '', lang: '', sort: '', refine: '' })}
        >
          {f.clearAll}
        </Chip>
      )}
    </div>
  )
}
