import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const fetchExpensesMock = vi.fn().mockResolvedValue(undefined)
const openExpenseModalMock = vi.fn()
const routerPushMock = vi.fn()

const expensesRef = ref([
  { id: 1, amount: '100.00' },
  { id: 2, amount: '200.00' },
])

const getSummaryMock = vi.fn()

vi.mock('~/composables/useExpenses', () => ({
  useExpenses: () => ({
    expenses: expensesRef,
    loading: ref(false),
    fetchExpenses: fetchExpensesMock,
  }),
}))

vi.mock('~/utils/api', () => ({
  useApiClient: () => ({
    getSummary: getSummaryMock,
  }),
}))

vi.mock('~/stores/ui', () => ({
  useUiStore: () => ({
    openExpenseModal: openExpenseModalMock,
  }),
}))

describe('useDashboardViewModel', () => {
  function createDeferred<T>() {
    let resolve!: (value: T) => void
    let reject!: (reason?: unknown) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    getSummaryMock
      .mockResolvedValueOnce({
        data: {
          total_amount: 100,
          total_count: 1,
          impulse_spending_ratio: 10,
          by_category: [],
          by_intent: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          total_amount: 300,
          total_count: 3,
          impulse_spending_ratio: 15,
          by_category: [],
          by_intent: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          total_amount: 1200,
          total_count: 10,
          impulse_spending_ratio: 12.5,
          by_category: [],
          by_intent: [{ intent: 'necessity', intent_label: '必要', total_amount: 800, count: 6 }],
        },
      })
  })

  it('loads dashboard statistics on init', async () => {
    const { useDashboardViewModel } = await import('~/composables/useDashboardViewModel')
    const vm = useDashboardViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
      router: { push: routerPushMock },
      uiStore: { openExpenseModal: openExpenseModalMock },
    })

    await vm.loadDashboardData()

    expect(fetchExpensesMock).toHaveBeenCalledWith({ preset: 'this_month', per_page: 5 })
    expect(getSummaryMock).toHaveBeenCalledTimes(3)
    expect(getSummaryMock).toHaveBeenNthCalledWith(1, { preset: 'today' })
    expect(getSummaryMock).toHaveBeenNthCalledWith(2, { preset: 'this_week' })
    expect(getSummaryMock).toHaveBeenNthCalledWith(3, { preset: 'this_month' })
    expect(vm.totalAmount.value).toBe(1200)
    expect(vm.totalCount.value).toBe(10)
    expect(vm.impulseRatio.value).toBe(12.5)
    expect(vm.todayAmount.value).toBe(100)
    expect(vm.weekAmount.value).toBe(300)
  })

  it('supports injecting api client via options', async () => {
    const injectedGetSummary = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          total_amount: 11,
          total_count: 1,
          impulse_spending_ratio: 10,
          by_category: [],
          by_intent: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          total_amount: 22,
          total_count: 2,
          impulse_spending_ratio: 20,
          by_category: [],
          by_intent: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          total_amount: 33,
          total_count: 3,
          impulse_spending_ratio: 30,
          by_category: [],
          by_intent: [],
        },
      })

    const { useDashboardViewModel } = await import('~/composables/useDashboardViewModel')
    const vm = useDashboardViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
      router: { push: routerPushMock },
      uiStore: { openExpenseModal: openExpenseModalMock },
      api: { getSummary: injectedGetSummary },
    })

    await vm.loadDashboardData()

    expect(injectedGetSummary).toHaveBeenCalledTimes(3)
    expect(injectedGetSummary).toHaveBeenNthCalledWith(1, { preset: 'today' })
    expect(injectedGetSummary).toHaveBeenNthCalledWith(2, { preset: 'this_week' })
    expect(injectedGetSummary).toHaveBeenNthCalledWith(3, { preset: 'this_month' })
    expect(getSummaryMock).not.toHaveBeenCalled()
    expect(vm.todayAmount.value).toBe(11)
    expect(vm.weekAmount.value).toBe(22)
    expect(vm.totalAmount.value).toBe(33)
  })

  it('delegates add-expense and view-all actions', async () => {
    const { useDashboardViewModel } = await import('~/composables/useDashboardViewModel')
    const vm = useDashboardViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
      router: { push: routerPushMock },
      uiStore: { openExpenseModal: openExpenseModalMock },
    })

    vm.handleAddExpense()
    vm.handleViewAllRecords()

    expect(openExpenseModalMock).toHaveBeenCalledTimes(1)
    expect(routerPushMock).toHaveBeenCalledWith('/records')
  })

  it('exposes intent stats and expenses list for widgets', async () => {
    const { useDashboardViewModel } = await import('~/composables/useDashboardViewModel')
    const vm = useDashboardViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
      router: { push: routerPushMock },
      uiStore: { openExpenseModal: openExpenseModalMock },
    })

    await vm.loadDashboardData()

    expect(vm.expenses.value).toHaveLength(2)
    expect(vm.intentStats.value).toHaveLength(1)
    expect(vm.isLoading.value).toBe(false)
  })

  it('restores loading state when summary API fails', async () => {
    getSummaryMock.mockReset()
    getSummaryMock.mockRejectedValueOnce(new Error('summary failed'))

    const { useDashboardViewModel } = await import('~/composables/useDashboardViewModel')
    const vm = useDashboardViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
      router: { push: routerPushMock },
      uiStore: { openExpenseModal: openExpenseModalMock },
    })

    await expect(vm.loadDashboardData()).rejects.toThrow('summary failed')
    expect(vm.isLoading.value).toBe(false)
  })

  it('keeps latest dashboard result when concurrent loads resolve out of order', async () => {
    getSummaryMock.mockReset()

    const firstToday = createDeferred<{
      data: {
        total_amount: number
        total_count: number
        impulse_spending_ratio: number
        by_category: []
        by_intent: []
      }
    }>()
    const firstWeek = createDeferred<{
      data: {
        total_amount: number
        total_count: number
        impulse_spending_ratio: number
        by_category: []
        by_intent: []
      }
    }>()
    const firstMonth = createDeferred<{
      data: {
        total_amount: number
        total_count: number
        impulse_spending_ratio: number
        by_category: []
        by_intent: []
      }
    }>()

    const secondToday = createDeferred<{
      data: {
        total_amount: number
        total_count: number
        impulse_spending_ratio: number
        by_category: []
        by_intent: []
      }
    }>()
    const secondWeek = createDeferred<{
      data: {
        total_amount: number
        total_count: number
        impulse_spending_ratio: number
        by_category: []
        by_intent: []
      }
    }>()
    const secondMonth = createDeferred<{
      data: {
        total_amount: number
        total_count: number
        impulse_spending_ratio: number
        by_category: []
        by_intent: []
      }
    }>()

    getSummaryMock
      .mockImplementationOnce(() => firstToday.promise)
      .mockImplementationOnce(() => firstWeek.promise)
      .mockImplementationOnce(() => firstMonth.promise)
      .mockImplementationOnce(() => secondToday.promise)
      .mockImplementationOnce(() => secondWeek.promise)
      .mockImplementationOnce(() => secondMonth.promise)

    const { useDashboardViewModel } = await import('~/composables/useDashboardViewModel')
    const vm = useDashboardViewModel({
      autoLoad: false,
      expenseDataVersion: ref(0),
      router: { push: routerPushMock },
      uiStore: { openExpenseModal: openExpenseModalMock },
    })

    const firstLoad = vm.loadDashboardData()
    const secondLoad = vm.loadDashboardData()

    secondToday.resolve({
      data: {
        total_amount: 101,
        total_count: 1,
        impulse_spending_ratio: 11,
        by_category: [],
        by_intent: [],
      },
    })
    secondWeek.resolve({
      data: {
        total_amount: 202,
        total_count: 2,
        impulse_spending_ratio: 22,
        by_category: [],
        by_intent: [],
      },
    })
    secondMonth.resolve({
      data: {
        total_amount: 303,
        total_count: 3,
        impulse_spending_ratio: 33,
        by_category: [],
        by_intent: [],
      },
    })

    await secondLoad

    firstToday.resolve({
      data: {
        total_amount: 999,
        total_count: 9,
        impulse_spending_ratio: 99,
        by_category: [],
        by_intent: [],
      },
    })
    firstWeek.resolve({
      data: {
        total_amount: 999,
        total_count: 9,
        impulse_spending_ratio: 99,
        by_category: [],
        by_intent: [],
      },
    })
    firstMonth.resolve({
      data: {
        total_amount: 999,
        total_count: 9,
        impulse_spending_ratio: 99,
        by_category: [],
        by_intent: [],
      },
    })

    await firstLoad

    expect(vm.todayAmount.value).toBe(101)
    expect(vm.weekAmount.value).toBe(202)
    expect(vm.totalAmount.value).toBe(303)
    expect(vm.totalCount.value).toBe(3)
    expect(vm.impulseRatio.value).toBe(33)
  })
})
