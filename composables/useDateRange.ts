import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns'
import type { DateRangePreset } from '~/types'

export interface DateRangeResult {
  startDate: string
  endDate: string
}

export function useDateRange() {
  const preset = ref<DateRangePreset>('this_month')
  const customStartDate = ref('')
  const customEndDate = ref('')

  const dateRange = computed<DateRangeResult>(() => {
    const today = new Date()

    switch (preset.value) {
      case 'today':
        return {
          startDate: format(startOfDay(today), 'yyyy-MM-dd'),
          endDate: format(endOfDay(today), 'yyyy-MM-dd'),
        }
      case 'this_week':
        return {
          startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        }
      case 'this_month':
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        }
      case 'custom':
        return {
          startDate: customStartDate.value,
          endDate: customEndDate.value,
        }
      default:
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        }
    }
  })

  function setPreset(value: DateRangePreset) {
    preset.value = value
  }

  function setCustomRange(startDate: string, endDate: string) {
    customStartDate.value = startDate
    customEndDate.value = endDate
    preset.value = 'custom'
  }

  function getApiParams() {
    if (preset.value === 'custom') {
      return {
        start_date: dateRange.value.startDate,
        end_date: dateRange.value.endDate,
      }
    }
    return {
      preset: preset.value,
    }
  }

  return {
    preset,
    customStartDate,
    customEndDate,
    dateRange,
    setPreset,
    setCustomRange,
    getApiParams,
  }
}
