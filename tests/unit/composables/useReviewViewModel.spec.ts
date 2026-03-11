import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const fetchAllMock = vi.fn().mockResolvedValue(undefined)
const getApiParamsMock = vi.fn(() => ({ preset: 'this_month' }))
const setPresetMock = vi.fn()
const setCustomRangeMock = vi.fn()

const summaryRef = ref({
  total_amount: 1200,
  total_count: 10,
  impulse_spending_ratio: 12.5,
  by_category: [],
  by_intent: [{ intent: 'necessity', intent_label: '必要', total_amount: 800, count: 6 }],
})

const trendsRef = ref({
  impulse_spending: {
    this_week: 200,
    last_week: 300,
    change_percentage: -33.33,
    trend: 'down' as const,
  },
  high_confidence_intents: [{ intent: 'necessity', intent_label: '必要', count: 4 }],
})

vi.mock('~/composables/useReview', () => ({
  useReview: () => ({
    summary: summaryRef,
    trends: trendsRef,
    loading: ref(false),
    fetchAll: fetchAllMock,
  }),
}))

vi.mock('~/composables/useDateRange', () => ({
  useDateRange: () => ({
    preset: ref('this_month'),
    customStartDate: ref('2026-02-01'),
    customEndDate: ref('2026-02-28'),
    getApiParams: getApiParamsMock,
    setPreset: setPresetMock,
    setCustomRange: setCustomRangeMock,
  }),
}))

describe('useReviewViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    summaryRef.value = {
      total_amount: 1200,
      total_count: 10,
      impulse_spending_ratio: 12.5,
      by_category: [],
      by_intent: [{ intent: 'necessity', intent_label: '必要', total_amount: 800, count: 6 }],
    }
    trendsRef.value = {
      impulse_spending: {
        this_week: 200,
        last_week: 300,
        change_percentage: -33.33,
        trend: 'down',
      },
      high_confidence_intents: [{ intent: 'necessity', intent_label: '必要', count: 4 }],
    }
    fetchAllMock.mockResolvedValue(undefined)
    getApiParamsMock.mockReturnValue({ preset: 'this_month' })
  })

  it('loads data on init and passes API params', async () => {
    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    await vm.loadData()

    expect(getApiParamsMock).toHaveBeenCalledTimes(1)
    expect(fetchAllMock).toHaveBeenCalledWith({ preset: 'this_month' })
  })

  it('exposes summary/trends derived view state', async () => {
    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    expect(vm.totalAmount.value).toBe(1200)
    expect(vm.totalCount.value).toBe(10)
    expect(vm.impulseRatio.value).toBe(12.5)
    expect(vm.intentStats.value).toHaveLength(1)
    expect(vm.impulseTrend.value?.trend).toBe('down')
    expect(vm.confidenceData.value).toEqual({
      high: 6,
      medium: 3,
      low: 1,
    })
  })

  it('updates date range actions through date-range composable', async () => {
    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    vm.handlePresetUpdate('today')
    vm.handleStartDateUpdate('2026-02-10')
    vm.handleEndDateUpdate('2026-02-20')
    vm.handleDateRangeChange()

    expect(setPresetMock).toHaveBeenCalledWith('today')
    expect(setCustomRangeMock).toHaveBeenCalledWith('2026-02-10', '2026-02-28')
    expect(setCustomRangeMock).toHaveBeenCalledWith('2026-02-01', '2026-02-20')
    expect(fetchAllMock).toHaveBeenCalledTimes(1)
  })

  it('builds insights from trend and high-confidence intent', async () => {
    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })
    const insightTitles = vm.insights.value.map((insight) => insight.title)

    expect(insightTitles).toContain('衝動消費趨勢向下')
    expect(insightTitles.some((title) => title.includes('最常見的高信心決策'))).toBe(true)
  })

  it('builds warning insight when impulse ratio is high', async () => {
    summaryRef.value = {
      ...summaryRef.value,
      impulse_spending_ratio: 25,
    }
    trendsRef.value = {
      impulse_spending: {
        this_week: 200,
        last_week: 200,
        change_percentage: 0,
        trend: 'stable',
      },
      high_confidence_intents: [],
    }

    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    expect(vm.insights.value.some((item) => item.title === '衝動消費偏高')).toBe(true)
  })

  it('builds fallback insight when no trend and no high-confidence data', async () => {
    summaryRef.value = {
      ...summaryRef.value,
      impulse_spending_ratio: 15,
    }
    trendsRef.value = {
      impulse_spending: {
        this_week: 0,
        last_week: 0,
        change_percentage: 0,
        trend: 'stable',
      },
      high_confidence_intents: [],
    }

    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    expect(vm.insights.value).toHaveLength(1)
    expect(vm.insights.value[0]?.id).toBe('keep-tracking-spending')
    expect(vm.insights.value[0]?.title).toBe('持續記錄你的消費')
  })

  it('returns undefined impulseTrend when trends is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trendsRef.value = null as any

    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    expect(vm.impulseTrend.value).toBeUndefined()
  })

  it('handles impulse ratio boundary values at 10 and 20', async () => {
    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')

    summaryRef.value = {
      ...summaryRef.value,
      impulse_spending_ratio: 10,
    }
    let vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })
    expect(vm.insights.value.some((item) => item.id === 'high-impulse-warning')).toBe(false)
    expect(vm.insights.value.some((item) => item.id === 'low-impulse-success')).toBe(false)

    summaryRef.value = {
      ...summaryRef.value,
      impulse_spending_ratio: 20,
    }
    vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })
    expect(vm.insights.value.some((item) => item.id === 'high-impulse-warning')).toBe(false)
    expect(vm.insights.value.some((item) => item.id === 'low-impulse-success')).toBe(false)
  })

  it('handles empty highConfidenceIntents array', async () => {
    trendsRef.value = {
      impulse_spending: {
        this_week: 100,
        last_week: 100,
        change_percentage: 0,
        trend: 'stable',
      },
      high_confidence_intents: [],
    }

    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    expect(vm.insights.value.some((item) => item.id === 'top-high-confidence-intent')).toBe(false)
  })

  it('calculates zero confidenceData when totalCount is zero', async () => {
    summaryRef.value = {
      ...summaryRef.value,
      total_count: 0,
    }

    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    expect(vm.confidenceData.value).toEqual({
      high: 0,
      medium: 0,
      low: 0,
    })
  })

  it('swallows loadData error from fetchAll', async () => {
    fetchAllMock.mockRejectedValueOnce(new Error('fetch failed'))

    const { useReviewViewModel } = await import('~/composables/useReviewViewModel')
    const vm = useReviewViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
    })

    await expect(vm.loadData()).resolves.toBeUndefined()
  })
})
