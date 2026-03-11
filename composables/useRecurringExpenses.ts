import type {
  RecurringExpenseListParams,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
  GenerateExpenseRequest,
} from '~/types/recurring-expense'
import { useRecurringExpenseStore } from '~/stores/recurring-expense'
import { useUiStore } from '~/stores/ui'

export function useRecurringExpenses() {
  const store = useRecurringExpenseStore()
  const uiStore = useUiStore()

  const recurringExpenses = computed(() => store.recurringExpenses)
  const currentRecurringExpense = computed(() => store.currentRecurringExpense)
  const upcomingExpenses = computed(() => store.upcomingExpenses)
  const history = computed(() => store.history)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)
  const pagination = computed(() => store.pagination)
  const currentPage = computed(() => store.currentPage)
  const totalPages = computed(() => store.totalPages)
  const totalItems = computed(() => store.totalItems)
  const hasRecurringExpenses = computed(() => store.hasRecurringExpenses)
  const activeRecurringExpenses = computed(() => store.activeRecurringExpenses)
  const inactiveRecurringExpenses = computed(() => store.inactiveRecurringExpenses)

  async function fetchRecurringExpenses(params?: RecurringExpenseListParams) {
    try {
      await store.fetchRecurringExpenses(params)
    } catch {
      uiStore.error('載入失敗', '無法載入固定支出，請稍後再試')
    }
  }

  async function fetchRecurringExpenseById(id: number) {
    try {
      return await store.fetchRecurringExpenseById(id)
    } catch {
      uiStore.error('載入失敗', '無法載入固定支出詳情，請稍後再試')
      throw new Error('Failed to fetch recurring expense')
    }
  }

  async function createRecurringExpense(data: CreateRecurringExpenseRequest) {
    try {
      const recurringExpense = await store.createRecurringExpense(data)
      uiStore.success('新增成功', '固定支出已建立')
      return recurringExpense
    } catch (err) {
      uiStore.error('新增失敗', '無法建立固定支出，請稍後再試')
      throw err
    }
  }

  async function updateRecurringExpense(id: number, data: UpdateRecurringExpenseRequest) {
    try {
      const recurringExpense = await store.updateRecurringExpense(id, data)
      uiStore.success('更新成功', '固定支出已更新')
      return recurringExpense
    } catch (err) {
      uiStore.error('更新失敗', '無法更新固定支出，請稍後再試')
      throw err
    }
  }

  async function deleteRecurringExpense(id: number) {
    try {
      await store.deleteRecurringExpense(id)
      uiStore.success('刪除成功', '固定支出已刪除')
    } catch (err) {
      uiStore.error('刪除失敗', '無法刪除固定支出，請稍後再試')
      throw err
    }
  }

  async function toggleActive(id: number, isActive: boolean) {
    try {
      await store.updateRecurringExpense(id, { is_active: isActive })
      uiStore.success(
        isActive ? '已啟用' : '已停用',
        isActive ? '固定支出已重新啟用' : '固定支出已暫停'
      )
    } catch (err) {
      uiStore.error('操作失敗', '無法更新狀態，請稍後再試')
      throw err
    }
  }

  async function fetchUpcoming(days?: number) {
    try {
      return await store.fetchUpcoming(days)
    } catch {
      uiStore.error('載入失敗', '無法載入即將到期項目，請稍後再試')
      throw new Error('Failed to fetch upcoming')
    }
  }

  async function generateExpense(id: number, data?: GenerateExpenseRequest) {
    try {
      const expense = await store.generateExpense(id, data)
      uiStore.success('生成成功', '已手動生成消費記錄')
      return expense
    } catch (err) {
      uiStore.error('生成失敗', '無法生成消費記錄，請稍後再試')
      throw err
    }
  }

  async function fetchHistory(id: number, limit?: number) {
    try {
      return await store.fetchHistory(id, limit)
    } catch {
      uiStore.error('載入失敗', '無法載入歷史記錄，請稍後再試')
      throw new Error('Failed to fetch history')
    }
  }

  function confirmDelete(id: number, onSuccess?: () => void) {
    uiStore.openConfirmDialog({
      title: '確認刪除',
      message: '確定要刪除這筆固定支出嗎？此操作無法復原，但已產生的消費記錄不會被刪除。',
      variant: 'danger',
      onConfirm: async () => {
        uiStore.setConfirmDialogLoading(true)
        try {
          await deleteRecurringExpense(id)
          uiStore.closeConfirmDialog()
          onSuccess?.()
        } catch {
          uiStore.setConfirmDialogLoading(false)
        }
      },
    })
  }

  function confirmGenerate(id: number, name: string, onSuccess?: () => void) {
    uiStore.openConfirmDialog({
      title: '手動生成消費記錄',
      message: `確定要為「${name}」手動生成一筆消費記錄嗎？`,
      variant: 'info',
      onConfirm: async () => {
        uiStore.setConfirmDialogLoading(true)
        try {
          await generateExpense(id)
          uiStore.closeConfirmDialog()
          onSuccess?.()
        } catch {
          uiStore.setConfirmDialogLoading(false)
        }
      },
    })
  }

  function clearCurrentRecurringExpense() {
    store.clearCurrentRecurringExpense()
  }

  return {
    // State
    recurringExpenses,
    currentRecurringExpense,
    upcomingExpenses,
    history,
    loading,
    error,
    pagination,
    currentPage,
    totalPages,
    totalItems,
    hasRecurringExpenses,
    activeRecurringExpenses,
    inactiveRecurringExpenses,

    // Actions
    fetchRecurringExpenses,
    fetchRecurringExpenseById,
    createRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    toggleActive,
    fetchUpcoming,
    generateExpense,
    fetchHistory,
    confirmDelete,
    confirmGenerate,
    clearCurrentRecurringExpense,
  }
}
