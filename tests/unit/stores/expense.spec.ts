import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenseStore } from '~/stores/expense'
import type { Expense, PaginationMeta } from '~/types'

// Mock the API client
const mockApi = {
  getExpenses: vi.fn(),
  getExpense: vi.fn(),
  createEntry: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  createExpenseDecision: vi.fn(),
  updateExpenseDecision: vi.fn(),
  deleteExpenseDecision: vi.fn(),
}

vi.mock('~/utils/api', () => ({
  useApiClient: () => mockApi,
}))

describe('useExpenseStore', () => {
  const mockExpense: Expense = {
    id: 1,
    amount: '500',
    currency: 'TWD',
    category: 'food',
    category_label: '飲食',
    occurred_at: '2024-03-15T12:00:00',
    note: 'Lunch',
    decision: {
      id: 1,
      expense_id: 1,
      intent: 'necessity',
      intent_label: '必要',
      confidence_level: 'high',
      confidence_level_label: '很滿意',
      decision_note: null,
      created_at: '2024-03-15T12:00:00',
      updated_at: '2024-03-15T12:00:00',
    },
    created_at: '2024-03-15T12:00:00',
    updated_at: '2024-03-15T12:00:00',
  }

  const mockPagination: PaginationMeta = {
    current_page: 1,
    last_page: 2,
    per_page: 15,
    total: 25,
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct initial state', () => {
      const store = useExpenseStore()

      expect(store.expenses).toEqual([])
      expect(store.currentExpense).toBe(null)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.filters).toEqual({ preset: 'this_month' })
      expect(store.pagination).toBe(null)
    })
  })

  describe('getters', () => {
    it('hasExpenses returns false when empty', () => {
      const store = useExpenseStore()
      expect(store.hasExpenses).toBe(false)
    })

    it('hasExpenses returns true when has expenses', () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      expect(store.hasExpenses).toBe(true)
    })

    it('totalPages returns 1 when no pagination', () => {
      const store = useExpenseStore()
      expect(store.totalPages).toBe(1)
    })

    it('totalPages returns correct value', () => {
      const store = useExpenseStore()
      store.pagination = mockPagination
      expect(store.totalPages).toBe(2)
    })

    it('currentPage returns 1 when no pagination', () => {
      const store = useExpenseStore()
      expect(store.currentPage).toBe(1)
    })

    it('currentPage returns correct value', () => {
      const store = useExpenseStore()
      store.pagination = mockPagination
      expect(store.currentPage).toBe(1)
    })

    it('totalItems returns 0 when no pagination', () => {
      const store = useExpenseStore()
      expect(store.totalItems).toBe(0)
    })

    it('totalItems returns correct value', () => {
      const store = useExpenseStore()
      store.pagination = mockPagination
      expect(store.totalItems).toBe(25)
    })
  })

  describe('fetchExpenses', () => {
    it('fetches expenses successfully', async () => {
      const store = useExpenseStore()
      mockApi.getExpenses.mockResolvedValueOnce({
        data: [mockExpense],
        meta: mockPagination,
      })

      await store.fetchExpenses()

      expect(store.expenses).toEqual([mockExpense])
      expect(store.pagination).toEqual(mockPagination)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('sets loading during fetch', async () => {
      const store = useExpenseStore()
      let loadingDuringFetch = false

      mockApi.getExpenses.mockImplementationOnce(async () => {
        loadingDuringFetch = store.loading
        return { data: [], meta: mockPagination }
      })

      await store.fetchExpenses()

      expect(loadingDuringFetch).toBe(true)
    })

    it('handles fetch error', async () => {
      const store = useExpenseStore()
      mockApi.getExpenses.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchExpenses()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })

    it('rejects malformed list response contract', async () => {
      const store = useExpenseStore()
      mockApi.getExpenses.mockResolvedValueOnce({
        data: null,
        meta: { current_page: 1 },
      })

      await expect(store.fetchExpenses()).rejects.toThrow('Invalid expense list response')
      expect(store.error).toBe('Invalid expense list response')
      expect(store.loading).toBe(false)
    })

    it('keeps previous list state when malformed contract response is returned', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      store.pagination = mockPagination

      mockApi.getExpenses.mockResolvedValueOnce({
        data: undefined,
        meta: undefined,
      })

      await expect(store.fetchExpenses()).rejects.toThrow('Invalid expense list response')
      expect(store.expenses).toEqual([mockExpense])
      expect(store.pagination).toEqual(mockPagination)
    })

    it('passes params to API', async () => {
      const store = useExpenseStore()
      mockApi.getExpenses.mockResolvedValueOnce({ data: [], meta: mockPagination })

      const params = {
        page: 2,
        per_page: 20,
        preset: 'this_month' as const,
        category: ['food', 'living'] as const,
        intent: ['necessity'] as const,
      }
      await store.fetchExpenses(params)

      expect(mockApi.getExpenses).toHaveBeenCalledWith(params)
    })
  })

  describe('fetchExpenseById', () => {
    it('fetches single expense successfully', async () => {
      const store = useExpenseStore()
      mockApi.getExpense.mockResolvedValueOnce({ data: mockExpense })

      const result = await store.fetchExpenseById(1)

      expect(result).toEqual(mockExpense)
      expect(store.currentExpense).toEqual(mockExpense)
    })

    it('handles fetch error', async () => {
      const store = useExpenseStore()
      mockApi.getExpense.mockRejectedValueOnce(new Error('Not found'))

      await expect(store.fetchExpenseById(999)).rejects.toThrow('Not found')
      expect(store.error).toBe('Not found')
    })

    it('rejects malformed expense detail response contract', async () => {
      const store = useExpenseStore()
      mockApi.getExpense.mockResolvedValueOnce({ data: { id: 'bad' } })

      await expect(store.fetchExpenseById(1)).rejects.toThrow('Invalid expense detail response')
      expect(store.error).toBe('Invalid expense detail response')
    })
  })

  describe('createExpense', () => {
    it('creates expense and adds to list', async () => {
      const store = useExpenseStore()
      store.expenses = []
      mockApi.createEntry.mockResolvedValueOnce({ data: mockExpense })

      const result = await store.createExpense({
        amount: 500,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      })

      expect(result).toEqual(mockExpense)
      expect(store.expenses[0]).toEqual(mockExpense)
    })

    it('adds new expense to beginning of list', async () => {
      const store = useExpenseStore()
      const existingExpense = { ...mockExpense, id: 2 }
      store.expenses = [existingExpense]

      mockApi.createEntry.mockResolvedValueOnce({ data: mockExpense })

      await store.createExpense({
        amount: 500,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      })

      expect(store.expenses[0]).toEqual(mockExpense)
      expect(store.expenses[1]).toEqual(existingExpense)
    })

    it('handles create error', async () => {
      const store = useExpenseStore()
      mockApi.createEntry.mockRejectedValueOnce(new Error('Validation error'))

      await expect(
        store.createExpense({
          amount: 500,
          category: 'food',
          occurred_at: '2024-03-15',
          intent: 'necessity',
        })
      ).rejects.toThrow('Validation error')
      expect(store.error).toBe('Validation error')
    })

    it('passes entry payload contract to create API', async () => {
      const store = useExpenseStore()
      mockApi.createEntry.mockResolvedValueOnce({ data: mockExpense })
      const payload = {
        amount: 500,
        category: 'food' as const,
        occurred_at: '2024-03-15',
        intent: 'necessity' as const,
        decision_note: 'needed energy',
      }

      await store.createExpense(payload)
      expect(mockApi.createEntry).toHaveBeenCalledWith(payload)
    })

    it('rejects malformed create entry response contract', async () => {
      const store = useExpenseStore()
      mockApi.createEntry.mockResolvedValueOnce({ data: { id: null } })

      await expect(
        store.createExpense({
          amount: 500,
          category: 'food',
          occurred_at: '2024-03-15',
          intent: 'necessity',
        })
      ).rejects.toThrow('Invalid create entry response')
      expect(store.error).toBe('Invalid create entry response')
    })
  })

  describe('updateExpense', () => {
    it('updates expense in list', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]

      const updatedExpense = { ...mockExpense, amount: '1000' }
      mockApi.updateExpense.mockResolvedValueOnce({ data: updatedExpense })

      const result = await store.updateExpense(1, { amount: 1000 })

      expect(result).toEqual(updatedExpense)
      expect(store.expenses[0].amount).toBe('1000')
    })

    it('updates currentExpense if it matches', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      store.currentExpense = mockExpense

      const updatedExpense = { ...mockExpense, note: 'Updated' }
      mockApi.updateExpense.mockResolvedValueOnce({ data: updatedExpense })

      await store.updateExpense(1, { note: 'Updated' })

      expect(store.currentExpense?.note).toBe('Updated')
    })

    it('does not update currentExpense if id does not match', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      store.currentExpense = { ...mockExpense, id: 999 }

      const updatedExpense = { ...mockExpense, note: 'Updated' }
      mockApi.updateExpense.mockResolvedValueOnce({ data: updatedExpense })

      await store.updateExpense(1, { note: 'Updated' })

      expect(store.currentExpense?.id).toBe(999)
    })

    it('rejects malformed update response contract', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.updateExpense.mockResolvedValueOnce({ data: { id: 'bad' } })

      await expect(store.updateExpense(1, { amount: 1000 })).rejects.toThrow(
        'Invalid update expense response'
      )
      expect(store.error).toBe('Invalid update expense response')
    })
  })

  describe('deleteExpense', () => {
    it('removes expense from list', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense, { ...mockExpense, id: 2 }]
      mockApi.deleteExpense.mockResolvedValueOnce(undefined)

      await store.deleteExpense(1)

      expect(store.expenses).toHaveLength(1)
      expect(store.expenses[0].id).toBe(2)
    })

    it('clears currentExpense if it matches', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      store.currentExpense = mockExpense
      mockApi.deleteExpense.mockResolvedValueOnce(undefined)

      await store.deleteExpense(1)

      expect(store.currentExpense).toBe(null)
    })

    it('handles delete error', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.deleteExpense.mockRejectedValueOnce(new Error('Delete failed'))

      await expect(store.deleteExpense(1)).rejects.toThrow('Delete failed')
      expect(store.expenses).toHaveLength(1)
    })
  })

  describe('upsertDecision', () => {
    it('updates decision when update endpoint succeeds', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      const updatedDecision = {
        ...mockExpense.decision!,
        intent: 'efficiency' as const,
        intent_label: '效率',
      }
      mockApi.updateExpenseDecision.mockResolvedValueOnce({ data: updatedDecision })

      const result = await store.upsertDecision(1, {
        intent: 'efficiency',
      })

      expect(result.intent).toBe('efficiency')
      expect(mockApi.createExpenseDecision).not.toHaveBeenCalled()
      expect(store.expenses[0].decision?.intent).toBe('efficiency')
    })

    it('falls back to create decision when update returns 404', async () => {
      const store = useExpenseStore()
      store.expenses = [{ ...mockExpense, decision: null }]
      const createdDecision = {
        ...mockExpense.decision!,
      }
      mockApi.updateExpenseDecision.mockRejectedValueOnce({
        statusCode: 404,
      })
      mockApi.createExpenseDecision.mockResolvedValueOnce({ data: createdDecision })

      const result = await store.upsertDecision(1, {
        intent: 'necessity',
        decision_note: 'needed',
      })

      expect(result.id).toBe(createdDecision.id)
      expect(mockApi.createExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'necessity',
        decision_note: 'needed',
      })
      expect(store.expenses[0].decision?.intent).toBe('necessity')
    })

    it('falls back to create decision when update error exposes status=404', async () => {
      const store = useExpenseStore()
      store.expenses = [{ ...mockExpense, decision: null }]
      mockApi.updateExpenseDecision.mockRejectedValueOnce({
        status: 404,
      })
      mockApi.createExpenseDecision.mockResolvedValueOnce({ data: mockExpense.decision })

      await store.upsertDecision(1, { intent: 'necessity' })

      expect(mockApi.createExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'necessity',
      })
      expect(store.expenses[0].decision?.intent).toBe('necessity')
    })

    it('falls back to create decision when update error exposes response.status=404', async () => {
      const store = useExpenseStore()
      store.expenses = [{ ...mockExpense, decision: null }]
      mockApi.updateExpenseDecision.mockRejectedValueOnce({
        response: { status: 404 },
      })
      mockApi.createExpenseDecision.mockResolvedValueOnce({ data: mockExpense.decision })

      await store.upsertDecision(1, { intent: 'necessity' })

      expect(mockApi.createExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'necessity',
      })
      expect(store.expenses[0].decision?.intent).toBe('necessity')
    })

    it('rejects malformed upsert decision response contract', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.updateExpenseDecision.mockResolvedValueOnce({ data: { id: 'bad' } })

      await expect(store.upsertDecision(1, { intent: 'necessity' })).rejects.toThrow(
        'Invalid upsert decision response'
      )
      expect(store.error).toBe('Invalid upsert decision response')
    })

    it('does not fallback to create decision for non-404 errors', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.updateExpenseDecision.mockRejectedValueOnce({
        statusCode: 422,
        message: 'validation failed',
      })

      await expect(store.upsertDecision(1, { intent: 'necessity' })).rejects.toEqual({
        statusCode: 422,
        message: 'validation failed',
      })
      expect(mockApi.createExpenseDecision).not.toHaveBeenCalled()
    })
  })

  describe('deleteDecision', () => {
    it('deletes expense decision and updates local state', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      store.currentExpense = mockExpense
      mockApi.deleteExpenseDecision.mockResolvedValueOnce(undefined)

      await store.deleteDecision(1)

      expect(store.expenses[0].decision).toBe(null)
      expect(store.currentExpense?.decision).toBe(null)
    })

    it('sets fallback error message when delete decision fails with unknown error', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.deleteExpenseDecision.mockRejectedValueOnce('delete failed')

      await expect(store.deleteDecision(1)).rejects.toBe('delete failed')
      expect(store.error).toBe('Failed to delete decision')
    })
  })

  describe('setFilters', () => {
    it('merges new filters with existing', () => {
      const store = useExpenseStore()
      store.filters = { preset: 'this_month' }

      store.setFilters({ categories: ['food'] })

      expect(store.filters).toEqual({
        preset: 'this_month',
        categories: ['food'],
      })
    })

    it('overwrites existing filter values', () => {
      const store = useExpenseStore()
      store.filters = { preset: 'this_month' }

      store.setFilters({ preset: 'today' })

      expect(store.filters.preset).toBe('today')
    })
  })

  describe('clearFilters', () => {
    it('resets filters to default', () => {
      const store = useExpenseStore()
      store.filters = {
        preset: 'custom',
        dateFrom: '2024-01-01',
        dateTo: '2024-03-31',
        categories: ['food'],
      }

      store.clearFilters()

      expect(store.filters).toEqual({ preset: 'this_month' })
    })
  })

  describe('clearCurrentExpense', () => {
    it('clears current expense', () => {
      const store = useExpenseStore()
      store.currentExpense = mockExpense

      store.clearCurrentExpense()

      expect(store.currentExpense).toBe(null)
    })
  })
})
