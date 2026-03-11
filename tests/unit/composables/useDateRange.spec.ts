import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDateRange } from '~/composables/useDateRange'

describe('useDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 2, 15)) // March 15, 2024 (Friday)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('defaults to this_month preset', () => {
      const { preset } = useDateRange()
      expect(preset.value).toBe('this_month')
    })

    it('has empty custom dates initially', () => {
      const { customStartDate, customEndDate } = useDateRange()
      expect(customStartDate.value).toBe('')
      expect(customEndDate.value).toBe('')
    })
  })

  describe('dateRange computed', () => {
    it('returns today range for today preset', () => {
      const { preset, dateRange } = useDateRange()

      preset.value = 'today'

      expect(dateRange.value.startDate).toBe('2024-03-15')
      expect(dateRange.value.endDate).toBe('2024-03-15')
    })

    it('returns this week range for this_week preset', () => {
      const { preset, dateRange } = useDateRange()

      preset.value = 'this_week'

      // Week starts on Monday (weekStartsOn: 1)
      expect(dateRange.value.startDate).toBe('2024-03-11') // Monday
      expect(dateRange.value.endDate).toBe('2024-03-17') // Sunday
    })

    it('returns this month range for this_month preset', () => {
      const { dateRange } = useDateRange()

      expect(dateRange.value.startDate).toBe('2024-03-01')
      expect(dateRange.value.endDate).toBe('2024-03-31')
    })

    it('returns custom dates for custom preset', () => {
      const { preset, customStartDate, customEndDate, dateRange } = useDateRange()

      customStartDate.value = '2024-01-01'
      customEndDate.value = '2024-01-31'
      preset.value = 'custom'

      expect(dateRange.value.startDate).toBe('2024-01-01')
      expect(dateRange.value.endDate).toBe('2024-01-31')
    })

    it('defaults to this_month for unknown preset', () => {
      const { preset, dateRange } = useDateRange()

      // @ts-expect-error - testing invalid preset
      preset.value = 'unknown'

      expect(dateRange.value.startDate).toBe('2024-03-01')
      expect(dateRange.value.endDate).toBe('2024-03-31')
    })
  })

  describe('setPreset', () => {
    it('changes preset value', () => {
      const { preset, setPreset } = useDateRange()

      setPreset('today')

      expect(preset.value).toBe('today')
    })
  })

  describe('setCustomRange', () => {
    it('sets custom dates and switches to custom preset', () => {
      const { preset, customStartDate, customEndDate, setCustomRange } = useDateRange()

      setCustomRange('2024-02-01', '2024-02-29')

      expect(customStartDate.value).toBe('2024-02-01')
      expect(customEndDate.value).toBe('2024-02-29')
      expect(preset.value).toBe('custom')
    })
  })

  describe('getApiParams', () => {
    it('returns preset param for non-custom preset', () => {
      const { setPreset, getApiParams } = useDateRange()

      setPreset('today')

      expect(getApiParams()).toEqual({ preset: 'today' })
    })

    it('returns date params for custom preset', () => {
      const { setCustomRange, getApiParams } = useDateRange()

      setCustomRange('2024-01-01', '2024-01-31')

      expect(getApiParams()).toEqual({
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      })
    })

    it('returns this_week params correctly', () => {
      const { setPreset, getApiParams } = useDateRange()

      setPreset('this_week')

      expect(getApiParams()).toEqual({ preset: 'this_week' })
    })

    it('returns this_month params correctly', () => {
      const { getApiParams } = useDateRange()

      expect(getApiParams()).toEqual({ preset: 'this_month' })
    })
  })
})
