import { defineStore } from 'pinia'
import type { Expense, PaginationMeta } from '~/types'
import type {
  RecurringExpense,
  RecurringExpenseFilters,
  RecurringExpenseListParams,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
  GenerateExpenseRequest,
} from '~/types/recurring-expense'
import { useApiClient } from '~/utils/api'

interface RecurringExpenseState {
  recurringExpenses: RecurringExpense[]
  currentRecurringExpense: RecurringExpense | null
  upcomingExpenses: RecurringExpense[]
  history: Expense[]
  loading: boolean
  error: string | null
  filters: RecurringExpenseFilters
  pagination: PaginationMeta | null
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

function isValidRecurringExpenseRecord(value: unknown): value is RecurringExpense {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<RecurringExpense>
  return (
    Number.isInteger(candidate.id) &&
    typeof candidate.name === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.frequency_type === 'string'
  )
}

function isValidExpenseRecord(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Expense>
  return (
    Number.isInteger(candidate.id) &&
    typeof candidate.category === 'string' &&
    typeof candidate.amount === 'string' &&
    typeof candidate.occurred_at === 'string'
  )
}

export const useRecurringExpenseStore = defineStore('recurring-expense', {
  state: (): RecurringExpenseState => ({
    recurringExpenses: [],
    currentRecurringExpense: null,
    upcomingExpenses: [],
    history: [],
    loading: false,
    error: null,
    filters: {},
    pagination: null,
  }),

  getters: {
    hasRecurringExpenses: (state) => state.recurringExpenses.length > 0,
    activeRecurringExpenses: (state) => state.recurringExpenses.filter((re) => re.is_active),
    inactiveRecurringExpenses: (state) => state.recurringExpenses.filter((re) => !re.is_active),
    totalPages: (state) => state.pagination?.last_page ?? 1,
    currentPage: (state) => state.pagination?.current_page ?? 1,
    totalItems: (state) => state.pagination?.total ?? 0,
  },

  actions: {
    async fetchRecurringExpenses(params?: RecurringExpenseListParams) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getRecurringExpenses(params)
        if (
          !Array.isArray(response?.data) ||
          !response.data.every((item) => isValidRecurringExpenseRecord(item)) ||
          !isValidPaginationMeta(response?.meta)
        ) {
          throw new Error('Invalid recurring expense list response')
        }

        this.recurringExpenses = response.data
        this.pagination = response.meta
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch recurring expenses'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchRecurringExpenseById(id: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getRecurringExpense(id)
        if (!isValidRecurringExpenseRecord(response?.data)) {
          throw new Error('Invalid recurring expense detail response')
        }

        this.currentRecurringExpense = response.data
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch recurring expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createRecurringExpense(data: CreateRecurringExpenseRequest) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.createRecurringExpense(data)
        if (!isValidRecurringExpenseRecord(response?.data)) {
          throw new Error('Invalid create recurring expense response')
        }

        this.recurringExpenses.unshift(response.data)

        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create recurring expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateRecurringExpense(id: number, data: UpdateRecurringExpenseRequest) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.updateRecurringExpense(id, data)
        if (!isValidRecurringExpenseRecord(response?.data)) {
          throw new Error('Invalid update recurring expense response')
        }

        const index = this.recurringExpenses.findIndex((re) => re.id === id)
        if (index !== -1) {
          this.recurringExpenses = [
            ...this.recurringExpenses.slice(0, index),
            response.data,
            ...this.recurringExpenses.slice(index + 1),
          ]
        }

        if (this.currentRecurringExpense?.id === id) {
          this.currentRecurringExpense = response.data
        }

        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update recurring expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteRecurringExpense(id: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        await api.deleteRecurringExpense(id)

        this.recurringExpenses = this.recurringExpenses.filter((re) => re.id !== id)

        if (this.currentRecurringExpense?.id === id) {
          this.currentRecurringExpense = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete recurring expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUpcoming(days?: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getUpcomingRecurringExpenses(days)
        if (
          !Array.isArray(response?.data) ||
          !response.data.every((item) => isValidRecurringExpenseRecord(item))
        ) {
          throw new Error('Invalid recurring expense upcoming response')
        }

        this.upcomingExpenses = response.data
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch upcoming expenses'
        throw err
      } finally {
        this.loading = false
      }
    },

    async generateExpense(id: number, data?: GenerateExpenseRequest) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.generateExpenseFromRecurring(id, data)
        if (!isValidExpenseRecord(response?.data)) {
          throw new Error('Invalid generate recurring expense response')
        }

        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to generate expense'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchHistory(id: number, limit?: number) {
      this.loading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getRecurringExpenseHistory(id, limit)
        if (
          !Array.isArray(response?.data) ||
          !response.data.every((item) => isValidExpenseRecord(item))
        ) {
          throw new Error('Invalid recurring expense history response')
        }

        this.history = response.data
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch history'
        throw err
      } finally {
        this.loading = false
      }
    },

    setFilters(filters: Partial<RecurringExpenseFilters>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {}
    },

    clearCurrentRecurringExpense() {
      this.currentRecurringExpense = null
      this.history = []
    },
  },
})
