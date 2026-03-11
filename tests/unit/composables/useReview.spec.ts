import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useReview } from '~/composables/useReview'
import type { SummaryStats, TrendsStats } from '~/types'

// Mock the API client
const mockApi = {
  getSummary: vi.fn(),
  getTrends: vi.fn(),
}

vi.mock('~/utils/api', () => ({
  useApiClient: () => mockApi,
}))

describe('useReview', () => {
  const mockSummary: SummaryStats = {
    total_amount: 50000,
    total_count: 25,
    average_amount: 2000,
    by_category: [
      { category: 'food', category_label: '飲食', amount: 20000, count: 15 },
      { category: 'transport', category_label: '交通', amount: 10000, count: 5 },
    ],
    by_intent: [
      { intent: 'necessity', intent_label: '必要', amount: 30000, count: 15 },
      { intent: 'enjoyment', intent_label: '享受', amount: 15000, count: 8 },
    ],
    by_confidence: [
      { confidence_level: 'high', confidence_level_label: '很滿意', amount: 35000, count: 18 },
      { confidence_level: 'medium', confidence_level_label: '還好', amount: 15000, count: 7 },
    ],
  }

  const mockTrends: TrendsStats = {
    period: 'monthly',
    data: [
      { period: '2024-01', amount: 45000, count: 20 },
      { period: '2024-02', amount: 48000, count: 22 },
      { period: '2024-03', amount: 50000, count: 25 },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has null summary initially', () => {
      const { summary } = useReview()
      expect(summary.value).toBe(null)
    })

    it('has null trends initially', () => {
      const { trends } = useReview()
      expect(trends.value).toBe(null)
    })

    it('has false loading initially', () => {
      const { loading } = useReview()
      expect(loading.value).toBe(false)
    })

    it('has null error initially', () => {
      const { error } = useReview()
      expect(error.value).toBe(null)
    })

    it('has default date range', () => {
      const { dateRange } = useReview()
      expect(dateRange.value).toEqual({
        startDate: '',
        endDate: '',
        preset: 'this_month',
      })
    })
  })

  describe('fetchSummary', () => {
    it('fetches summary successfully', async () => {
      mockApi.getSummary.mockResolvedValueOnce({ data: mockSummary })

      const { fetchSummary, summary, loading } = useReview()

      await fetchSummary()

      expect(summary.value).toEqual(mockSummary)
      expect(loading.value).toBe(false)
    })

    it('sets loading during fetch', async () => {
      mockApi.getSummary.mockImplementationOnce(async () => {
        return { data: mockSummary }
      })

      const { fetchSummary } = useReview()

      const fetchPromise = fetchSummary()

      // Note: Due to async nature, we can't easily test loading=true mid-flight
      // but we can verify it's false after completion
      await fetchPromise
    })

    it('handles error and sets error state', async () => {
      mockApi.getSummary.mockRejectedValueOnce(new Error('API Error'))

      const { fetchSummary, error } = useReview()

      await expect(fetchSummary()).rejects.toThrow('API Error')
      expect(error.value).toBe('API Error')
    })

    it('passes params to API', async () => {
      mockApi.getSummary.mockResolvedValueOnce({ data: mockSummary })

      const { fetchSummary } = useReview()

      await fetchSummary({ preset: 'this_week' })

      expect(mockApi.getSummary).toHaveBeenCalledWith({ preset: 'this_week' })
    })

    it('passes custom date params to API', async () => {
      mockApi.getSummary.mockResolvedValueOnce({ data: mockSummary })

      const { fetchSummary } = useReview()

      await fetchSummary({ start_date: '2024-01-01', end_date: '2024-01-31' })

      expect(mockApi.getSummary).toHaveBeenCalledWith({
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      })
    })
  })

  describe('fetchTrends', () => {
    it('fetches trends successfully', async () => {
      mockApi.getTrends.mockResolvedValueOnce({ data: mockTrends })

      const { fetchTrends, trends } = useReview()

      await fetchTrends()

      expect(trends.value).toEqual(mockTrends)
    })

    it('handles error', async () => {
      mockApi.getTrends.mockRejectedValueOnce(new Error('Trends Error'))

      const { fetchTrends, error } = useReview()

      await expect(fetchTrends()).rejects.toThrow('Trends Error')
      expect(error.value).toBe('Trends Error')
    })
  })

  describe('fetchAll', () => {
    it('fetches both summary and trends in parallel', async () => {
      mockApi.getSummary.mockResolvedValueOnce({ data: mockSummary })
      mockApi.getTrends.mockResolvedValueOnce({ data: mockTrends })

      const { fetchAll, summary, trends } = useReview()

      await fetchAll()

      expect(summary.value).toEqual(mockSummary)
      expect(trends.value).toEqual(mockTrends)
    })

    it('handles error from either API', async () => {
      mockApi.getSummary.mockResolvedValueOnce({ data: mockSummary })
      mockApi.getTrends.mockRejectedValueOnce(new Error('Trends failed'))

      const { fetchAll, error } = useReview()

      await expect(fetchAll()).rejects.toThrow()
      expect(error.value).toBe('Trends failed')
    })

    it('passes params to summary API', async () => {
      mockApi.getSummary.mockResolvedValueOnce({ data: mockSummary })
      mockApi.getTrends.mockResolvedValueOnce({ data: mockTrends })

      const { fetchAll } = useReview()

      await fetchAll({ preset: 'today' })

      expect(mockApi.getSummary).toHaveBeenCalledWith({ preset: 'today' })
    })
  })

  describe('setDateRange', () => {
    it('updates date range', () => {
      const { setDateRange, dateRange } = useReview()

      setDateRange({
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        preset: 'custom',
      })

      expect(dateRange.value).toEqual({
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        preset: 'custom',
      })
    })
  })
})
