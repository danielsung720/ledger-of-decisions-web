import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRecurringExpenseStore } from '~/stores/recurring-expense'
import type { PaginationMeta, Expense } from '~/types'
import type { RecurringExpense } from '~/types/recurring-expense'

// Mock the API client
const mockApi = {
  getRecurringExpenses: vi.fn(),
  getRecurringExpense: vi.fn(),
  createRecurringExpense: vi.fn(),
  updateRecurringExpense: vi.fn(),
  deleteRecurringExpense: vi.fn(),
  getUpcomingRecurringExpenses: vi.fn(),
  generateExpenseFromRecurring: vi.fn(),
  getRecurringExpenseHistory: vi.fn(),
}

vi.mock('~/utils/api', () => ({
  useApiClient: () => mockApi,
}))

describe('useRecurringExpenseStore', () => {
  const mockRecurringExpense: RecurringExpense = {
    id: 1,
    name: 'Monthly Rent',
    amount_min: '15000',
    amount_max: '15000',
    category: 'living',
    category_label: '生活',
    frequency_type: 'monthly',
    frequency_type_label: '每月',
    frequency_interval: 1,
    day_of_month: 1,
    day_of_week: null,
    month_of_year: null,
    start_date: '2024-01-01',
    end_date: null,
    next_occurrence: '2024-04-01',
    last_generated: '2024-03-01',
    is_active: true,
    default_intent: 'necessity',
    default_intent_label: '必要',
    note: null,
    total_generated: 3,
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-03-01T00:00:00',
  }

  const mockPagination: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 5,
  }

  const mockExpense: Expense = {
    id: 10,
    amount: '15000',
    currency: 'TWD',
    category: 'living',
    category_label: '生活',
    occurred_at: '2024-03-01T00:00:00',
    note: null,
    recurring_expense_id: 1,
    is_from_recurring: true,
    created_at: '2024-03-01T00:00:00',
    updated_at: '2024-03-01T00:00:00',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct initial state', () => {
      const store = useRecurringExpenseStore()

      expect(store.recurringExpenses).toEqual([])
      expect(store.currentRecurringExpense).toBe(null)
      expect(store.upcomingExpenses).toEqual([])
      expect(store.history).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.filters).toEqual({})
      expect(store.pagination).toBe(null)
    })
  })

  describe('getters', () => {
    it('hasRecurringExpenses returns false when empty', () => {
      const store = useRecurringExpenseStore()
      expect(store.hasRecurringExpenses).toBe(false)
    })

    it('hasRecurringExpenses returns true when has items', () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]
      expect(store.hasRecurringExpenses).toBe(true)
    })

    it('activeRecurringExpenses filters active only', () => {
      const store = useRecurringExpenseStore()
      const inactive = { ...mockRecurringExpense, id: 2, is_active: false }
      store.recurringExpenses = [mockRecurringExpense, inactive]

      expect(store.activeRecurringExpenses).toHaveLength(1)
      expect(store.activeRecurringExpenses[0].id).toBe(1)
    })

    it('inactiveRecurringExpenses filters inactive only', () => {
      const store = useRecurringExpenseStore()
      const inactive = { ...mockRecurringExpense, id: 2, is_active: false }
      store.recurringExpenses = [mockRecurringExpense, inactive]

      expect(store.inactiveRecurringExpenses).toHaveLength(1)
      expect(store.inactiveRecurringExpenses[0].id).toBe(2)
    })

    it('totalPages returns 1 when no pagination', () => {
      const store = useRecurringExpenseStore()
      expect(store.totalPages).toBe(1)
    })

    it('currentPage returns 1 when no pagination', () => {
      const store = useRecurringExpenseStore()
      expect(store.currentPage).toBe(1)
    })

    it('totalItems returns 0 when no pagination', () => {
      const store = useRecurringExpenseStore()
      expect(store.totalItems).toBe(0)
    })
  })

  describe('fetchRecurringExpenses', () => {
    it('fetches recurring expenses successfully', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpenses.mockResolvedValueOnce({
        data: [mockRecurringExpense],
        meta: mockPagination,
      })

      await store.fetchRecurringExpenses()

      expect(store.recurringExpenses).toEqual([mockRecurringExpense])
      expect(store.pagination).toEqual(mockPagination)
      expect(store.loading).toBe(false)
    })

    it('handles fetch error', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpenses.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchRecurringExpenses()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
    })

    it('passes params to API', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpenses.mockResolvedValueOnce({ data: [], meta: mockPagination })

      const params = { is_active: true }
      await store.fetchRecurringExpenses(params)

      expect(mockApi.getRecurringExpenses).toHaveBeenCalledWith(params)
    })

    it('rejects malformed list response contract', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpenses.mockResolvedValueOnce({
        data: [{ id: 'bad' }],
        meta: mockPagination,
      })

      await expect(store.fetchRecurringExpenses()).rejects.toThrow(
        'Invalid recurring expense list response'
      )
      expect(store.error).toBe('Invalid recurring expense list response')
    })
  })

  describe('fetchRecurringExpenseById', () => {
    it('fetches single recurring expense', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpense.mockResolvedValueOnce({ data: mockRecurringExpense })

      const result = await store.fetchRecurringExpenseById(1)

      expect(result).toEqual(mockRecurringExpense)
      expect(store.currentRecurringExpense).toEqual(mockRecurringExpense)
    })

    it('rejects malformed detail response contract', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpense.mockResolvedValueOnce({ data: { id: 1 } })

      await expect(store.fetchRecurringExpenseById(1)).rejects.toThrow(
        'Invalid recurring expense detail response'
      )
      expect(store.error).toBe('Invalid recurring expense detail response')
    })
  })

  describe('createRecurringExpense', () => {
    it('creates and adds to beginning of list', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = []
      mockApi.createRecurringExpense.mockResolvedValueOnce({ data: mockRecurringExpense })

      const result = await store.createRecurringExpense({
        name: 'Monthly Rent',
        amount_min: 15000,
        category: 'living',
        frequency_type: 'monthly',
        start_date: '2024-01-01',
      })

      expect(result).toEqual(mockRecurringExpense)
      expect(store.recurringExpenses[0]).toEqual(mockRecurringExpense)
    })

    it('rejects malformed create response contract', async () => {
      const store = useRecurringExpenseStore()
      mockApi.createRecurringExpense.mockResolvedValueOnce({ data: { id: 1 } })

      await expect(
        store.createRecurringExpense({
          name: 'Monthly Rent',
          amount_min: 15000,
          category: 'living',
          frequency_type: 'monthly',
          start_date: '2024-01-01',
        })
      ).rejects.toThrow('Invalid create recurring expense response')

      expect(store.error).toBe('Invalid create recurring expense response')
    })
  })

  describe('updateRecurringExpense', () => {
    it('updates in list using immutable pattern', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]

      const updated = { ...mockRecurringExpense, name: 'Updated Rent' }
      mockApi.updateRecurringExpense.mockResolvedValueOnce({ data: updated })

      await store.updateRecurringExpense(1, { name: 'Updated Rent' })

      expect(store.recurringExpenses[0].name).toBe('Updated Rent')
    })

    it('updates currentRecurringExpense if matches', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]
      store.currentRecurringExpense = mockRecurringExpense

      const updated = { ...mockRecurringExpense, name: 'Updated' }
      mockApi.updateRecurringExpense.mockResolvedValueOnce({ data: updated })

      await store.updateRecurringExpense(1, { name: 'Updated' })

      expect(store.currentRecurringExpense?.name).toBe('Updated')
    })

    it('rejects malformed update response contract', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]
      mockApi.updateRecurringExpense.mockResolvedValueOnce({ data: { id: 1 } })

      await expect(store.updateRecurringExpense(1, { name: 'Updated' })).rejects.toThrow(
        'Invalid update recurring expense response'
      )
      expect(store.error).toBe('Invalid update recurring expense response')
    })
  })

  describe('deleteRecurringExpense', () => {
    it('removes from list', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]
      mockApi.deleteRecurringExpense.mockResolvedValueOnce(undefined)

      await store.deleteRecurringExpense(1)

      expect(store.recurringExpenses).toHaveLength(0)
    })

    it('clears currentRecurringExpense if matches', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]
      store.currentRecurringExpense = mockRecurringExpense
      mockApi.deleteRecurringExpense.mockResolvedValueOnce(undefined)

      await store.deleteRecurringExpense(1)

      expect(store.currentRecurringExpense).toBe(null)
    })

    it('sets fallback error message when delete fails with unknown error', async () => {
      const store = useRecurringExpenseStore()
      mockApi.deleteRecurringExpense.mockRejectedValueOnce('delete failed')

      await expect(store.deleteRecurringExpense(1)).rejects.toBe('delete failed')
      expect(store.error).toBe('Failed to delete recurring expense')
    })
  })

  describe('fetchUpcoming', () => {
    it('fetches upcoming expenses', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getUpcomingRecurringExpenses.mockResolvedValueOnce({
        data: [mockRecurringExpense],
      })

      const result = await store.fetchUpcoming(7)

      expect(result).toEqual([mockRecurringExpense])
      expect(store.upcomingExpenses).toEqual([mockRecurringExpense])
      expect(mockApi.getUpcomingRecurringExpenses).toHaveBeenCalledWith(7)
    })

    it('rejects malformed upcoming response contract', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getUpcomingRecurringExpenses.mockResolvedValueOnce({
        data: [{ id: 1 }],
      })

      await expect(store.fetchUpcoming()).rejects.toThrow(
        'Invalid recurring expense upcoming response'
      )
      expect(store.error).toBe('Invalid recurring expense upcoming response')
    })

    it('sets fallback error message when upcoming fails with unknown error', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getUpcomingRecurringExpenses.mockRejectedValueOnce('upcoming failed')

      await expect(store.fetchUpcoming()).rejects.toBe('upcoming failed')
      expect(store.error).toBe('Failed to fetch upcoming expenses')
    })
  })

  describe('generateExpense', () => {
    it('generates expense from recurring', async () => {
      const store = useRecurringExpenseStore()
      mockApi.generateExpenseFromRecurring.mockResolvedValueOnce({ data: mockExpense })

      const result = await store.generateExpense(1, { amount: 15000 })

      expect(result).toEqual(mockExpense)
      expect(mockApi.generateExpenseFromRecurring).toHaveBeenCalledWith(1, { amount: 15000 })
    })

    it('works without data parameter', async () => {
      const store = useRecurringExpenseStore()
      mockApi.generateExpenseFromRecurring.mockResolvedValueOnce({ data: mockExpense })

      await store.generateExpense(1)

      expect(mockApi.generateExpenseFromRecurring).toHaveBeenCalledWith(1, undefined)
    })

    it('rejects malformed generate response contract', async () => {
      const store = useRecurringExpenseStore()
      mockApi.generateExpenseFromRecurring.mockResolvedValueOnce({ data: { id: 10 } })

      await expect(store.generateExpense(1)).rejects.toThrow(
        'Invalid generate recurring expense response'
      )
      expect(store.error).toBe('Invalid generate recurring expense response')
    })
  })

  describe('fetchHistory', () => {
    it('fetches history for recurring expense', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpenseHistory.mockResolvedValueOnce({ data: [mockExpense] })

      const result = await store.fetchHistory(1, 10)

      expect(result).toEqual([mockExpense])
      expect(store.history).toEqual([mockExpense])
      expect(mockApi.getRecurringExpenseHistory).toHaveBeenCalledWith(1, 10)
    })

    it('rejects malformed history response contract', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpenseHistory.mockResolvedValueOnce({ data: [{ id: 10 }] })

      await expect(store.fetchHistory(1)).rejects.toThrow(
        'Invalid recurring expense history response'
      )
      expect(store.error).toBe('Invalid recurring expense history response')
    })

    it('sets fallback error message when history fails with unknown error', async () => {
      const store = useRecurringExpenseStore()
      mockApi.getRecurringExpenseHistory.mockRejectedValueOnce('history failed')

      await expect(store.fetchHistory(1)).rejects.toBe('history failed')
      expect(store.error).toBe('Failed to fetch history')
    })
  })

  describe('setFilters', () => {
    it('merges filters', () => {
      const store = useRecurringExpenseStore()
      store.filters = { is_active: true }

      store.setFilters({ category: 'food' })

      expect(store.filters).toEqual({ is_active: true, category: 'food' })
    })
  })

  describe('clearFilters', () => {
    it('resets filters to empty object', () => {
      const store = useRecurringExpenseStore()
      store.filters = { is_active: true, category: 'food' }

      store.clearFilters()

      expect(store.filters).toEqual({})
    })
  })

  describe('clearCurrentRecurringExpense', () => {
    it('clears current and history', () => {
      const store = useRecurringExpenseStore()
      store.currentRecurringExpense = mockRecurringExpense
      store.history = [mockExpense]

      store.clearCurrentRecurringExpense()

      expect(store.currentRecurringExpense).toBe(null)
      expect(store.history).toEqual([])
    })
  })
})
