import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCashFlowStore } from '~/stores/cashflow'
import type { PaginationMeta } from '~/types'
import type { Income, CashFlowItem, CashFlowSummary, CashFlowProjection } from '~/types/cashflow'
import { CASH_FLOW_PROJECTION_DEFAULT_MONTHS } from '~/types/cashflow'

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

describe('useCashFlowStore', () => {
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

  describe('initial state', () => {
    it('has correct initial state', () => {
      const store = useCashFlowStore()

      expect(store.incomes).toEqual([])
      expect(store.currentIncome).toBe(null)
      expect(store.cashFlowItems).toEqual([])
      expect(store.currentCashFlowItem).toBe(null)
      expect(store.summary).toBe(null)
      expect(store.projections).toEqual([])
      expect(store.selectedMonths).toBe(CASH_FLOW_PROJECTION_DEFAULT_MONTHS)
      expect(store.latestProjectionRequestId).toBe(0)
      expect(store.loadingCount).toBe(0)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.incomePagination).toBe(null)
      expect(store.itemPagination).toBe(null)
    })
  })

  describe('getters', () => {
    it('hasIncomes returns false when empty', () => {
      const store = useCashFlowStore()
      expect(store.hasIncomes).toBe(false)
    })

    it('hasIncomes returns true when has items', () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]
      expect(store.hasIncomes).toBe(true)
    })

    it('hasCashFlowItems returns false when empty', () => {
      const store = useCashFlowStore()
      expect(store.hasCashFlowItems).toBe(false)
    })

    it('hasCashFlowItems returns true when has items', () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]
      expect(store.hasCashFlowItems).toBe(true)
    })

    it('activeIncomes filters active only', () => {
      const store = useCashFlowStore()
      const inactive = { ...mockIncome, id: 2, is_active: false }
      store.incomes = [mockIncome, inactive]

      expect(store.activeIncomes).toHaveLength(1)
      expect(store.activeIncomes[0].id).toBe(1)
    })

    it('activeCashFlowItems filters active only', () => {
      const store = useCashFlowStore()
      const inactive = { ...mockCashFlowItem, id: 2, is_active: false }
      store.cashFlowItems = [mockCashFlowItem, inactive]

      expect(store.activeCashFlowItems).toHaveLength(1)
      expect(store.activeCashFlowItems[0].id).toBe(1)
    })

    it('totalMonthlyIncome sums active incomes', () => {
      const store = useCashFlowStore()
      const income2 = { ...mockIncome, id: 2, monthly_amount: '20000.00' }
      const inactive = { ...mockIncome, id: 3, is_active: false, monthly_amount: '10000.00' }
      store.incomes = [mockIncome, income2, inactive]

      expect(store.totalMonthlyIncome).toBe(100000) // 80000 + 20000, not including inactive
    })

    it('totalMonthlyExpense sums active items', () => {
      const store = useCashFlowStore()
      const item2 = { ...mockCashFlowItem, id: 2, monthly_amount: '15000.00' }
      const inactive = { ...mockCashFlowItem, id: 3, is_active: false, monthly_amount: '10000.00' }
      store.cashFlowItems = [mockCashFlowItem, item2, inactive]

      expect(store.totalMonthlyExpense).toBe(40000) // 25000 + 15000, not including inactive
    })
  })

  describe('fetchIncomes', () => {
    it('fetches incomes successfully', async () => {
      const store = useCashFlowStore()
      mockApi.getIncomes.mockResolvedValueOnce({
        data: [mockIncome],
        meta: mockPagination,
      })

      await store.fetchIncomes()

      expect(store.incomes).toEqual([mockIncome])
      expect(store.incomePagination).toEqual(mockPagination)
      expect(store.loading).toBe(false)
    })

    it('handles fetch error', async () => {
      const store = useCashFlowStore()
      mockApi.getIncomes.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchIncomes()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
    })

    it('passes params to API', async () => {
      const store = useCashFlowStore()
      mockApi.getIncomes.mockResolvedValueOnce({ data: [], meta: mockPagination })

      const params = { is_active: true }
      await store.fetchIncomes(params)

      expect(mockApi.getIncomes).toHaveBeenCalledWith(params)
    })
  })

  describe('fetchIncomeById', () => {
    it('fetches single income', async () => {
      const store = useCashFlowStore()
      mockApi.getIncome.mockResolvedValueOnce({ data: mockIncome })

      const result = await store.fetchIncomeById(1)

      expect(result).toEqual(mockIncome)
      expect(store.currentIncome).toEqual(mockIncome)
    })
  })

  describe('createIncome', () => {
    it('creates and adds to beginning of list', async () => {
      const store = useCashFlowStore()
      store.incomes = []
      mockApi.createIncome.mockResolvedValueOnce({ data: mockIncome })

      const result = await store.createIncome({
        name: '薪資',
        amount: 80000,
        frequency_type: 'monthly',
        start_date: '2026-01-01',
      })

      expect(result).toEqual(mockIncome)
      expect(store.incomes[0]).toEqual(mockIncome)
    })
  })

  describe('updateIncome', () => {
    it('updates in list using immutable pattern', async () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]

      const updated = { ...mockIncome, name: '新薪資' }
      mockApi.updateIncome.mockResolvedValueOnce({ data: updated })

      await store.updateIncome(1, { name: '新薪資' })

      expect(store.incomes[0].name).toBe('新薪資')
    })

    it('updates currentIncome if matches', async () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]
      store.currentIncome = mockIncome

      const updated = { ...mockIncome, name: '更新後' }
      mockApi.updateIncome.mockResolvedValueOnce({ data: updated })

      await store.updateIncome(1, { name: '更新後' })

      expect(store.currentIncome?.name).toBe('更新後')
    })
  })

  describe('deleteIncome', () => {
    it('removes from list', async () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]
      mockApi.deleteIncome.mockResolvedValueOnce(undefined)

      await store.deleteIncome(1)

      expect(store.incomes).toHaveLength(0)
    })

    it('clears currentIncome if matches', async () => {
      const store = useCashFlowStore()
      store.incomes = [mockIncome]
      store.currentIncome = mockIncome
      mockApi.deleteIncome.mockResolvedValueOnce(undefined)

      await store.deleteIncome(1)

      expect(store.currentIncome).toBe(null)
    })
  })

  describe('fetchCashFlowItems', () => {
    it('fetches cash flow items successfully', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowItems.mockResolvedValueOnce({
        data: [mockCashFlowItem],
        meta: mockPagination,
      })

      await store.fetchCashFlowItems()

      expect(store.cashFlowItems).toEqual([mockCashFlowItem])
      expect(store.itemPagination).toEqual(mockPagination)
      expect(store.loading).toBe(false)
    })

    it('handles fetch error', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowItems.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchCashFlowItems()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
    })

    it('passes params to API', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowItems.mockResolvedValueOnce({ data: [], meta: mockPagination })

      const params = {
        category: ['food', 'living'] as const,
        is_active: true,
        frequency_type: 'monthly' as const,
        per_page: 100,
      }
      await store.fetchCashFlowItems(params)

      expect(mockApi.getCashFlowItems).toHaveBeenCalledWith(params)
    })
  })

  describe('loading concurrency', () => {
    it('keeps loading true until all concurrent requests finish', async () => {
      const store = useCashFlowStore()
      let resolveIncomes: ((value: unknown) => void) | null = null
      let resolveItems: ((value: unknown) => void) | null = null

      mockApi.getIncomes.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveIncomes = resolve
          })
      )
      mockApi.getCashFlowItems.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveItems = resolve
          })
      )

      const incomesPromise = store.fetchIncomes()
      const itemsPromise = store.fetchCashFlowItems()

      expect(store.loading).toBe(true)
      expect(store.loadingCount).toBe(2)

      resolveIncomes?.({ data: [mockIncome], meta: mockPagination })
      await incomesPromise

      expect(store.loading).toBe(true)
      expect(store.loadingCount).toBe(1)

      resolveItems?.({ data: [mockCashFlowItem], meta: mockPagination })
      await itemsPromise

      expect(store.loading).toBe(false)
      expect(store.loadingCount).toBe(0)
    })
  })

  describe('fetchCashFlowItemById', () => {
    it('fetches single cash flow item', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowItem.mockResolvedValueOnce({ data: mockCashFlowItem })

      const result = await store.fetchCashFlowItemById(1)

      expect(result).toEqual(mockCashFlowItem)
      expect(store.currentCashFlowItem).toEqual(mockCashFlowItem)
    })
  })

  describe('createCashFlowItem', () => {
    it('creates and adds to beginning of list', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = []
      mockApi.createCashFlowItem.mockResolvedValueOnce({ data: mockCashFlowItem })

      const result = await store.createCashFlowItem({
        name: '房租',
        amount: 25000,
        category: 'living',
        frequency_type: 'monthly',
        start_date: '2026-01-01',
      })

      expect(result).toEqual(mockCashFlowItem)
      expect(store.cashFlowItems[0]).toEqual(mockCashFlowItem)
    })
  })

  describe('updateCashFlowItem', () => {
    it('updates in list using immutable pattern', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]

      const updated = { ...mockCashFlowItem, name: '新房租' }
      mockApi.updateCashFlowItem.mockResolvedValueOnce({ data: updated })

      await store.updateCashFlowItem(1, { name: '新房租' })

      expect(store.cashFlowItems[0].name).toBe('新房租')
    })

    it('updates currentCashFlowItem if matches', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]
      store.currentCashFlowItem = mockCashFlowItem

      const updated = { ...mockCashFlowItem, name: '更新後' }
      mockApi.updateCashFlowItem.mockResolvedValueOnce({ data: updated })

      await store.updateCashFlowItem(1, { name: '更新後' })

      expect(store.currentCashFlowItem?.name).toBe('更新後')
    })
  })

  describe('deleteCashFlowItem', () => {
    it('removes from list', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]
      mockApi.deleteCashFlowItem.mockResolvedValueOnce(undefined)

      await store.deleteCashFlowItem(1)

      expect(store.cashFlowItems).toHaveLength(0)
    })

    it('clears currentCashFlowItem if matches', async () => {
      const store = useCashFlowStore()
      store.cashFlowItems = [mockCashFlowItem]
      store.currentCashFlowItem = mockCashFlowItem
      mockApi.deleteCashFlowItem.mockResolvedValueOnce(undefined)

      await store.deleteCashFlowItem(1)

      expect(store.currentCashFlowItem).toBe(null)
    })
  })

  describe('fetchSummary', () => {
    it('fetches summary successfully', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowSummary.mockResolvedValueOnce({ data: mockSummary })

      const result = await store.fetchSummary()

      expect(result).toEqual(mockSummary)
      expect(store.summary).toEqual(mockSummary)
    })

    it('handles fetch error', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowSummary.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchSummary()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
    })
  })

  describe('fetchProjection', () => {
    it('fetches projection successfully', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowProjection.mockResolvedValueOnce({ data: [mockProjection] })

      const result = await store.fetchProjection(3)

      expect(result).toEqual([mockProjection])
      expect(store.projections).toEqual([mockProjection])
      expect(store.selectedMonths).toBe(3)
    })

    it('handles fetch error', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowProjection.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchProjection()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
    })

    it('passes months to API', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowProjection.mockResolvedValueOnce({ data: [] })

      await store.fetchProjection(6)

      expect(mockApi.getCashFlowProjection).toHaveBeenCalledWith(6)
    })

    it('does not override selectedMonths when months is undefined', async () => {
      const store = useCashFlowStore()
      store.selectedMonths = 6
      mockApi.getCashFlowProjection.mockResolvedValueOnce({ data: [mockProjection] })

      await store.fetchProjection()

      expect(mockApi.getCashFlowProjection).toHaveBeenCalledWith(undefined)
      expect(store.selectedMonths).toBe(6)
    })

    it('normalizes months lower bound before request', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowProjection.mockResolvedValueOnce({ data: [] })

      await store.fetchProjection(0)

      expect(mockApi.getCashFlowProjection).toHaveBeenCalledWith(1)
      expect(store.selectedMonths).toBe(1)
    })

    it('normalizes months upper bound before request', async () => {
      const store = useCashFlowStore()
      mockApi.getCashFlowProjection.mockResolvedValueOnce({ data: [] })

      await store.fetchProjection(99)

      expect(mockApi.getCashFlowProjection).toHaveBeenCalledWith(12)
      expect(store.selectedMonths).toBe(12)
    })

    it('keeps only latest projection result when requests resolve out of order', async () => {
      const store = useCashFlowStore()
      const projectionForTwelve = [{ ...mockProjection, month: '2026/12' }]
      const projectionForSix = [{ ...mockProjection, month: '2026/06' }]

      let resolveFirst: ((value: unknown) => void) | null = null
      let resolveSecond: ((value: unknown) => void) | null = null

      mockApi.getCashFlowProjection
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveFirst = resolve
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSecond = resolve
            })
        )

      const firstPromise = store.fetchProjection(12)
      const secondPromise = store.fetchProjection(6)

      resolveSecond?.({ data: projectionForSix })
      await secondPromise

      resolveFirst?.({ data: projectionForTwelve })
      await firstPromise

      expect(store.selectedMonths).toBe(6)
      expect(store.projections).toEqual(projectionForSix)
      expect(store.latestProjectionRequestId).toBe(2)
    })

    it('does not let stale projection error override latest success state', async () => {
      const store = useCashFlowStore()
      store.error = 'previous error'
      const latestProjection = [{ ...mockProjection, month: '2026/03' }]

      let rejectFirst: ((reason?: unknown) => void) | null = null
      let resolveSecond: ((value: unknown) => void) | null = null

      mockApi.getCashFlowProjection
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              rejectFirst = reject
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSecond = resolve
            })
        )

      const stalePromise = store.fetchProjection(12).catch(() => null)
      const latestPromise = store.fetchProjection(3)

      resolveSecond?.({ data: latestProjection })
      await latestPromise
      rejectFirst?.(new Error('stale request failed'))
      await stalePromise

      expect(store.selectedMonths).toBe(3)
      expect(store.projections).toEqual(latestProjection)
      expect(store.error).toBe(null)
    })
  })

  describe('setSelectedMonths', () => {
    it('sets selected months', () => {
      const store = useCashFlowStore()

      store.setSelectedMonths(6)

      expect(store.selectedMonths).toBe(6)
    })

    it('normalizes selected months to valid projection range', () => {
      const store = useCashFlowStore()

      store.setSelectedMonths(0)
      expect(store.selectedMonths).toBe(1)

      store.setSelectedMonths(99)
      expect(store.selectedMonths).toBe(12)
    })
  })

  describe('clearCurrentIncome', () => {
    it('clears current income', () => {
      const store = useCashFlowStore()
      store.currentIncome = mockIncome

      store.clearCurrentIncome()

      expect(store.currentIncome).toBe(null)
    })
  })

  describe('clearCurrentCashFlowItem', () => {
    it('clears current cash flow item', () => {
      const store = useCashFlowStore()
      store.currentCashFlowItem = mockCashFlowItem

      store.clearCurrentCashFlowItem()

      expect(store.currentCashFlowItem).toBe(null)
    })
  })
})
