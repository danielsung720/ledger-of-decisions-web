import type { ApiResponse, SummaryStats } from '~/types'
import { useExpenses } from '~/composables/useExpenses'
import { useApiClient } from '~/utils/api'
import { useUiStore } from '~/stores/ui'
import type { Ref } from 'vue'

interface UseDashboardViewModelOptions {
  router?: { push: (path: string) => unknown }
  uiStore?: { openExpenseModal: () => void }
  api?: {
    getSummary: (params?: {
      preset?: string
      start_date?: string
      end_date?: string
    }) => Promise<ApiResponse<SummaryStats>>
  }
  expenseDataVersion?: Ref<number>
  autoLoad?: boolean
}

/**
 * Dashboard page view model that aggregates summary cards, recent expenses, and actions.
 */
export function useDashboardViewModel(options: UseDashboardViewModelOptions = {}) {
  const router = options.router ?? useRouter()
  const uiStore = options.uiStore ?? useUiStore()
  const api = options.api ?? useApiClient()
  const { expenses, loading: expensesLoading, fetchExpenses } = useExpenses()
  const expenseDataVersion =
    options.expenseDataVersion ?? useState<number>('expense-data-version', () => 0)

  const todaySummary = ref<SummaryStats | null>(null)
  const weekSummary = ref<SummaryStats | null>(null)
  const monthSummary = ref<SummaryStats | null>(null)
  const summaryLoading = ref(false)
  let latestLoadId = 0

  async function loadDashboardData() {
    const loadId = ++latestLoadId
    summaryLoading.value = true
    try {
      const [_expenses, todayRes, weekRes, monthRes] = await Promise.all([
        fetchExpenses({ preset: 'this_month', per_page: 5 }),
        api.getSummary({ preset: 'today' }),
        api.getSummary({ preset: 'this_week' }),
        api.getSummary({ preset: 'this_month' }),
      ])

      if (loadId !== latestLoadId) {
        return
      }

      todaySummary.value = todayRes.data
      weekSummary.value = weekRes.data
      monthSummary.value = monthRes.data
    } finally {
      if (loadId === latestLoadId) {
        summaryLoading.value = false
      }
    }
  }

  function handleAddExpense() {
    uiStore.openExpenseModal()
  }

  function handleViewAllRecords() {
    router.push('/records')
  }

  const totalAmount = computed(() => monthSummary.value?.total_amount ?? 0)
  const totalCount = computed(() => monthSummary.value?.total_count ?? 0)
  const impulseRatio = computed(() => monthSummary.value?.impulse_spending_ratio ?? 0)
  const intentStats = computed(() => monthSummary.value?.by_intent ?? [])
  const todayAmount = computed(() => todaySummary.value?.total_amount ?? 0)
  const todayCount = computed(() => todaySummary.value?.total_count ?? 0)
  const weekAmount = computed(() => weekSummary.value?.total_amount ?? 0)
  const weekCount = computed(() => weekSummary.value?.total_count ?? 0)
  const isLoading = computed(() => expensesLoading.value || summaryLoading.value)

  if (options.autoLoad !== false) {
    onMounted(() => {
      loadDashboardData()
    })

    watch(expenseDataVersion, () => {
      loadDashboardData()
    })
  }

  return {
    expenses,
    expensesLoading,
    totalAmount,
    totalCount,
    impulseRatio,
    intentStats,
    todayAmount,
    todayCount,
    weekAmount,
    weekCount,
    isLoading,
    loadDashboardData,
    handleAddExpense,
    handleViewAllRecords,
  }
}
