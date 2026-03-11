import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateWithWeekday,
  formatDateForApi,
  formatRelativeTime,
  formatSmartDate,
  formatTime,
  formatPercentage,
  formatChangePercentage,
  getTrendDirection,
  getTrendColorClass,
} from '~/utils/formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats number as TWD currency', () => {
      const result = formatCurrency(1500)
      expect(result).toBe('$1,500')
    })

    it('formats string amount as currency', () => {
      const result = formatCurrency('2500')
      expect(result).toBe('$2,500')
    })

    it('formats large numbers with thousand separators', () => {
      const result = formatCurrency(1234567)
      expect(result).toBe('$1,234,567')
    })

    it('formats zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toBe('$0')
    })

    it('returns $0 for NaN values', () => {
      const result = formatCurrency('invalid')
      expect(result).toBe('$0')
    })

    it('returns $0 for empty string', () => {
      const result = formatCurrency('')
      expect(result).toBe('$0')
    })

    it('formats decimal numbers without decimals', () => {
      const result = formatCurrency(1234.56)
      expect(result).toBe('$1,235')
    })
  })

  describe('formatNumber', () => {
    it('formats number with thousand separators', () => {
      const result = formatNumber(1234567)
      expect(result).toBe('1,234,567')
    })

    it('formats string number', () => {
      const result = formatNumber('9876')
      expect(result).toBe('9,876')
    })

    it('returns 0 for NaN values', () => {
      const result = formatNumber('invalid')
      expect(result).toBe('0')
    })

    it('formats zero correctly', () => {
      const result = formatNumber(0)
      expect(result).toBe('0')
    })
  })

  describe('formatDate', () => {
    it('formats Date object with default format', () => {
      const date = new Date(2024, 0, 15)
      const result = formatDate(date)
      expect(result).toBe('2024/01/15')
    })

    it('formats ISO string with default format', () => {
      const result = formatDate('2024-03-20')
      expect(result).toBe('2024/03/20')
    })

    it('formats date with custom format', () => {
      const date = new Date(2024, 5, 10)
      const result = formatDate(date, 'MM-dd')
      expect(result).toBe('06-10')
    })
  })

  describe('formatDateWithWeekday', () => {
    it('formats date with weekday in Chinese', () => {
      const date = new Date(2024, 0, 15) // Monday
      const result = formatDateWithWeekday(date)
      expect(result).toMatch(/2024\/01\/15/)
      expect(result).toContain('(')
      expect(result).toContain(')')
    })

    it('formats ISO string with weekday', () => {
      const result = formatDateWithWeekday('2024-01-14') // Sunday
      expect(result).toMatch(/2024\/01\/14/)
    })
  })

  describe('formatDateForApi', () => {
    it('formats date for API request', () => {
      const date = new Date(2024, 2, 15, 14, 30, 45)
      const result = formatDateForApi(date)
      expect(result).toBe('2024-03-15 14:30:45')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 2, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('formats recent time as relative', () => {
      const oneHourAgo = new Date(2024, 2, 15, 11, 0, 0)
      const result = formatRelativeTime(oneHourAgo)
      expect(result).toContain('1')
    })

    it('formats ISO string as relative time', () => {
      const result = formatRelativeTime('2024-03-15T10:00:00')
      expect(result).toBeTruthy()
    })
  })

  describe('formatSmartDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 2, 15, 14, 30, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('formats today as "今日" with time', () => {
      const today = new Date(2024, 2, 15, 10, 30, 0)
      const result = formatSmartDate(today)
      expect(result).toBe('今日 10:30')
    })

    it('formats yesterday as "昨日" with time', () => {
      const yesterday = new Date(2024, 2, 14, 15, 45, 0)
      const result = formatSmartDate(yesterday)
      expect(result).toBe('昨日 15:45')
    })

    it('formats older dates with month/day and time', () => {
      const olderDate = new Date(2024, 2, 10, 9, 15, 0)
      const result = formatSmartDate(olderDate)
      expect(result).toBe('03/10 09:15')
    })
  })

  describe('formatTime', () => {
    it('formats Date object to time string', () => {
      const date = new Date(2024, 2, 15, 14, 30, 0)
      const result = formatTime(date)
      expect(result).toBe('14:30')
    })

    it('formats ISO string to time', () => {
      const result = formatTime('2024-03-15T09:45:00')
      expect(result).toBe('09:45')
    })
  })

  describe('formatPercentage', () => {
    it('formats percentage with default decimals', () => {
      const result = formatPercentage(75.5678)
      expect(result).toBe('75.6%')
    })

    it('formats percentage with custom decimals', () => {
      const result = formatPercentage(33.3333, 2)
      expect(result).toBe('33.33%')
    })

    it('formats integer percentage', () => {
      const result = formatPercentage(50, 0)
      expect(result).toBe('50%')
    })
  })

  describe('formatChangePercentage', () => {
    it('formats positive change with plus sign', () => {
      const result = formatChangePercentage(15.5)
      expect(result).toBe('+15.5%')
    })

    it('formats negative change without extra sign', () => {
      const result = formatChangePercentage(-10.2)
      expect(result).toBe('-10.2%')
    })

    it('formats zero without sign', () => {
      const result = formatChangePercentage(0)
      expect(result).toBe('0.0%')
    })
  })

  describe('getTrendDirection', () => {
    it('returns "up" for positive change', () => {
      expect(getTrendDirection(10)).toBe('up')
    })

    it('returns "down" for negative change', () => {
      expect(getTrendDirection(-5)).toBe('down')
    })

    it('returns "stable" for zero change', () => {
      expect(getTrendDirection(0)).toBe('stable')
    })
  })

  describe('getTrendColorClass', () => {
    it('returns gray class for stable trend', () => {
      const result = getTrendColorClass('stable')
      expect(result).toBe('text-warm-gray-500')
    })

    it('returns success class for up trend when positive is good', () => {
      const result = getTrendColorClass('up', true)
      expect(result).toBe('text-success-500')
    })

    it('returns alert class for up trend when positive is bad', () => {
      const result = getTrendColorClass('up', false)
      expect(result).toBe('text-alert-500')
    })

    it('returns alert class for down trend when positive is good', () => {
      const result = getTrendColorClass('down', true)
      expect(result).toBe('text-alert-500')
    })

    it('returns success class for down trend when positive is bad', () => {
      const result = getTrendColorClass('down', false)
      expect(result).toBe('text-success-500')
    })
  })
})
