import type { Ref } from 'vue'
import type { Category, DateRangePreset, Intent, Expense, ExpenseListParams } from '~/types'
import { useExpenses } from '~/composables/useExpenses'
import { useUiStore } from '~/stores/ui'

interface ExpenseListFilters {
  preset: DateRangePreset
  categories: Category[]
  intents: Intent[]
  startDate?: string
  endDate?: string
}

interface UseExpenseListViewModelOptions {
  autoLoad?: boolean
  expenseDataVersion?: Ref<number>
  initialFilters?: ExpenseListFilters
}

const DEFAULT_FILTERS: ExpenseListFilters = {
  preset: 'this_month',
  categories: [],
  intents: [],
  startDate: undefined,
  endDate: undefined,
}

function normalizePerPage(value: number): number {
  if (!Number.isFinite(value)) return 15
  const normalized = Math.trunc(value)
  return Math.min(100, Math.max(1, normalized))
}

function normalizePage(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.trunc(value))
}

export function useExpenseListViewModel(options: UseExpenseListViewModelOptions = {}) {
  const uiStore = useUiStore()
  const {
    expenses,
    loading,
    currentPage,
    totalPages,
    totalItems,
    fetchExpenses,
    confirmDelete,
    selectedIds,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    batchDeleteLoading,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    confirmBatchDelete,
  } = useExpenses()

  const filters = ref<ExpenseListFilters>({ ...DEFAULT_FILTERS, ...options.initialFilters })
  const page = ref(1)
  const perPage = ref(15)
  const expenseDataVersion =
    options.expenseDataVersion ?? useState<number>('expense-data-version', () => 0)
  const isLoadingExpenses = ref(false)
  const pendingReload = ref(false)

  function buildQueryParams(): ExpenseListParams {
    const params: ExpenseListParams = {
      page: normalizePage(page.value),
      per_page: normalizePerPage(perPage.value),
    }

    if (filters.value.preset !== 'custom') {
      params.preset = filters.value.preset
    } else {
      if (filters.value.startDate) {
        params.start_date = filters.value.startDate
      }
      if (filters.value.endDate) {
        params.end_date = filters.value.endDate
      }
    }

    if (filters.value.categories.length > 0) {
      params.category = filters.value.categories
    }

    if (filters.value.intents.length > 0) {
      params.intent = filters.value.intents
    }

    return params
  }

  async function loadExpenses() {
    if (isLoadingExpenses.value) {
      pendingReload.value = true
      return
    }

    isLoadingExpenses.value = true
    try {
      await fetchExpenses(buildQueryParams())

      // If current page is out of range after refresh (e.g. last row deleted),
      // move to last available page and reload once.
      if (totalPages.value > 0 && page.value > totalPages.value) {
        page.value = totalPages.value
        await fetchExpenses(buildQueryParams())
      }
    } finally {
      isLoadingExpenses.value = false
      if (pendingReload.value) {
        pendingReload.value = false
        await loadExpenses()
      }
    }
  }

  function handleSearch() {
    if (loading.value || isLoadingExpenses.value) return
    page.value = 1
    clearSelection()
    void loadExpenses()
  }

  function handlePageChange(newPage: number) {
    if (loading.value || isLoadingExpenses.value) return
    const targetPage = normalizePage(newPage)
    const boundedPage = totalPages.value > 0 ? Math.min(targetPage, totalPages.value) : targetPage
    page.value = boundedPage
    clearSelection()
    void loadExpenses()
  }

  function handleToggleSelect(expense: Expense) {
    toggleSelection(expense.id)
  }

  function handleToggleSelectAll() {
    toggleSelectAll()
  }

  function handleBatchDelete() {
    if (batchDeleteLoading.value || isLoadingExpenses.value) return
    confirmBatchDelete(() => {
      void loadExpenses()
    })
  }

  function handleCancelSelection() {
    clearSelection()
  }

  function handleEdit(expense: Expense) {
    uiStore.openExpenseModal(expense.id)
  }

  function handleDelete(expense: Expense) {
    if (loading.value || isLoadingExpenses.value) return
    confirmDelete(expense.id, () => {
      void loadExpenses()
    })
  }

  if (options.autoLoad !== false) {
    onMounted(() => {
      void loadExpenses()
    })
  }

  watch(expenseDataVersion, () => {
    void loadExpenses()
  })

  return {
    expenses,
    loading,
    currentPage,
    totalPages,
    totalItems,
    selectedIds,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    batchDeleteLoading,
    filters,
    page,
    perPage,
    loadExpenses,
    buildQueryParams,
    handleSearch,
    handlePageChange,
    handleToggleSelect,
    handleToggleSelectAll,
    handleBatchDelete,
    handleCancelSelection,
    handleEdit,
    handleDelete,
  }
}
