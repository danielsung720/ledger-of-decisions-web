import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// ============================================================
// Currency Formatting
// ============================================================

/**
 * Format amount as currency string
 */
export function formatCurrency(amount: number | string, currency = 'TWD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return '$0'
  }

  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount)
}

/**
 * Format amount as plain number with commas
 */
export function formatNumber(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return '0'
  }

  return new Intl.NumberFormat('zh-TW').format(numericAmount)
}

// ============================================================
// Date Formatting
// ============================================================

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr = 'yyyy/MM/dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: zhTW })
}

/**
 * Format date with weekday
 */
export function formatDateWithWeekday(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy/MM/dd (EEEE)', { locale: zhTW })
}

/**
 * Format date for API request (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhTW })
}

/**
 * Format date with smart display (Today, Yesterday, or date)
 */
export function formatSmartDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date

  if (isToday(dateObj)) {
    return `今日 ${format(dateObj, 'HH:mm')}`
  }

  if (isYesterday(dateObj)) {
    return `昨日 ${format(dateObj, 'HH:mm')}`
  }

  return format(dateObj, 'MM/dd HH:mm', { locale: zhTW })
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm')
}

// ============================================================
// Percentage Formatting
// ============================================================

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format change percentage with sign
 */
export function formatChangePercentage(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// ============================================================
// Trend Formatting
// ============================================================

export type TrendDirection = 'up' | 'down' | 'stable'

/**
 * Get trend direction from percentage change
 */
export function getTrendDirection(change: number): TrendDirection {
  if (change > 0) return 'up'
  if (change < 0) return 'down'
  return 'stable'
}

/**
 * Get trend color class
 */
export function getTrendColorClass(trend: TrendDirection, positiveIsGood = true): string {
  if (trend === 'stable') return 'text-warm-gray-500'

  const isPositive = trend === 'up'
  const isGood = positiveIsGood ? isPositive : !isPositive

  return isGood ? 'text-success-500' : 'text-alert-500'
}
