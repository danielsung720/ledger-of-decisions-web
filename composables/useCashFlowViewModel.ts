import type { Ref } from 'vue'
import type { Income, CashFlowItem } from '~/types/cashflow'
import { normalizeProjectionMonths } from '~/types/cashflow'
import { useCashFlow } from '~/composables/useCashFlow'

interface UseCashFlowViewModelOptions {
  autoLoad?: boolean
  selectedMonths?: Ref<number>
}

/**
 * Cashflow list fetch page size guardrail.
 * Uses 100 to avoid unbounded list loads while keeping single-page UX simple.
 */
const LIST_PAGE_SIZE = 100

export function useCashFlowViewModel(options: UseCashFlowViewModelOptions = {}) {
  const {
    incomes,
    cashFlowItems,
    summary,
    projections,
    selectedMonths,
    loading,
    fetchIncomes,
    fetchCashFlowItems,
    fetchSummary,
    fetchProjection,
    confirmDeleteIncome,
    confirmDeleteCashFlowItem,
    setSelectedMonths,
  } = useCashFlow()

  const localSelectedMonths = computed<number>({
    get() {
      return options.selectedMonths?.value ?? selectedMonths.value
    },
    set(months: number) {
      const normalizedMonths = normalizeProjectionMonths(months)
      if (options.selectedMonths) {
        options.selectedMonths.value = normalizedMonths
      }
      setSelectedMonths(normalizedMonths)
    },
  })

  async function loadData() {
    const normalizedMonths = normalizeProjectionMonths(localSelectedMonths.value)
    localSelectedMonths.value = normalizedMonths
    await Promise.all([
      fetchIncomes({ per_page: LIST_PAGE_SIZE }),
      fetchCashFlowItems({ per_page: LIST_PAGE_SIZE }),
      fetchSummary(),
      fetchProjection(normalizedMonths),
    ])
  }

  async function handleMonthChange(months: number) {
    localSelectedMonths.value = months
    await fetchProjection(localSelectedMonths.value)
  }

  function reloadDataWithErrorHandling(context: string) {
    loadData().catch((error) => {
      console.error(`[CashFlowViewModel] ${context}: reload data failed`, error)
    })
  }

  function createModalState() {
    const isOpen = ref(false)
    const editingId = ref<number | null>(null)

    function openCreate() {
      editingId.value = null
      isOpen.value = true
    }

    function openEdit(id: number) {
      editingId.value = id
      isOpen.value = true
    }

    function close() {
      isOpen.value = false
      editingId.value = null
    }

    return {
      isOpen,
      editingId,
      openCreate,
      openEdit,
      close,
    }
  }

  const incomeModal = createModalState()
  const expenseModal = createModalState()

  function handleAddIncome() {
    incomeModal.openCreate()
  }

  function handleEditIncome(income: Income) {
    incomeModal.openEdit(income.id)
  }

  function handleDeleteIncome(income: Income) {
    confirmDeleteIncome(income.id, () => {
      reloadDataWithErrorHandling('after deleting income')
    })
  }

  function handleIncomeModalClose() {
    incomeModal.close()
  }

  function handleIncomeModalSaved() {
    reloadDataWithErrorHandling('after saving income modal')
  }

  function handleAddExpense() {
    expenseModal.openCreate()
  }

  function handleEditExpense(item: CashFlowItem) {
    expenseModal.openEdit(item.id)
  }

  function handleDeleteExpense(item: CashFlowItem) {
    confirmDeleteCashFlowItem(item.id, () => {
      reloadDataWithErrorHandling('after deleting expense')
    })
  }

  function handleExpenseModalClose() {
    expenseModal.close()
  }

  function handleExpenseModalSaved() {
    reloadDataWithErrorHandling('after saving expense modal')
  }

  if (options.autoLoad !== false) {
    onMounted(() => {
      reloadDataWithErrorHandling('on mounted')
    })
  }

  return {
    incomes,
    cashFlowItems,
    summary,
    projections,
    selectedMonths,
    loading,
    localSelectedMonths,
    showIncomeModal: incomeModal.isOpen,
    editingIncomeId: incomeModal.editingId,
    showExpenseModal: expenseModal.isOpen,
    editingExpenseId: expenseModal.editingId,
    loadData,
    handleMonthChange,
    handleAddIncome,
    handleEditIncome,
    handleDeleteIncome,
    handleIncomeModalClose,
    handleIncomeModalSaved,
    handleAddExpense,
    handleEditExpense,
    handleDeleteExpense,
    handleExpenseModalClose,
    handleExpenseModalSaved,
  }
}
