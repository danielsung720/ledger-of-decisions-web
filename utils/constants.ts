import type { Category, ConfidenceLevel, Intent } from '~/types'
import type { IconKey } from '~/types/icon'
import type { DayOfWeek, FrequencyType } from '~/types/recurring-expense'
import type { CashFlowFrequencyType } from '~/types/cashflow'

// ============================================================
// Category Constants
// ============================================================

export const CATEGORY_OPTIONS: { value: Category; label: string; icon: IconKey }[] = [
  { value: 'food', label: '飲食', icon: 'utensils' },
  { value: 'transport', label: '交通', icon: 'car' },
  { value: 'training', label: '學習/訓練', icon: 'barbell' },
  { value: 'living', label: '生活', icon: 'home' },
  { value: 'other', label: '其他', icon: 'package' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORY_OPTIONS.map((opt) => [opt.value, opt])
) as Record<Category, { value: Category; label: string; icon: IconKey }>

// ============================================================
// Intent Constants
// ============================================================

export const INTENT_OPTIONS: {
  value: Intent
  label: string
  subLabel: string
  icon: IconKey
  color: string
  lightColor: string
}[] = [
  {
    value: 'necessity',
    label: '必要',
    subLabel: '支出',
    icon: 'circle-check',
    color: 'intent-necessity',
    lightColor: 'intent-necessity-light',
  },
  {
    value: 'efficiency',
    label: '效率',
    subLabel: '提升',
    icon: 'bolt',
    color: 'intent-efficiency',
    lightColor: 'intent-efficiency-light',
  },
  {
    value: 'enjoyment',
    label: '享受',
    subLabel: '生活',
    icon: 'sparkles',
    color: 'intent-enjoyment',
    lightColor: 'intent-enjoyment-light',
  },
  {
    value: 'recovery',
    label: '恢復',
    subLabel: '身心',
    icon: 'leaf',
    color: 'intent-recovery',
    lightColor: 'intent-recovery-light',
  },
  {
    value: 'impulse',
    label: '衝動',
    subLabel: '消費',
    icon: 'comet',
    color: 'intent-impulse',
    lightColor: 'intent-impulse-light',
  },
]

export const INTENT_MAP = Object.fromEntries(
  INTENT_OPTIONS.map((opt) => [opt.value, opt])
) as Record<Intent, (typeof INTENT_OPTIONS)[number]>

// Intent color hex values for charts
export const INTENT_COLORS: Record<Intent, string> = {
  necessity: '#7BA3C9',
  efficiency: '#E8B86D',
  enjoyment: '#D98971',
  recovery: '#9DBF9F',
  impulse: '#C9A3B8',
}

// ============================================================
// Confidence Level Constants
// ============================================================

export const CONFIDENCE_OPTIONS: {
  value: ConfidenceLevel
  label: string
  icon: IconKey
  color: string
  bgColor: string
  borderColor: string
}[] = [
  {
    value: 'high',
    label: '很滿意',
    icon: 'mood-smile',
    color: 'text-success-500',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-500',
  },
  {
    value: 'medium',
    label: '還好',
    icon: 'mood-neutral',
    color: 'text-warm-gray-700',
    bgColor: 'bg-cream-100',
    borderColor: 'border-warm-gray-500',
  },
  {
    value: 'low',
    label: '有點後悔',
    icon: 'mood-sad',
    color: 'text-alert-500',
    bgColor: 'bg-alert-50',
    borderColor: 'border-alert-500',
  },
]

export const CONFIDENCE_MAP = Object.fromEntries(
  CONFIDENCE_OPTIONS.map((opt) => [opt.value, opt])
) as Record<ConfidenceLevel, (typeof CONFIDENCE_OPTIONS)[number]>

// ============================================================
// Date Range Presets
// ============================================================

export const DATE_RANGE_PRESETS = [
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '本週' },
  { value: 'this_month', label: '本月' },
  { value: 'custom', label: '自訂' },
] as const

// ============================================================
// Sort Options
// ============================================================

export const SORT_OPTIONS = [
  { value: 'date_desc', label: '日期（新到舊）' },
  { value: 'date_asc', label: '日期（舊到新）' },
  { value: 'amount_desc', label: '金額（高到低）' },
  { value: 'amount_asc', label: '金額（低到高）' },
] as const

// ============================================================
// Pagination
// ============================================================

export const DEFAULT_PAGE_SIZE = 15
export const PAGE_SIZE_OPTIONS = [10, 15, 20, 50] as const

// ============================================================
// Frequency Type Constants
// ============================================================

export const FREQUENCY_TYPE_OPTIONS: { value: FrequencyType; label: string; icon: IconKey }[] = [
  { value: 'daily', label: '每日', icon: 'calendar' },
  { value: 'weekly', label: '每週', icon: 'calendar-week' },
  { value: 'monthly', label: '每月', icon: 'calendar-month' },
  { value: 'yearly', label: '每年', icon: 'chart-bar' },
]

export const FREQUENCY_TYPE_MAP = Object.fromEntries(
  FREQUENCY_TYPE_OPTIONS.map((opt) => [opt.value, opt])
) as Record<FrequencyType, { value: FrequencyType; label: string; icon: IconKey }>

// ============================================================
// Day of Week Constants
// ============================================================

export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string; shortLabel: string }[] = [
  { value: 0, label: '週日', shortLabel: '日' },
  { value: 1, label: '週一', shortLabel: '一' },
  { value: 2, label: '週二', shortLabel: '二' },
  { value: 3, label: '週三', shortLabel: '三' },
  { value: 4, label: '週四', shortLabel: '四' },
  { value: 5, label: '週五', shortLabel: '五' },
  { value: 6, label: '週六', shortLabel: '六' },
]

export const DAY_OF_WEEK_MAP = Object.fromEntries(
  DAY_OF_WEEK_OPTIONS.map((opt) => [opt.value, opt])
) as Record<DayOfWeek, { value: DayOfWeek; label: string; shortLabel: string }>

// ============================================================
// Month Constants
// ============================================================

export const MONTH_OPTIONS = [
  { value: 1, label: '一月' },
  { value: 2, label: '二月' },
  { value: 3, label: '三月' },
  { value: 4, label: '四月' },
  { value: 5, label: '五月' },
  { value: 6, label: '六月' },
  { value: 7, label: '七月' },
  { value: 8, label: '八月' },
  { value: 9, label: '九月' },
  { value: 10, label: '十月' },
  { value: 11, label: '十一月' },
  { value: 12, label: '十二月' },
] as const

// ============================================================
// Cash Flow Frequency Type Constants
// ============================================================

export const CASH_FLOW_FREQUENCY_TYPE_OPTIONS: {
  value: CashFlowFrequencyType
  label: string
  icon: IconKey
}[] = [
  { value: 'monthly', label: '每月', icon: 'calendar-month' },
  { value: 'yearly', label: '每年', icon: 'chart-bar' },
  { value: 'one_time', label: '一次性', icon: 'pin' },
]

export const CASH_FLOW_FREQUENCY_TYPE_MAP = Object.fromEntries(
  CASH_FLOW_FREQUENCY_TYPE_OPTIONS.map((opt) => [opt.value, opt])
) as Record<CashFlowFrequencyType, { value: CashFlowFrequencyType; label: string; icon: IconKey }>

// ============================================================
// Projection Month Options
// ============================================================

export const PROJECTION_MONTH_OPTIONS = [
  { value: 1, label: '1 個月' },
  { value: 3, label: '3 個月' },
  { value: 6, label: '6 個月' },
  { value: 12, label: '12 個月' },
] as const
