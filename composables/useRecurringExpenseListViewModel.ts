import type { Category } from '~/types'
import type {
  FrequencyType,
  RecurringExpense,
  RecurringExpenseListParams,
} from '~/types/recurring-expense'
import { useRecurringExpenses } from '~/composables/useRecurringExpenses'

interface RecurringFilters {
  categories: Category[]
  frequencyTypes: FrequencyType[]
  isActive: boolean | null
}

type ActiveFilterTab = 'all' | 'active' | 'inactive'

interface UseRecurringExpenseListViewModelOptions {
  autoLoad?: boolean
}

const DEFAULT_FILTERS: RecurringFilters = {
  categories: [],
  frequencyTypes: [],
  isActive: null,
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

export function useRecurringExpenseListViewModel(
  options: UseRecurringExpenseListViewModelOptions = {}
) {
  const {
    recurringExpenses,
    loading,
    currentPage,
    totalPages,
    totalItems,
    fetchRecurringExpenses,
    toggleActive,
    confirmDelete,
    confirmGenerate,
  } = useRecurringExpenses()

  const filters = ref<RecurringFilters>({ ...DEFAULT_FILTERS })
  const activeFilter = ref<ActiveFilterTab>('all')
  const page = ref(1)
  const perPage = ref(15)
  const showFormModal = ref(false)
  const editingRecurringExpenseId = ref<number | null>(null)
  const isLoadingList = ref(false)

  function buildQueryParams(): RecurringExpenseListParams {
    const params: RecurringExpenseListParams = {
      page: normalizePage(page.value),
      per_page: normalizePerPage(perPage.value),
    }

    if (filters.value.categories.length > 0) {
      params.category = filters.value.categories
    }

    if (filters.value.frequencyTypes.length > 0) {
      params.frequency_type = filters.value.frequencyTypes
    }

    if (filters.value.isActive !== null) {
      params.is_active = filters.value.isActive
    }

    return params
  }

  async function loadRecurringExpenses() {
    if (isLoadingList.value) return

    isLoadingList.value = true
    try {
      await fetchRecurringExpenses(buildQueryParams())

      if (totalPages.value > 0 && page.value > totalPages.value) {
        page.value = totalPages.value
        await fetchRecurringExpenses(buildQueryParams())
      }
    } finally {
      isLoadingList.value = false
    }
  }

  function handlePageChange(newPage: number) {
    if (loading.value || isLoadingList.value) return
    const targetPage = normalizePage(newPage)
    const boundedPage = totalPages.value > 0 ? Math.min(targetPage, totalPages.value) : targetPage
    page.value = boundedPage
    void loadRecurringExpenses()
  }

  function handleAdd() {
    editingRecurringExpenseId.value = null
    showFormModal.value = true
  }

  function handleEdit(recurringExpense: RecurringExpense) {
    editingRecurringExpenseId.value = recurringExpense.id
    showFormModal.value = true
  }

  function handleDelete(recurringExpense: RecurringExpense) {
    if (loading.value || isLoadingList.value) return
    confirmDelete(recurringExpense.id, () => {
      void loadRecurringExpenses()
    })
  }

  async function handleToggleActive(recurringExpense: RecurringExpense) {
    await toggleActive(recurringExpense.id, !recurringExpense.is_active)
    await loadRecurringExpenses()
  }

  function handleGenerate(recurringExpense: RecurringExpense) {
    confirmGenerate(recurringExpense.id, recurringExpense.name, () => {
      void loadRecurringExpenses()
    })
  }

  function handleViewHistory(_recurringExpense: RecurringExpense) {
    // TODO: Implement history modal
  }

  function handleModalClose() {
    showFormModal.value = false
    editingRecurringExpenseId.value = null
  }

  function handleModalSaved() {
    void loadRecurringExpenses()
  }

  function setActiveFilter(filter: ActiveFilterTab) {
    if (loading.value || isLoadingList.value) return
    activeFilter.value = filter
    filters.value.isActive = filter === 'all' ? null : filter === 'active'
    page.value = 1
    void loadRecurringExpenses()
  }

  if (options.autoLoad !== false) {
    onMounted(() => {
      void loadRecurringExpenses()
    })
  }

  return {
    recurringExpenses,
    loading,
    currentPage,
    totalPages,
    totalItems,
    filters,
    activeFilter,
    page,
    perPage,
    showFormModal,
    editingRecurringExpenseId,
    buildQueryParams,
    loadRecurringExpenses,
    handlePageChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleActive,
    handleGenerate,
    handleViewHistory,
    handleModalClose,
    handleModalSaved,
    setActiveFilter,
  }
}
