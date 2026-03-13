import type { DateRangePreset, ImpulseTrendViewModel, Insight } from '~/types'
import { useDateRange } from '~/composables/useDateRange'
import { useRequestGate } from '~/composables/useRequestGate'
import { useReview } from '~/composables/useReview'
import { buildReviewInsights } from '~/utils/review-insights'
import type { Ref } from 'vue'

interface UseReviewViewModelOptions {
  expenseDataVersion?: Ref<number>
  autoLoad?: boolean
}

const REVIEW_STALE_WINDOW_MS = 60_000

/**
 * Review page view model that orchestrates statistics loading and derived UI state.
 */
export function useReviewViewModel(options: UseReviewViewModelOptions = {}) {
  const { summary, trends, loading, fetchAll } = useReview()
  const { preset, customStartDate, customEndDate, getApiParams, setPreset, setCustomRange } =
    useDateRange()
  const expenseDataVersion =
    options.expenseDataVersion ?? useState<number>('expense-data-version', () => 0)
  const requestGate = useRequestGate()

  async function loadData(force = false) {
    const params = getApiParams()
    const requestKey = JSON.stringify({
      page: 'review',
      version: expenseDataVersion.value,
      params,
    })

    try {
      await requestGate.run(requestKey, () => fetchAll(params), {
        staleWindowMs: REVIEW_STALE_WINDOW_MS,
        force,
      })
    } catch {
      // Error state is already handled in useReview.
    }
  }

  function handleDateRangeChange() {
    loadData()
  }

  function handlePresetUpdate(value: DateRangePreset) {
    setPreset(value)
  }

  function handleStartDateUpdate(value: string) {
    setCustomRange(value, customEndDate.value)
  }

  function handleEndDateUpdate(value: string) {
    setCustomRange(customStartDate.value, value)
  }

  const totalAmount = computed(() => summary.value?.total_amount ?? 0)
  const totalCount = computed(() => summary.value?.total_count ?? 0)
  const impulseRatio = computed(() => summary.value?.impulse_spending_ratio ?? 0)
  const intentStats = computed(() => summary.value?.by_intent ?? [])

  const impulseTrend = computed<ImpulseTrendViewModel | undefined>(() => {
    if (!trends.value?.impulse_spending) return undefined

    return {
      thisWeek: trends.value.impulse_spending.this_week,
      lastWeek: trends.value.impulse_spending.last_week,
      changePercentage: trends.value.impulse_spending.change_percentage,
      trend: trends.value.impulse_spending.trend,
    }
  })

  const confidenceData = computed(() => {
    const total = totalCount.value
    // Temporary estimate until backend exposes confidence-level distribution in statistics API.
    return {
      high: Math.floor(total * 0.6),
      medium: Math.floor(total * 0.3),
      low: Math.floor(total * 0.1),
    }
  })

  const insights = computed<Insight[]>(() => {
    return buildReviewInsights({
      impulseRatio: impulseRatio.value,
      impulseTrend: impulseTrend.value,
      highConfidenceIntents: trends.value?.high_confidence_intents ?? [],
    })
  })

  if (options.autoLoad !== false) {
    watchEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expenseDataVersion.value
      // Defer execution to avoid tracking date-range refs in this effect.
      void Promise.resolve().then(() => loadData(true))
    })
  }

  return {
    loading,
    preset,
    customStartDate,
    customEndDate,
    totalAmount,
    totalCount,
    impulseRatio,
    intentStats,
    impulseTrend,
    confidenceData,
    insights,
    loadData,
    handleDateRangeChange,
    handlePresetUpdate,
    handleStartDateUpdate,
    handleEndDateUpdate,
  }
}
