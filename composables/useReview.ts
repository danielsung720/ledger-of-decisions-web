import type { SummaryStats, TrendsStats, DateRange } from '~/types'
import { useApiClient } from '~/utils/api'

export function useReview() {
  const api = useApiClient()

  const summary = ref<SummaryStats | null>(null)
  const trends = ref<TrendsStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const dateRange = ref<DateRange>({
    startDate: '',
    endDate: '',
    preset: 'this_month',
  })

  async function fetchSummary(params?: {
    preset?: string
    start_date?: string
    end_date?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await api.getSummary(params)
      summary.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch summary'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTrends() {
    loading.value = true
    error.value = null

    try {
      const response = await api.getTrends()
      trends.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch trends'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAll(params?: { preset?: string; start_date?: string; end_date?: string }) {
    loading.value = true
    error.value = null

    try {
      const [summaryRes, trendsRes] = await Promise.all([api.getSummary(params), api.getTrends()])

      summary.value = summaryRes.data
      trends.value = trendsRes.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch review data'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setDateRange(range: DateRange) {
    dateRange.value = range
  }

  return {
    // State
    summary,
    trends,
    loading,
    error,
    dateRange,

    // Actions
    fetchSummary,
    fetchTrends,
    fetchAll,
    setDateRange,
  }
}
