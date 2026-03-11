import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenses } from '~/composables/useExpenses'
import { useExpenseStore } from '~/stores/expense'
import { useUiStore } from '~/stores/ui'
import type { Expense } from '~/types'

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

describe('useExpenses', () => {
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

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('computed properties', () => {
    it('exposes expenses from store', () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]

      const { expenses } = useExpenses()

      expect(expenses.value).toEqual([mockExpense])
    })

    it('exposes loading from store', () => {
      const store = useExpenseStore()
      store.loading = true

      const { loading } = useExpenses()

      expect(loading.value).toBe(true)
    })

    it('exposes error from store', () => {
      const store = useExpenseStore()
      store.error = 'Test error'

      const { error } = useExpenses()

      expect(error.value).toBe('Test error')
    })

    it('exposes hasExpenses from store', () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]

      const { hasExpenses } = useExpenses()

      expect(hasExpenses.value).toBe(true)
    })

    it('exposes pagination info from store', () => {
      const store = useExpenseStore()
      store.pagination = {
        current_page: 2,
        last_page: 5,
        per_page: 15,
        total: 75,
      }

      const { currentPage, totalPages, totalItems } = useExpenses()

      expect(currentPage.value).toBe(2)
      expect(totalPages.value).toBe(5)
      expect(totalItems.value).toBe(75)
    })
  })

  describe('fetchExpenses', () => {
    it('calls store fetchExpenses', async () => {
      mockApi.getExpenses.mockResolvedValueOnce({
        data: [mockExpense],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      })

      const { fetchExpenses, expenses } = useExpenses()

      await fetchExpenses()

      expect(expenses.value).toEqual([mockExpense])
    })

    it('shows error toast on failure', async () => {
      mockApi.getExpenses.mockRejectedValueOnce(new Error('Network error'))
      const uiStore = useUiStore()

      const { fetchExpenses } = useExpenses()

      await fetchExpenses()

      expect(uiStore.toasts).toHaveLength(1)
      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('載入失敗')
    })

    it('shows error toast when API response contract is malformed', async () => {
      mockApi.getExpenses.mockRejectedValueOnce(new Error('Invalid expense list response'))
      const uiStore = useUiStore()

      const { fetchExpenses } = useExpenses()
      await fetchExpenses()

      expect(uiStore.toasts).toHaveLength(1)
      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('載入失敗')
    })

    it('passes params to store', async () => {
      mockApi.getExpenses.mockResolvedValueOnce({
        data: [],
        meta: { current_page: 2, last_page: 5, per_page: 20, total: 100 },
      })

      const { fetchExpenses } = useExpenses()

      await fetchExpenses({ page: 2, per_page: 20 })

      expect(mockApi.getExpenses).toHaveBeenCalledWith({ page: 2, per_page: 20 })
    })

    it('forwards expense list filter contract params to API', async () => {
      mockApi.getExpenses.mockResolvedValueOnce({
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      })

      const { fetchExpenses } = useExpenses()

      await fetchExpenses({
        per_page: 100,
        preset: 'this_month',
        category: ['food', 'living'],
        intent: ['necessity', 'impulse'],
      })

      expect(mockApi.getExpenses).toHaveBeenCalledWith({
        per_page: 100,
        preset: 'this_month',
        category: ['food', 'living'],
        intent: ['necessity', 'impulse'],
      })
    })
  })

  describe('createExpense', () => {
    it('creates expense and shows success toast', async () => {
      mockApi.createEntry.mockResolvedValueOnce({ data: mockExpense })
      const uiStore = useUiStore()

      const { createExpense } = useExpenses()

      const result = await createExpense({
        amount: 500,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      })

      expect(result).toEqual(mockExpense)
      expect(uiStore.toasts[0].type).toBe('success')
      expect(uiStore.toasts[0].title).toBe('新增成功')
    })

    it('shows error toast on failure', async () => {
      mockApi.createEntry.mockRejectedValueOnce(new Error('Validation error'))
      const uiStore = useUiStore()

      const { createExpense } = useExpenses()

      await expect(
        createExpense({
          amount: 500,
          category: 'food',
          occurred_at: '2024-03-15',
          intent: 'necessity',
        })
      ).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('新增失敗')
    })

    it.each([401, 422, 500])('shows create error toast for HTTP %i', async (statusCode) => {
      mockApi.createEntry.mockRejectedValueOnce({ statusCode, message: 'request failed' })
      const uiStore = useUiStore()
      const { createExpense } = useExpenses()

      await expect(
        createExpense({
          amount: 500,
          category: 'food',
          occurred_at: '2024-03-15',
          intent: 'necessity',
        })
      ).rejects.toBeTruthy()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('新增失敗')
    })
  })

  describe('updateExpense', () => {
    it('updates expense and shows success toast', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]

      const updatedExpense = { ...mockExpense, amount: '1000' }
      mockApi.updateExpense.mockResolvedValueOnce({ data: updatedExpense })
      const uiStore = useUiStore()

      const { updateExpense } = useExpenses()

      const result = await updateExpense(1, { amount: 1000 })

      expect(result?.amount).toBe('1000')
      expect(uiStore.toasts[0].type).toBe('success')
      expect(uiStore.toasts[0].title).toBe('更新成功')
    })

    it('shows error toast on failure', async () => {
      mockApi.updateExpense.mockRejectedValueOnce(new Error('Update failed'))
      const uiStore = useUiStore()

      const { updateExpense } = useExpenses()

      await expect(updateExpense(1, { amount: 1000 })).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('更新失敗')
    })

    it.each([401, 422, 500])('shows update error toast for HTTP %i', async (statusCode) => {
      mockApi.updateExpense.mockRejectedValueOnce({ statusCode, message: 'request failed' })
      const uiStore = useUiStore()
      const { updateExpense } = useExpenses()

      await expect(updateExpense(1, { amount: 1000 })).rejects.toBeTruthy()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('更新失敗')
    })

    it('upserts decision via decision API when update payload contains intent', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      const uiStore = useUiStore()

      const updatedExpense = { ...mockExpense, amount: '1000' }
      mockApi.updateExpense.mockResolvedValueOnce({ data: updatedExpense })
      mockApi.updateExpenseDecision.mockResolvedValueOnce({
        data: {
          ...mockExpense.decision!,
          intent: 'efficiency',
          intent_label: '效率',
        },
      })

      const { updateExpense } = useExpenses()
      await updateExpense(1, {
        amount: 1000,
        intent: 'efficiency',
        confidence_level: 'high',
        decision_note: 'optimize',
      })

      expect(mockApi.updateExpense).toHaveBeenCalledWith(1, { amount: 1000 })
      expect(mockApi.updateExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'efficiency',
        confidence_level: 'high',
        decision_note: 'optimize',
      })
      expect(uiStore.toasts[0].type).toBe('success')
    })

    it('upserts decision without calling expense update when only decision fields are present', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]

      mockApi.updateExpenseDecision.mockResolvedValueOnce({
        data: {
          ...mockExpense.decision!,
          intent: 'recovery',
          intent_label: '恢復',
        },
      })

      const { updateExpense } = useExpenses()
      await updateExpense(1, {
        intent: 'recovery',
        decision_note: 'take break',
      })

      expect(mockApi.updateExpense).not.toHaveBeenCalled()
      expect(mockApi.updateExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'recovery',
        decision_note: 'take break',
      })
    })

    it('does not call update APIs when payload is empty', async () => {
      const { updateExpense } = useExpenses()

      await updateExpense(1, {})

      expect(mockApi.updateExpense).not.toHaveBeenCalled()
      expect(mockApi.updateExpenseDecision).not.toHaveBeenCalled()
    })

    it('returns null when decision-only update cannot find target expense by id', async () => {
      const store = useExpenseStore()
      store.expenses = []
      store.currentExpense = { ...mockExpense, id: 999 }
      mockApi.updateExpenseDecision.mockResolvedValueOnce({
        data: {
          ...mockExpense.decision!,
          intent: 'efficiency',
          intent_label: '效率',
        },
      })

      const { updateExpense } = useExpenses()
      const result = await updateExpense(1, {
        intent: 'efficiency',
      })

      expect(result).toBe(null)
      expect(mockApi.updateExpense).not.toHaveBeenCalled()
      expect(mockApi.updateExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'efficiency',
      })
    })

    it('skips expense update when expense fields are unchanged but decision changes', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]

      mockApi.updateExpenseDecision.mockResolvedValueOnce({
        data: {
          ...mockExpense.decision!,
          intent: 'efficiency',
          intent_label: '效率',
        },
      })

      const { updateExpense } = useExpenses()
      await updateExpense(1, {
        amount: 500,
        category: 'food',
        occurred_at: '2024-03-15T12:00:00',
        note: 'Lunch',
        intent: 'efficiency',
      })

      expect(mockApi.updateExpense).not.toHaveBeenCalled()
      expect(mockApi.updateExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'efficiency',
      })
    })

    it('sends nullable fields when clearing note and decision_note on update', async () => {
      const store = useExpenseStore()
      store.expenses = [
        {
          ...mockExpense,
          note: 'Legacy note',
          decision: {
            ...mockExpense.decision!,
            decision_note: 'legacy decision note',
          },
        },
      ]

      mockApi.updateExpense.mockResolvedValueOnce({
        data: {
          ...mockExpense,
          note: null,
        },
      })
      mockApi.updateExpenseDecision.mockResolvedValueOnce({
        data: {
          ...mockExpense.decision!,
          decision_note: null,
        },
      })

      const { updateExpense } = useExpenses()
      await updateExpense(1, {
        amount: 500,
        category: 'food',
        occurred_at: '2024-03-15T12:00:00',
        note: null,
        intent: 'necessity',
        confidence_level: null,
        decision_note: null,
      })

      expect(mockApi.updateExpense).toHaveBeenCalledWith(1, { note: null })
      expect(mockApi.updateExpenseDecision).toHaveBeenCalledWith(1, {
        intent: 'necessity',
        confidence_level: null,
        decision_note: null,
      })
    })
  })

  describe('deleteExpense', () => {
    it('deletes expense and shows success toast', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.deleteExpense.mockResolvedValueOnce(undefined)
      const uiStore = useUiStore()

      const { deleteExpense } = useExpenses()

      await deleteExpense(1)

      expect(store.expenses).toHaveLength(0)
      expect(uiStore.toasts[0].type).toBe('success')
      expect(uiStore.toasts[0].title).toBe('刪除成功')
    })

    it('shows error toast on failure', async () => {
      mockApi.deleteExpense.mockRejectedValueOnce(new Error('Delete failed'))
      const uiStore = useUiStore()

      const { deleteExpense } = useExpenses()

      await expect(deleteExpense(1)).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('刪除失敗')
    })

    it.each([401, 422, 500])('shows delete error toast for HTTP %i', async (statusCode) => {
      mockApi.deleteExpense.mockRejectedValueOnce({ statusCode, message: 'request failed' })
      const uiStore = useUiStore()
      const { deleteExpense } = useExpenses()

      await expect(deleteExpense(1)).rejects.toBeTruthy()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('刪除失敗')
    })
  })

  describe('confirmDelete', () => {
    it('opens confirm dialog with correct props', () => {
      const uiStore = useUiStore()

      const { confirmDelete } = useExpenses()

      confirmDelete(1)

      expect(uiStore.isConfirmDialogOpen).toBe(true)
      expect(uiStore.confirmDialogProps?.title).toBe('確認刪除')
      expect(uiStore.confirmDialogProps?.variant).toBe('danger')
    })

    it('deletes expense on confirm', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.deleteExpense.mockResolvedValueOnce(undefined)
      const uiStore = useUiStore()

      const { confirmDelete } = useExpenses()

      confirmDelete(1)

      // Simulate confirm
      await uiStore.confirmDialogProps?.onConfirm()

      expect(store.expenses).toHaveLength(0)
      expect(uiStore.isConfirmDialogOpen).toBe(false)
    })

    it('calls onSuccess callback after successful delete', async () => {
      const store = useExpenseStore()
      store.expenses = [mockExpense]
      mockApi.deleteExpense.mockResolvedValueOnce(undefined)
      const uiStore = useUiStore()
      const onSuccess = vi.fn()

      const { confirmDelete } = useExpenses()

      confirmDelete(1, onSuccess)
      await uiStore.confirmDialogProps?.onConfirm()

      expect(onSuccess).toHaveBeenCalled()
    })
  })
})
