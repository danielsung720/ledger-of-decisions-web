import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRecurringExpenses } from '~/composables/useRecurringExpenses'
import { useRecurringExpenseStore } from '~/stores/recurring-expense'
import { useUiStore } from '~/stores/ui'
import type { RecurringExpense } from '~/types/recurring-expense'
import type { Expense } from '~/types'

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

describe('useRecurringExpenses', () => {
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

  describe('computed properties', () => {
    it('exposes recurringExpenses from store', () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]

      const { recurringExpenses } = useRecurringExpenses()

      expect(recurringExpenses.value).toEqual([mockRecurringExpense])
    })

    it('exposes activeRecurringExpenses from store', () => {
      const store = useRecurringExpenseStore()
      const inactive = { ...mockRecurringExpense, id: 2, is_active: false }
      store.recurringExpenses = [mockRecurringExpense, inactive]

      const { activeRecurringExpenses } = useRecurringExpenses()

      expect(activeRecurringExpenses.value).toHaveLength(1)
      expect(activeRecurringExpenses.value[0].id).toBe(1)
    })

    it('exposes inactiveRecurringExpenses from store', () => {
      const store = useRecurringExpenseStore()
      const inactive = { ...mockRecurringExpense, id: 2, is_active: false }
      store.recurringExpenses = [mockRecurringExpense, inactive]

      const { inactiveRecurringExpenses } = useRecurringExpenses()

      expect(inactiveRecurringExpenses.value).toHaveLength(1)
      expect(inactiveRecurringExpenses.value[0].id).toBe(2)
    })
  })

  describe('fetchRecurringExpenses', () => {
    it('passes array filters to store fetch', async () => {
      const { fetchRecurringExpenses } = useRecurringExpenses()

      await fetchRecurringExpenses({
        category: ['food', 'transport'],
        frequency_type: ['monthly', 'yearly'],
        is_active: true,
      })

      expect(mockApi.getRecurringExpenses).toHaveBeenCalledWith({
        category: ['food', 'transport'],
        frequency_type: ['monthly', 'yearly'],
        is_active: true,
      })
    })

    it('fetches and shows error toast on failure', async () => {
      mockApi.getRecurringExpenses.mockRejectedValueOnce(new Error('Network error'))
      const uiStore = useUiStore()

      const { fetchRecurringExpenses } = useRecurringExpenses()

      await fetchRecurringExpenses()

      expect(uiStore.toasts[0].type).toBe('error')
      expect(uiStore.toasts[0].title).toBe('載入失敗')
    })
  })

  describe('fetchRecurringExpenseById', () => {
    it('returns recurring expense', async () => {
      mockApi.getRecurringExpense.mockResolvedValueOnce({ data: mockRecurringExpense })

      const { fetchRecurringExpenseById } = useRecurringExpenses()

      const result = await fetchRecurringExpenseById(1)

      expect(result).toEqual(mockRecurringExpense)
    })

    it('shows error toast on failure', async () => {
      mockApi.getRecurringExpense.mockRejectedValueOnce(new Error('Not found'))
      const uiStore = useUiStore()

      const { fetchRecurringExpenseById } = useRecurringExpenses()

      await expect(fetchRecurringExpenseById(999)).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('createRecurringExpense', () => {
    it('creates and shows success toast', async () => {
      mockApi.createRecurringExpense.mockResolvedValueOnce({ data: mockRecurringExpense })
      const uiStore = useUiStore()

      const { createRecurringExpense } = useRecurringExpenses()

      const result = await createRecurringExpense({
        name: 'Monthly Rent',
        amount_min: 15000,
        category: 'living',
        frequency_type: 'monthly',
        start_date: '2024-01-01',
      })

      expect(result).toEqual(mockRecurringExpense)
      expect(uiStore.toasts[0].type).toBe('success')
      expect(uiStore.toasts[0].title).toBe('新增成功')
    })

    it('shows error toast on failure', async () => {
      mockApi.createRecurringExpense.mockRejectedValueOnce(new Error('Validation error'))
      const uiStore = useUiStore()

      const { createRecurringExpense } = useRecurringExpenses()

      await expect(
        createRecurringExpense({
          name: 'Test',
          amount_min: 100,
          category: 'food',
          frequency_type: 'daily',
          start_date: '2024-01-01',
        })
      ).rejects.toThrow()

      expect(uiStore.toasts[0].type).toBe('error')
    })
  })

  describe('updateRecurringExpense', () => {
    it('updates and shows success toast', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]

      const updated = { ...mockRecurringExpense, name: 'Updated' }
      mockApi.updateRecurringExpense.mockResolvedValueOnce({ data: updated })
      const uiStore = useUiStore()

      const { updateRecurringExpense } = useRecurringExpenses()

      const result = await updateRecurringExpense(1, { name: 'Updated' })

      expect(result?.name).toBe('Updated')
      expect(uiStore.toasts[0].type).toBe('success')
    })

    it('passes nullable fields when clearing optional values', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]
      mockApi.updateRecurringExpense.mockResolvedValueOnce({
        data: {
          ...mockRecurringExpense,
          amount_max: null,
          end_date: null,
          default_intent: null,
          note: null,
        },
      })

      const { updateRecurringExpense } = useRecurringExpenses()
      await updateRecurringExpense(1, {
        name: 'Monthly Rent',
        amount_min: 15000,
        amount_max: null,
        category: 'living',
        frequency_type: 'monthly',
        frequency_interval: 1,
        day_of_month: null,
        month_of_year: null,
        day_of_week: null,
        start_date: '2024-01-01',
        end_date: null,
        default_intent: null,
        note: null,
      })

      expect(mockApi.updateRecurringExpense).toHaveBeenCalledWith(1, {
        name: 'Monthly Rent',
        amount_min: 15000,
        amount_max: null,
        category: 'living',
        frequency_type: 'monthly',
        frequency_interval: 1,
        day_of_month: null,
        month_of_year: null,
        day_of_week: null,
        start_date: '2024-01-01',
        end_date: null,
        default_intent: null,
        note: null,
      })
    })
  })

  describe('deleteRecurringExpense', () => {
    it('deletes and shows success toast', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]
      mockApi.deleteRecurringExpense.mockResolvedValueOnce(undefined)
      const uiStore = useUiStore()

      const { deleteRecurringExpense } = useRecurringExpenses()

      await deleteRecurringExpense(1)

      expect(store.recurringExpenses).toHaveLength(0)
      expect(uiStore.toasts[0].type).toBe('success')
    })
  })

  describe('toggleActive', () => {
    it('activates and shows success toast', async () => {
      const store = useRecurringExpenseStore()
      const inactive = { ...mockRecurringExpense, is_active: false }
      store.recurringExpenses = [inactive]

      const activated = { ...mockRecurringExpense, is_active: true }
      mockApi.updateRecurringExpense.mockResolvedValueOnce({ data: activated })
      const uiStore = useUiStore()

      const { toggleActive } = useRecurringExpenses()

      await toggleActive(1, true)

      expect(uiStore.toasts[0].title).toBe('已啟用')
    })

    it('deactivates and shows success toast', async () => {
      const store = useRecurringExpenseStore()
      store.recurringExpenses = [mockRecurringExpense]

      const deactivated = { ...mockRecurringExpense, is_active: false }
      mockApi.updateRecurringExpense.mockResolvedValueOnce({ data: deactivated })
      const uiStore = useUiStore()

      const { toggleActive } = useRecurringExpenses()

      await toggleActive(1, false)

      expect(uiStore.toasts[0].title).toBe('已停用')
    })
  })

  describe('fetchUpcoming', () => {
    it('fetches upcoming expenses', async () => {
      mockApi.getUpcomingRecurringExpenses.mockResolvedValueOnce({
        data: [mockRecurringExpense],
      })

      const { fetchUpcoming, upcomingExpenses } = useRecurringExpenses()

      await fetchUpcoming(7)

      expect(upcomingExpenses.value).toEqual([mockRecurringExpense])
    })
  })

  describe('generateExpense', () => {
    it('generates expense and shows success toast', async () => {
      mockApi.generateExpenseFromRecurring.mockResolvedValueOnce({ data: mockExpense })
      const uiStore = useUiStore()

      const { generateExpense } = useRecurringExpenses()

      const result = await generateExpense(1)

      expect(result).toEqual(mockExpense)
      expect(uiStore.toasts[0].type).toBe('success')
      expect(uiStore.toasts[0].title).toBe('生成成功')
    })
  })

  describe('fetchHistory', () => {
    it('fetches history', async () => {
      mockApi.getRecurringExpenseHistory.mockResolvedValueOnce({ data: [mockExpense] })

      const { fetchHistory, history } = useRecurringExpenses()

      await fetchHistory(1, 10)

      expect(history.value).toEqual([mockExpense])
    })
  })

  describe('confirmDelete', () => {
    it('opens confirm dialog', () => {
      const uiStore = useUiStore()

      const { confirmDelete } = useRecurringExpenses()

      confirmDelete(1)

      expect(uiStore.isConfirmDialogOpen).toBe(true)
      expect(uiStore.confirmDialogProps?.variant).toBe('danger')
    })

    it('closes confirm dialog after successful delete confirm action', async () => {
      const uiStore = useUiStore()
      mockApi.deleteRecurringExpense.mockResolvedValueOnce(undefined)
      const onSuccess = vi.fn()
      const { confirmDelete } = useRecurringExpenses()

      confirmDelete(1, onSuccess)
      await uiStore.confirmDialogProps?.onConfirm()

      expect(uiStore.isConfirmDialogOpen).toBe(false)
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('keeps dialog open and resets loading after failed delete confirm action', async () => {
      const uiStore = useUiStore()
      mockApi.deleteRecurringExpense.mockRejectedValueOnce(new Error('delete failed'))
      const { confirmDelete } = useRecurringExpenses()

      confirmDelete(1)
      await uiStore.confirmDialogProps?.onConfirm()

      expect(uiStore.isConfirmDialogOpen).toBe(true)
      expect(uiStore.confirmDialogProps?.loading).toBe(false)
    })
  })

  describe('confirmGenerate', () => {
    it('opens confirm dialog with item name', () => {
      const uiStore = useUiStore()

      const { confirmGenerate } = useRecurringExpenses()

      confirmGenerate(1, 'Monthly Rent')

      expect(uiStore.isConfirmDialogOpen).toBe(true)
      expect(uiStore.confirmDialogProps?.message).toContain('Monthly Rent')
      expect(uiStore.confirmDialogProps?.variant).toBe('info')
    })

    it('closes confirm dialog after successful generate confirm action', async () => {
      const uiStore = useUiStore()
      mockApi.generateExpenseFromRecurring.mockResolvedValueOnce({ data: mockExpense })
      const onSuccess = vi.fn()
      const { confirmGenerate } = useRecurringExpenses()

      confirmGenerate(1, 'Monthly Rent', onSuccess)
      await uiStore.confirmDialogProps?.onConfirm()

      expect(uiStore.isConfirmDialogOpen).toBe(false)
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('keeps dialog open and resets loading after failed generate confirm action', async () => {
      const uiStore = useUiStore()
      mockApi.generateExpenseFromRecurring.mockRejectedValueOnce(new Error('generate failed'))
      const { confirmGenerate } = useRecurringExpenses()

      confirmGenerate(1, 'Monthly Rent')
      await uiStore.confirmDialogProps?.onConfirm()

      expect(uiStore.isConfirmDialogOpen).toBe(true)
      expect(uiStore.confirmDialogProps?.loading).toBe(false)
    })
  })

  describe('clearCurrentRecurringExpense', () => {
    it('clears current and history', () => {
      const store = useRecurringExpenseStore()
      store.currentRecurringExpense = mockRecurringExpense
      store.history = [mockExpense]

      const { clearCurrentRecurringExpense, currentRecurringExpense, history } =
        useRecurringExpenses()

      clearCurrentRecurringExpense()

      expect(currentRecurringExpense.value).toBe(null)
      expect(history.value).toEqual([])
    })
  })
})
