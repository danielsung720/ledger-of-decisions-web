import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCashFlow } from '~/composables/useCashFlow'
import { useCashFlowStore } from '~/stores/cashflow'
import { useUiStore } from '~/stores/ui'
import type { Income, CashFlowItem, CashFlowSummary, CashFlowProjection } from '~/types/cashflow'
import type { PaginationMeta } from '~/types'

// Mock the API client
const mockApi = {
  getIncomes: vi.fn(),
  getIncome: vi.fn(),
  createIncome: vi.fn(),
  updateIncome: vi.fn(),
  deleteIncome: vi.fn(),
  getCashFlowItems: vi.fn(),
  getCashFlowItem: vi.fn(),
  createCashFlowItem: vi.fn(),
  updateCashFlowItem: vi.fn(),
  deleteCashFlowItem: vi.fn(),
  getCashFlowSummary: vi.fn(),
  getCashFlowProjection: vi.fn(),
}

vi.mock('~/utils/api', () => ({
  useApiClient: () => mockApi,
}))

describe('useCashFlow', () => {
  const mockIncome: Income = {
    id: 1,
    name: '薪資',
    amount: '80000.00',
    amount_display: 'NT$80,000',
    currency: 'TWD',
    frequency_type: 'monthly',
    frequency_type_label: '每月',
    frequency_interval: 1,
    frequency_display: '每月',
    start_date: '2026-01-01',
    end_date: null,
    note: null,
    is_active: true,
    monthly_amount: '80000.00',
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-01-01T00:00:00',
  }

  const mockCashFlowItem: CashFlowItem = {
    id: 1,
    name: '房租',
    amount: '25000.00',
    amount_display: 'NT$25,000',
    currency: 'TWD',
    category: 'living',
    category_label: '生活',
    frequency_type: 'monthly',
    frequency_type_label: '每月',
    frequency_interval: 1,
    frequency_display: '每月',
    start_date: '2026-01-01',
    end_date: null,
    note: null,
    is_active: true,
    monthly_amount: '25000.00',
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-01-01T00:00:00',
  }

  const mockSummary: CashFlowSummary = {
    total_income: '80000.00',
    total_expense: '25000.00',
    net_cash_flow: '55000.00',
    savings_rate: '68.75',
  }

  const mockProjection: CashFlowProjection = {
    month: '2026/02',
    income: '80000.00',
    expense: '25000.00',
    net: '55000.00',
    cumulative_balance: '55000.00',
  }

  const mockPagination: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 1,
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('computed properties', () => {
    it('exposes incomes from store', () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]

      const { incomes } = useCashFlow()

      expect(incomes.value).toEqual([mockIncome])
    })

    it('exposes cashFlowItems from store', () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]

      const { cashFlowItems } = useCashFlow()

      expect(cashFlowItems.value).toEqual([mockCashFlowItem])
    })

    it('exposes activeIncomes from store', () => {
      const store = useCashFlowStore()
      const inactive = { ...mockIncome, id: 2, is_active: false }
      store.incomes = [mockIncome, inactive]

      const { activeIncomes } = useCashFlow()

      expect(activeIncomes.value).toHaveLength(1)
      expect(activeIncomes.value[0].id).toBe(1)
    })

    it('exposes activeCashFlowItems from store', () => {
      const store = useCashFlowStore()
      const inactive = { ...mockCashFlowItem, id: 2, is_active: false }
      store.cashFlowItems = [mockCashFlowItem, inactive]

      const { activeCashFlowItems } = useCashFlow()

      expect(activeCashFlowItems.value).toHaveLength(1)
      expect(activeCashFlowItems.value[0].id).toBe(1)
    })

    it('exposes totalMonthlyIncome from store', () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]

      const { totalMonthlyIncome } = useCashFlow()

      expect(totalMonthlyIncome.value).toBe(80000)
    })

    it('exposes totalMonthlyExpense from store', () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]

      const { totalMonthlyExpense } = useCashFlow()

      expect(totalMonthlyExpense.value).toBe(25000)
    })
  })

  describe('fetchIncomes', () => {
    it('fetches incomes successfully', async () => {
      mockApi.getIncomes.mockResolvedValueOnce({
        data: [mockIncome],
        meta: mockPagination,
      })

      const { fetchIncomes, incomes } = useCashFlow()

      await fetchIncomes()

      expect(incomes.value).toEqual([mockIncome])
    })

    it('shows error toast and rethrows on failure', async () => {
      mockApi.getIncomes.mockRejectedValueOnce(new Error('Network error'))
      const uiStore = useUiStore()

      const { fetchIncomes } = useCashFlow()

      await expect(fetchIncomes()).rejects.toThrow('Network error')

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('載入失敗')
    })

    it('forwards list contract params to income API', async () => {
      mockApi.getIncomes.mockResolvedValueOnce({
        data: [mockIncome],
        meta: mockPagination,
      })

      const { fetchIncomes } = useCashFlow()

      await fetchIncomes({
        per_page: 100,
        is_active: true,
        frequency_type: 'monthly',
      })

      expect(mockApi.getIncomes).toHaveBeenCalledWith({
        per_page: 100,
        is_active: true,
        frequency_type: 'monthly',
      })
    })
  })

  describe('fetchIncomeById', () => {
    it('returns income', async () => {
      mockApi.getIncome.mockResolvedValueOnce({ data: mockIncome })

      const { fetchIncomeById } = useCashFlow()

      const result = await fetchIncomeById(1)

      expect(result).toEqual(mockIncome)
    })

    it('shows error toast on failure', async () => {
      mockApi.getIncome.mockRejectedValueOnce(new Error('Not found'))
      const uiStore = useUiStore()

      const { fetchIncomeById } = useCashFlow()

      await expect(fetchIncomeById(999)).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('createIncome', () => {
    it('creates and shows success toast', async () => {
      mockApi.createIncome.mockResolvedValueOnce({ data: mockIncome })
      const uiStore = useUiStore()

      const { createIncome } = useCashFlow()

      const result = await createIncome({
        name: '薪資',
        amount: 80000,
        frequency_type: 'monthly',
        start_date: '2026-01-01',
      })

      expect(result).toEqual(mockIncome)
      expect(uiStore.toasts[0].type).toBe('success')
      expect(uiStore.toasts[0].title).toBe('新增成功')
    })

    it('shows error toast on failure', async () => {
      mockApi.createIncome.mockRejectedValueOnce(new Error('Validation error'))
      const uiStore = useUiStore()

      const { createIncome } = useCashFlow()

      await expect(
        createIncome({
          name: 'Test',
          amount: 100,
          frequency_type: 'monthly',
          start_date: '2026-01-01',
        })
      ).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('updateIncome', () => {
    it('updates and shows success toast', async () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]

      const updated = { ...mockIncome, name: '新薪資' }
      mockApi.updateIncome.mockResolvedValueOnce({ data: updated })
      const uiStore = useUiStore()

      const { updateIncome } = useCashFlow()

      const result = await updateIncome(1, { name: '新薪資' })

      expect(result?.name).toBe('新薪資')
      expect(uiStore.toasts[0].type).toBe('success')
    })
  })

  describe('deleteIncome', () => {
    it('deletes and shows success toast', async () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]
      mockApi.deleteIncome.mockResolvedValueOnce(undefined)
      const uiStore = useUiStore()

      const { deleteIncome } = useCashFlow()

      await deleteIncome(1)

      expect(store.incomes).toHaveLength(0)
      expect(uiStore.toasts[0].type).toBe('success')
    })
  })

  describe('toggleIncomeActive', () => {
    it('activates and shows success toast', async () => {
      const store = useCashFlowStore()
      const inactive = { ...mockIncome, is_active: false }
      store.incomes = [inactive]

      const activated = { ...mockIncome, is_active: true }
      mockApi.updateIncome.mockResolvedValueOnce({ data: activated })
      const uiStore = useUiStore()

      const { toggleIncomeActive } = useCashFlow()

      await toggleIncomeActive(1, true)

      expect(uiStore.toasts[0].title).toBe('已啟用')
    })

    it('deactivates and shows success toast', async () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]

      const deactivated = { ...mockIncome, is_active: false }
      mockApi.updateIncome.mockResolvedValueOnce({ data: deactivated })
      const uiStore = useUiStore()

      const { toggleIncomeActive } = useCashFlow()

      await toggleIncomeActive(1, false)

      expect(uiStore.toasts[0].title).toBe('已停用')
    })
  })

  describe('fetchCashFlowItems', () => {
    it('fetches cash flow items successfully', async () => {
      mockApi.getCashFlowItems.mockResolvedValueOnce({
        data: [mockCashFlowItem],
        meta: mockPagination,
      })

      const { fetchCashFlowItems, cashFlowItems } = useCashFlow()

      await fetchCashFlowItems()

      expect(cashFlowItems.value).toEqual([mockCashFlowItem])
    })

    it('shows error toast on failure', async () => {
      mockApi.getCashFlowItems.mockRejectedValueOnce(new Error('Network error'))
      const uiStore = useUiStore()

      const { fetchCashFlowItems } = useCashFlow()

      await fetchCashFlowItems()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('載入失敗')
    })

    it('forwards list contract params to cashflow-item API', async () => {
      mockApi.getCashFlowItems.mockResolvedValueOnce({
        data: [mockCashFlowItem],
        meta: mockPagination,
      })

      const { fetchCashFlowItems } = useCashFlow()

      await fetchCashFlowItems({
        per_page: 100,
        category: 'living',
        is_active: true,
        frequency_type: 'monthly',
      })

      expect(mockApi.getCashFlowItems).toHaveBeenCalledWith({
        per_page: 100,
        category: 'living',
        is_active: true,
        frequency_type: 'monthly',
      })
    })
  })

  describe('fetchCashFlowItemById', () => {
    it('returns cash flow item', async () => {
      mockApi.getCashFlowItem.mockResolvedValueOnce({ data: mockCashFlowItem })

      const { fetchCashFlowItemById } = useCashFlow()

      const result = await fetchCashFlowItemById(1)

      expect(result).toEqual(mockCashFlowItem)
    })

    it('shows error toast on failure', async () => {
      mockApi.getCashFlowItem.mockRejectedValueOnce(new Error('Not found'))
      const uiStore = useUiStore()

      const { fetchCashFlowItemById } = useCashFlow()

      await expect(fetchCashFlowItemById(999)).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('createCashFlowItem', () => {
    it('creates and shows success toast', async () => {
      mockApi.createCashFlowItem.mockResolvedValueOnce({ data: mockCashFlowItem })
      const uiStore = useUiStore()

      const { createCashFlowItem } = useCashFlow()

      const result = await createCashFlowItem({
        name: '房租',
        amount: 25000,
        category: 'living',
        frequency_type: 'monthly',
        start_date: '2026-01-01',
      })

      expect(result).toEqual(mockCashFlowItem)
      expect(uiStore.toasts[0].type).toBe('success')
      expect(uiStore.toasts[0].title).toBe('新增成功')
    })

    it('shows error toast on failure', async () => {
      mockApi.createCashFlowItem.mockRejectedValueOnce(new Error('Validation error'))
      const uiStore = useUiStore()

      const { createCashFlowItem } = useCashFlow()

      await expect(
        createCashFlowItem({
          name: 'Test',
          amount: 100,
          category: 'food',
          frequency_type: 'monthly',
          start_date: '2026-01-01',
        })
      ).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('updateCashFlowItem', () => {
    it('updates and shows success toast', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]

      const updated = { ...mockCashFlowItem, name: '新房租' }
      mockApi.updateCashFlowItem.mockResolvedValueOnce({ data: updated })
      const uiStore = useUiStore()

      const { updateCashFlowItem } = useCashFlow()

      const result = await updateCashFlowItem(1, { name: '新房租' })

      expect(result?.name).toBe('新房租')
      expect(uiStore.toasts[0].type).toBe('success')
    })
  })

  describe('deleteCashFlowItem', () => {
    it('deletes and shows success toast', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]
      mockApi.deleteCashFlowItem.mockResolvedValueOnce(undefined)
      const uiStore = useUiStore()

      const { deleteCashFlowItem } = useCashFlow()

      await deleteCashFlowItem(1)

      expect(store.cashFlowItems).toHaveLength(0)
      expect(uiStore.toasts[0].type).toBe('success')
    })
  })

  describe('toggleCashFlowItemActive', () => {
    it('activates and shows success toast', async () => {
      const store = useCashFlowStore()
      const inactive = { ...mockCashFlowItem, is_active: false }
      store.cashFlowItems = [inactive]

      const activated = { ...mockCashFlowItem, is_active: true }
      mockApi.updateCashFlowItem.mockResolvedValueOnce({ data: activated })
      const uiStore = useUiStore()

      const { toggleCashFlowItemActive } = useCashFlow()

      await toggleCashFlowItemActive(1, true)

      expect(uiStore.toasts[0].title).toBe('已啟用')
    })

    it('deactivates and shows success toast', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]

      const deactivated = { ...mockCashFlowItem, is_active: false }
      mockApi.updateCashFlowItem.mockResolvedValueOnce({ data: deactivated })
      const uiStore = useUiStore()

      const { toggleCashFlowItemActive } = useCashFlow()

      await toggleCashFlowItemActive(1, false)

      expect(uiStore.toasts[0].title).toBe('已停用')
    })
  })

  describe('fetchSummary', () => {
    it('returns summary', async () => {
      mockApi.getCashFlowSummary.mockResolvedValueOnce({ data: mockSummary })

      const { fetchSummary, summary } = useCashFlow()

      const result = await fetchSummary()

      expect(result).toEqual(mockSummary)
      expect(summary.value).toEqual(mockSummary)
    })

    it('shows error toast on failure', async () => {
      mockApi.getCashFlowSummary.mockRejectedValueOnce(new Error('Network error'))
      const uiStore = useUiStore()

      const { fetchSummary } = useCashFlow()

      await expect(fetchSummary()).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('fetchProjection', () => {
    it('returns projection', async () => {
      mockApi.getCashFlowProjection.mockResolvedValueOnce({ data: [mockProjection] })

      const { fetchProjection, projections } = useCashFlow()

      const result = await fetchProjection(3)

      expect(result).toEqual([mockProjection])
      expect(projections.value).toEqual([mockProjection])
    })

    it('shows error toast on failure', async () => {
      mockApi.getCashFlowProjection.mockRejectedValueOnce(new Error('Network error'))
      const uiStore = useUiStore()

      const { fetchProjection } = useCashFlow()

      await expect(fetchProjection()).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('setSelectedMonths', () => {
    it('sets selected months', () => {
      const store = useCashFlowStore()

      const { setSelectedMonths, selectedMonths } = useCashFlow()

      setSelectedMonths(6)

      expect(selectedMonths.value).toBe(6)
      expect(store.selectedMonths).toBe(6)
    })

    it('normalizes out-of-range months through store guardrail', () => {
      const store = useCashFlowStore()

      const { setSelectedMonths, selectedMonths } = useCashFlow()

      setSelectedMonths(0)
      expect(selectedMonths.value).toBe(1)
      expect(store.selectedMonths).toBe(1)

      setSelectedMonths(42)
      expect(selectedMonths.value).toBe(12)
      expect(store.selectedMonths).toBe(12)
    })
  })

  describe('confirmDeleteIncome', () => {
    it('opens confirm dialog', () => {
      const uiStore = useUiStore()

      const { confirmDeleteIncome } = useCashFlow()

      confirmDeleteIncome(1)

      expect(uiStore.isConfirmDialogOpen).toBe(true)
      expect(uiStore.confirmDialogProps?.variant).toBe('danger')
    })
  })

  describe('confirmDeleteCashFlowItem', () => {
    it('opens confirm dialog', () => {
      const uiStore = useUiStore()

      const { confirmDeleteCashFlowItem } = useCashFlow()

      confirmDeleteCashFlowItem(1)

      expect(uiStore.isConfirmDialogOpen).toBe(true)
      expect(uiStore.confirmDialogProps?.variant).toBe('danger')
    })
  })

  describe('clearCurrentIncome', () => {
    it('clears current income', () => {
      const store = useCashFlowStore()
      store.currentIncome = mockIncome

      const { clearCurrentIncome, currentIncome } = useCashFlow()

      clearCurrentIncome()

      expect(currentIncome.value).toBe(null)
    })
  })

  describe('clearCurrentCashFlowItem', () => {
    it('clears current cash flow item', () => {
      const store = useCashFlowStore()
      store.currentCashFlowItem = mockCashFlowItem

      const { clearCurrentCashFlowItem, currentCashFlowItem } = useCashFlow()

      clearCurrentCashFlowItem()

      expect(currentCashFlowItem.value).toBe(null)
    })
  })
})
