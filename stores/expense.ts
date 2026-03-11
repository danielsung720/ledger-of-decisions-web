import { defineStore } from 'pinia'
import type {
  Expense,
  Decision,
  CreateDecisionRequest,
  ExpenseFilters,
  ExpenseListParams,
  CreateEntryRequest,
  UpdateEntryRequest,
  PaginationMeta,
} from '~/types'
import { useApiClient } from '~/utils/api'

interface ExpenseState {
  expenses: Expense[]
  currentExpense: Expense | null
  loading: boolean
  error: string | null
  filters: ExpenseFilters
  pagination: PaginationMeta | null
  selectedIds: Set<number>
  batchDeleteLoading: boolean
}

function isValidExpenseRecord(expense: unknown): expense is Expense {
  if (!expense || typeof expense !== 'object') return false
  const candidate = expense as Partial<Expense>
  return (
    Number.isInteger(candidate.id) &&
    typeof candidate.category === 'string' &&
    typeof candidate.amount === 'string' &&
    typeof candidate.occurred_at === 'string'
  )
}

function isValidPaginationMeta(meta: unknown): meta is PaginationMeta {
  if (!meta || typeof meta !== 'object') return false
  const candidate = meta as Partial<PaginationMeta>
  return (
    Number.isInteger(candidate.current_page) &&
    Number.isInteger(candidate.last_page) &&
    Number.isInteger(candidate.per_page) &&
    Number.isInteger(candidate.total)
  )
}

function isValidDecisionRecord(decision: unknown): decision is Decision {
  if (!decision || typeof decision !== 'object') return false
  const candidate = decision as Partial<Decision>
  return (
    Number.isInteger(candidate.id) &&
    Number.isInteger(candidate.expense_id) &&
    typeof candidate.intent === 'string'
  )
}

export const useExpenseStore = defineStore('expense', {
  state: (): ExpenseState => ({
    expenses: [],
    currentExpense: null,
    loading: false,
    error: null,
    filters: {
      preset: 'this_month',
    },
    pagination: null,
    selectedIds: new Set<number>(),
    batchDeleteLoading: false,
  }),

  getters: {
    hasExpenses: (state) => state.expenses.length > 0,
    totalPages: (state) => state.pagination?.last_page ?? 1,
    currentPage: (state) => state.pagination?.current_page ?? 1,
    totalItems: (state) => state.pagination?.total ?? 0,
    selectedCount: (state) => state.selectedIds.size,
    isAllSelected: (state) =>
      state.expenses.length > 0 && state.selectedIds.size === state.expenses.length,
    isIndeterminate: (state) =>
      state.selectedIds.size > 0 && state.selectedIds.size < state.expenses.length,
  },

  actions: {
    applyDecisionToExpense(expenseId: number, decision: Decision | null) {
      const index = this.expenses.findIndex((e) => e.id === expenseId)
      if (index !== -1) {
        this.expenses = [
          ...this.expenses.slice(0, index),
          { ...this.expenses[index], decision },
          ...this.expenses.slice(index + 1),
        ]
      }

      if (this.currentExpense?.id === expenseId) {
        this.currentExpense = {
          ...this.currentExpense,
          decision,
        }
      }
    },

    async fetchExpenses(params?: ExpenseListParams) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getExpenses(params)

        if (!Array.isArray(response?.data) || !isValidPaginationMeta(response?.meta)) {
          throw new Error('Invalid expense list response')
        }

        this.expenses = response.data
        this.pagination = response.meta
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch expenses'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchExpenseById(id: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getExpense(id)
        if (!isValidExpenseRecord(response?.data)) {
          throw new Error('Invalid expense detail response')
        }

        this.currentExpense = response.data
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createExpense(data: CreateEntryRequest) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.createEntry(data)
        if (!isValidExpenseRecord(response?.data)) {
          throw new Error('Invalid create entry response')
        }

        // Add to the beginning of the list
        this.expenses.unshift(response.data)

        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateExpense(id: number, data: UpdateEntryRequest) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.updateExpense(id, data)
        if (!isValidExpenseRecord(response?.data)) {
          throw new Error('Invalid update expense response')
        }

        // Update in the list
        const index = this.expenses.findIndex((e) => e.id === id)
        if (index !== -1) {
          this.expenses[index] = response.data
        }

        if (this.currentExpense?.id === id) {
          this.currentExpense = response.data
        }

        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async upsertDecision(expenseId: number, data: CreateDecisionRequest) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()

        let response: { data: Decision }
        try {
          response = await api.updateExpenseDecision(expenseId, data)
        } catch (err) {
          const statusCode =
            err && typeof err === 'object'
              ? ((err as { statusCode?: number; status?: number; response?: { status?: number } })
                  .statusCode ??
                (err as { statusCode?: number; status?: number; response?: { status?: number } })
                  .status ??
                (err as { statusCode?: number; status?: number; response?: { status?: number } })
                  .response?.status)
              : undefined

          if (statusCode === 404) {
            response = await api.createExpenseDecision(expenseId, data)
          } else {
            throw err
          }
        }

        if (!isValidDecisionRecord(response?.data)) {
          throw new Error('Invalid upsert decision response')
        }

        this.applyDecisionToExpense(expenseId, response.data)
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to upsert decision'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteDecision(expenseId: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        await api.deleteExpenseDecision(expenseId)
        this.applyDecisionToExpense(expenseId, null)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete decision'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteExpense(id: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        await api.deleteExpense(id)

        // Remove from list
        this.expenses = this.expenses.filter((e) => e.id !== id)

        if (this.currentExpense?.id === id) {
          this.currentExpense = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    setFilters(filters: Partial<ExpenseFilters>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = { preset: 'this_month' }
    },

    clearCurrentExpense() {
      this.currentExpense = null
    },

    toggleSelection(id: number) {
      const newSet = new Set(this.selectedIds)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      this.selectedIds = newSet
    },

    toggleSelectAll() {
      if (this.selectedIds.size === this.expenses.length) {
        this.selectedIds = new Set<number>()
      } else {
        this.selectedIds = new Set(this.expenses.map((e) => e.id))
      }
    },

    clearSelection() {
      this.selectedIds = new Set<number>()
    },

    async batchDeleteExpenses(ids: number[]) {
      this.batchDeleteLoading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.batchDeleteExpenses(ids)

        // Remove deleted items from list
        this.expenses = this.expenses.filter((e) => !ids.includes(e.id))

        // Clear selection
        this.clearSelection()

        return response
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete expenses'
        throw err
      } finally {
        this.batchDeleteLoading = false
      }
    },
  },
})
