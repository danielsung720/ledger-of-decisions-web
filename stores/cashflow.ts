import { defineStore } from 'pinia'
import type { PaginationMeta } from '~/types'
import type {
  Income,
  CashFlowItem,
  CashFlowSummary,
  CashFlowProjection,
  IncomeListParams,
  CashFlowItemListParams,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  CreateCashFlowItemRequest,
  UpdateCashFlowItemRequest,
} from '~/types/cashflow'
import { CASH_FLOW_PROJECTION_DEFAULT_MONTHS, normalizeProjectionMonths } from '~/types/cashflow'
import { useApiClient } from '~/utils/api'

interface CashFlowState {
  incomes: Income[]
  currentIncome: Income | null
  cashFlowItems: CashFlowItem[]
  currentCashFlowItem: CashFlowItem | null
  summary: CashFlowSummary | null
  projections: CashFlowProjection[]
  selectedMonths: number
  latestProjectionRequestId: number
  loadingCount: number
  loading: boolean
  error: string | null
  incomePagination: PaginationMeta | null
  itemPagination: PaginationMeta | null
}

export const useCashFlowStore = defineStore('cashflow', {
  state: (): CashFlowState => ({
    incomes: [],
    currentIncome: null,
    cashFlowItems: [],
    currentCashFlowItem: null,
    summary: null,
    projections: [],
    selectedMonths: CASH_FLOW_PROJECTION_DEFAULT_MONTHS,
    latestProjectionRequestId: 0,
    loadingCount: 0,
    loading: false,
    error: null,
    incomePagination: null,
    itemPagination: null,
  }),

  getters: {
    hasIncomes: (state) => state.incomes.length > 0,
    hasCashFlowItems: (state) => state.cashFlowItems.length > 0,
    activeIncomes: (state) => state.incomes.filter((i) => i.is_active),
    activeCashFlowItems: (state) => state.cashFlowItems.filter((i) => i.is_active),
    totalMonthlyIncome: (state) => {
      return state.incomes
        .filter((i) => i.is_active)
        .reduce((sum, i) => sum + parseFloat(i.monthly_amount), 0)
    },
    totalMonthlyExpense: (state) => {
      return state.cashFlowItems
        .filter((i) => i.is_active)
        .reduce((sum, i) => sum + parseFloat(i.monthly_amount), 0)
    },
  },

  actions: {
    beginLoading() {
      this.loadingCount += 1
      this.loading = true
    },

    endLoading() {
      this.loadingCount = Math.max(0, this.loadingCount - 1)
      this.loading = this.loadingCount > 0
    },

    // ============================================================
    // Income Actions
    // ============================================================

    async fetchIncomes(params?: IncomeListParams) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getIncomes(params)

        this.incomes = response.data
        this.incomePagination = response.meta
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch incomes'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async fetchIncomeById(id: number) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getIncome(id)

        this.currentIncome = response.data
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch income'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async createIncome(data: CreateIncomeRequest) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.createIncome(data)

        this.incomes = [response.data, ...this.incomes]
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create income'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async updateIncome(id: number, data: UpdateIncomeRequest) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.updateIncome(id, data)

        const index = this.incomes.findIndex((i) => i.id === id)
        if (index !== -1) {
          this.incomes = [
            ...this.incomes.slice(0, index),
            response.data,
            ...this.incomes.slice(index + 1),
          ]
        }

        if (this.currentIncome?.id === id) {
          this.currentIncome = response.data
        }

        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update income'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async deleteIncome(id: number) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        await api.deleteIncome(id)

        this.incomes = this.incomes.filter((i) => i.id !== id)

        if (this.currentIncome?.id === id) {
          this.currentIncome = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete income'
        throw err
      } finally {
        this.endLoading()
      }
    },

    // ============================================================
    // Cash Flow Item Actions
    // ============================================================

    async fetchCashFlowItems(params?: CashFlowItemListParams) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getCashFlowItems(params)

        this.cashFlowItems = response.data
        this.itemPagination = response.meta
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch cash flow items'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async fetchCashFlowItemById(id: number) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getCashFlowItem(id)

        this.currentCashFlowItem = response.data
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch cash flow item'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async createCashFlowItem(data: CreateCashFlowItemRequest) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.createCashFlowItem(data)

        this.cashFlowItems = [response.data, ...this.cashFlowItems]
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create cash flow item'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async updateCashFlowItem(id: number, data: UpdateCashFlowItemRequest) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.updateCashFlowItem(id, data)

        const index = this.cashFlowItems.findIndex((i) => i.id === id)
        if (index !== -1) {
          this.cashFlowItems = [
            ...this.cashFlowItems.slice(0, index),
            response.data,
            ...this.cashFlowItems.slice(index + 1),
          ]
        }

        if (this.currentCashFlowItem?.id === id) {
          this.currentCashFlowItem = response.data
        }

        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update cash flow item'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async deleteCashFlowItem(id: number) {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        await api.deleteCashFlowItem(id)

        this.cashFlowItems = this.cashFlowItems.filter((i) => i.id !== id)

        if (this.currentCashFlowItem?.id === id) {
          this.currentCashFlowItem = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete cash flow item'
        throw err
      } finally {
        this.endLoading()
      }
    },

    // ============================================================
    // Summary and Projection Actions
    // ============================================================

    async fetchSummary() {
      this.beginLoading()
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.getCashFlowSummary()

        this.summary = response.data
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch summary'
        throw err
      } finally {
        this.endLoading()
      }
    },

    async fetchProjection(months?: number) {
      this.beginLoading()
      this.error = null
      const requestId = this.latestProjectionRequestId + 1
      this.latestProjectionRequestId = requestId

      try {
        const api = useApiClient()
        const normalizedMonths =
          months === undefined ? undefined : normalizeProjectionMonths(months)
        const response = await api.getCashFlowProjection(normalizedMonths)

        if (requestId === this.latestProjectionRequestId) {
          this.projections = response.data
          if (normalizedMonths !== undefined) {
            this.selectedMonths = normalizedMonths
          }
        }
        return response.data
      } catch (err) {
        if (requestId === this.latestProjectionRequestId) {
          this.error = err instanceof Error ? err.message : 'Failed to fetch projection'
        }
        throw err
      } finally {
        this.endLoading()
      }
    },

    setSelectedMonths(months: number) {
      this.selectedMonths = normalizeProjectionMonths(months)
    },

    clearCurrentIncome() {
      this.currentIncome = null
    },

    clearCurrentCashFlowItem() {
      this.currentCashFlowItem = null
    },
  },
})
