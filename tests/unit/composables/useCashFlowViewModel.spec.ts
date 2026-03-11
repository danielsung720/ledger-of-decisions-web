import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { Income, CashFlowItem } from '~/types/cashflow'

const fetchIncomesMock = vi.fn().mockResolvedValue(undefined)
const fetchCashFlowItemsMock = vi.fn().mockResolvedValue(undefined)
const fetchSummaryMock = vi.fn().mockResolvedValue(undefined)
const fetchProjectionMock = vi.fn().mockResolvedValue(undefined)
const confirmDeleteIncomeMock = vi.fn()
const confirmDeleteCashFlowItemMock = vi.fn()
const setSelectedMonthsMock = vi.fn()
const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})

const incomesRef = ref([{ id: 1, name: '薪資' }])
const cashFlowItemsRef = ref([{ id: 11, name: '房租' }])
const summaryRef = ref({
  total_income: '100000.00',
  total_expense: '45000.00',
  net_cash_flow: '55000.00',
  savings_rate: '55.00',
})
const projectionsRef = ref([
  {
    month: '2026-02',
    income: '100000.00',
    expense: '45000.00',
    net: '55000.00',
    cumulative_balance: '55000.00',
  },
])
const loadingRef = ref(false)
const selectedMonthsRef = ref(1)

vi.mock('~/composables/useCashFlow', () => ({
  useCashFlow: () => ({
    incomes: incomesRef,
    cashFlowItems: cashFlowItemsRef,
    summary: summaryRef,
    projections: projectionsRef,
    selectedMonths: selectedMonthsRef,
    loading: loadingRef,
    fetchIncomes: fetchIncomesMock,
    fetchCashFlowItems: fetchCashFlowItemsMock,
    fetchSummary: fetchSummaryMock,
    fetchProjection: fetchProjectionMock,
    confirmDeleteIncome: confirmDeleteIncomeMock,
    confirmDeleteCashFlowItem: confirmDeleteCashFlowItemMock,
    setSelectedMonths: (months: number) => {
      setSelectedMonthsMock(months)
      selectedMonthsRef.value = months
    },
  }),
}))

describe('useCashFlowViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    selectedMonthsRef.value = 1
  })

  it('loads cashflow page data with list page-size guardrail', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    await vm.loadData()

    expect(fetchIncomesMock).toHaveBeenCalledWith({ per_page: 100 })
    expect(fetchCashFlowItemsMock).toHaveBeenCalledWith({ per_page: 100 })
    expect(fetchSummaryMock).toHaveBeenCalledTimes(1)
    expect(fetchProjectionMock).toHaveBeenCalledWith(1)
  })

  it('normalizes invalid initial selectedMonths before loadData projection call', async () => {
    const customSelectedMonths = ref(99)
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false, selectedMonths: customSelectedMonths })

    await vm.loadData()

    expect(customSelectedMonths.value).toBe(12)
    expect(vm.localSelectedMonths.value).toBe(12)
    expect(fetchProjectionMock).toHaveBeenCalledWith(12)
  })

  it('updates month selection and reloads projection', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    await vm.handleMonthChange(6)

    expect(vm.localSelectedMonths.value).toBe(6)
    expect(setSelectedMonthsMock).toHaveBeenCalledWith(6)
    expect(fetchProjectionMock).toHaveBeenCalledWith(6)
  })

  it('keeps deterministic state when projection reload fails on month change', async () => {
    fetchProjectionMock.mockRejectedValueOnce(new Error('projection-failed'))

    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    await expect(vm.handleMonthChange(99)).rejects.toThrow('projection-failed')

    expect(vm.localSelectedMonths.value).toBe(12)
    expect(setSelectedMonthsMock).toHaveBeenCalledWith(12)
  })

  it('normalizes invalid month selection before syncing state and fetching projection', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    await vm.handleMonthChange(0)

    expect(vm.localSelectedMonths.value).toBe(1)
    expect(setSelectedMonthsMock).toHaveBeenCalledWith(1)
    expect(fetchProjectionMock).toHaveBeenCalledWith(1)
  })

  it('opens edit modal with selected income id', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    vm.handleEditIncome({ id: 88 } as Income)

    expect(vm.showIncomeModal.value).toBe(true)
    expect(vm.editingIncomeId.value).toBe(88)
  })

  it('opens edit expense modal with selected item id', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    vm.handleEditExpense({ id: 66 } as CashFlowItem)

    expect(vm.showExpenseModal.value).toBe(true)
    expect(vm.editingExpenseId.value).toBe(66)
  })

  it('triggers reload after confirming income delete', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    vm.handleDeleteIncome({ id: 3 } as Income)
    const callback = confirmDeleteIncomeMock.mock.calls[0]?.[1] as (() => void) | undefined
    expect(confirmDeleteIncomeMock).toHaveBeenCalledWith(3, expect.any(Function))

    callback?.()
    await Promise.resolve()

    expect(fetchIncomesMock).toHaveBeenCalledWith({ per_page: 100 })
    expect(fetchCashFlowItemsMock).toHaveBeenCalledWith({ per_page: 100 })
  })

  it('triggers reload after confirming expense delete', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    vm.handleDeleteExpense({ id: 9 } as CashFlowItem)
    const callback = confirmDeleteCashFlowItemMock.mock.calls[0]?.[1] as (() => void) | undefined
    expect(confirmDeleteCashFlowItemMock).toHaveBeenCalledWith(9, expect.any(Function))

    callback?.()
    await Promise.resolve()

    expect(fetchIncomesMock).toHaveBeenCalledWith({ per_page: 100 })
    expect(fetchCashFlowItemsMock).toHaveBeenCalledWith({ per_page: 100 })
  })

  it('resets expense modal state on close', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    vm.handleEditExpense({ id: 19 } as CashFlowItem)
    vm.handleExpenseModalClose()

    expect(vm.showExpenseModal.value).toBe(false)
    expect(vm.editingExpenseId.value).toBe(null)
  })

  it('reloads data after expense modal saved', async () => {
    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    vm.handleExpenseModalSaved()
    await Promise.resolve()

    expect(fetchIncomesMock).toHaveBeenCalledWith({ per_page: 100 })
    expect(fetchCashFlowItemsMock).toHaveBeenCalledWith({ per_page: 100 })
  })

  it('catches and logs reload errors for fire-and-forget handlers', async () => {
    fetchSummaryMock.mockRejectedValueOnce(new Error('reload-failed'))

    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    vm.handleIncomeModalSaved()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(consoleErrorMock).toHaveBeenCalledWith(
      '[CashFlowViewModel] after saving income modal: reload data failed',
      expect.any(Error)
    )
  })

  it('bubbles loadData error while still invoking all fetch calls', async () => {
    fetchSummaryMock.mockRejectedValueOnce(new Error('summary-failed'))

    const { useCashFlowViewModel } = await import('~/composables/useCashFlowViewModel')
    const vm = useCashFlowViewModel({ autoLoad: false })

    await expect(vm.loadData()).rejects.toThrow('summary-failed')

    expect(fetchIncomesMock).toHaveBeenCalledWith({ per_page: 100 })
    expect(fetchCashFlowItemsMock).toHaveBeenCalledWith({ per_page: 100 })
    expect(fetchProjectionMock).toHaveBeenCalledWith(1)
  })
})
