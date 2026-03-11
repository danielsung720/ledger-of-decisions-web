import type { ExpenseListParams, CreateEntryRequest, UpdateEntryRequest } from '~/types'
import { useExpenseStore } from '~/stores/expense'
import { useUiStore } from '~/stores/ui'

export function useExpenses() {
  const expenseStore = useExpenseStore()
  const uiStore = useUiStore()

  const expenses = computed(() => expenseStore.expenses)
  const loading = computed(() => expenseStore.loading)
  const error = computed(() => expenseStore.error)
  const pagination = computed(() => expenseStore.pagination)
  const currentPage = computed(() => expenseStore.currentPage)
  const totalPages = computed(() => expenseStore.totalPages)
  const totalItems = computed(() => expenseStore.totalItems)
  const hasExpenses = computed(() => expenseStore.hasExpenses)

  // Selection state
  const selectedIds = computed(() => expenseStore.selectedIds)
  const selectedCount = computed(() => expenseStore.selectedCount)
  const isAllSelected = computed(() => expenseStore.isAllSelected)
  const isIndeterminate = computed(() => expenseStore.isIndeterminate)
  const batchDeleteLoading = computed(() => expenseStore.batchDeleteLoading)

  function normalizeOptionalText(value: string | null | undefined): string | null {
    if (value == null) return null
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  function buildChangedExpensePayload(id: number, data: UpdateEntryRequest): UpdateEntryRequest {
    const currentExpense =
      expenseStore.expenses.find((item) => item.id === id) ??
      (expenseStore.currentExpense?.id === id ? expenseStore.currentExpense : null)

    const payload: UpdateEntryRequest = {}

    if (data.amount !== undefined) {
      const currentAmount = currentExpense ? Number(currentExpense.amount) : undefined
      if (currentAmount === undefined || currentAmount !== data.amount) {
        payload.amount = data.amount
      }
    }

    if (data.currency !== undefined) {
      const currentCurrency = currentExpense?.currency
      if (currentCurrency === undefined || currentCurrency !== data.currency) {
        payload.currency = data.currency
      }
    }

    if (data.category !== undefined) {
      const currentCategory = currentExpense?.category
      if (currentCategory === undefined || currentCategory !== data.category) {
        payload.category = data.category
      }
    }

    if (data.occurred_at !== undefined) {
      const currentOccurredAt = currentExpense?.occurred_at
      if (currentOccurredAt === undefined || currentOccurredAt !== data.occurred_at) {
        payload.occurred_at = data.occurred_at
      }
    }

    if (data.note !== undefined) {
      const currentNote = normalizeOptionalText(currentExpense?.note)
      const nextNote = normalizeOptionalText(data.note)
      if (currentExpense === null || currentNote !== nextNote) {
        payload.note = data.note
      }
    }

    return payload
  }

  async function fetchExpenses(params?: ExpenseListParams) {
    try {
      await expenseStore.fetchExpenses(params)
    } catch {
      uiStore.error('載入失敗', '無法載入消費記錄，請稍後再試')
    }
  }

  async function createExpense(data: CreateEntryRequest) {
    try {
      const expense = await expenseStore.createExpense(data)
      uiStore.success('新增成功', '消費記錄已儲存')
      return expense
    } catch (err) {
      uiStore.error('新增失敗', '無法儲存消費記錄，請稍後再試')
      throw err
    }
  }

  async function updateExpense(id: number, data: UpdateEntryRequest) {
    try {
      const expensePayload = buildChangedExpensePayload(id, data)

      const hasExpensePayload = Object.keys(expensePayload).length > 0
      const expense = hasExpensePayload
        ? await expenseStore.updateExpense(id, expensePayload)
        : (expenseStore.expenses.find((item) => item.id === id) ??
          (expenseStore.currentExpense?.id === id ? expenseStore.currentExpense : null))

      if (data.intent !== undefined) {
        await expenseStore.upsertDecision(id, {
          intent: data.intent,
          ...(data.confidence_level !== undefined
            ? { confidence_level: data.confidence_level }
            : {}),
          ...(data.decision_note !== undefined ? { decision_note: data.decision_note } : {}),
        })
      }

      uiStore.success('更新成功', '消費記錄已更新')
      return expense
    } catch (err) {
      uiStore.error('更新失敗', '無法更新消費記錄，請稍後再試')
      throw err
    }
  }

  async function deleteExpense(id: number) {
    try {
      await expenseStore.deleteExpense(id)
      uiStore.success('刪除成功', '消費記錄已刪除')
    } catch (err) {
      uiStore.error('刪除失敗', '無法刪除消費記錄，請稍後再試')
      throw err
    }
  }

  function confirmDelete(id: number, onSuccess?: () => void) {
    uiStore.openConfirmDialog({
      title: '確認刪除',
      message: '確定要刪除這筆消費記錄嗎？此操作無法復原。',
      variant: 'danger',
      onConfirm: async () => {
        uiStore.setConfirmDialogLoading(true)
        try {
          await deleteExpense(id)
          uiStore.closeConfirmDialog()
          onSuccess?.()
        } catch {
          uiStore.setConfirmDialogLoading(false)
        }
      },
    })
  }

  // Selection actions
  function toggleSelection(id: number) {
    expenseStore.toggleSelection(id)
  }

  function toggleSelectAll() {
    expenseStore.toggleSelectAll()
  }

  function clearSelection() {
    expenseStore.clearSelection()
  }

  async function batchDeleteExpenses(ids: number[]) {
    try {
      const response = await expenseStore.batchDeleteExpenses(ids)
      uiStore.success('批次刪除成功', `已刪除 ${response.data.deleted_count} 筆記錄`)
      return response
    } catch (err) {
      uiStore.error('批次刪除失敗', '無法刪除消費記錄，請稍後再試')
      throw err
    }
  }

  function confirmBatchDelete(onSuccess?: () => void) {
    const count = expenseStore.selectedCount
    const ids = Array.from(expenseStore.selectedIds)

    uiStore.openConfirmDialog({
      title: '確認批次刪除',
      message: `確定要刪除選取的 ${count} 筆消費記錄嗎？此操作無法復原。`,
      variant: 'danger',
      onConfirm: async () => {
        uiStore.setConfirmDialogLoading(true)
        try {
          await batchDeleteExpenses(ids)
          uiStore.closeConfirmDialog()
          onSuccess?.()
        } catch {
          uiStore.setConfirmDialogLoading(false)
        }
      },
    })
  }

  return {
    // State
    expenses,
    loading,
    error,
    pagination,
    currentPage,
    totalPages,
    totalItems,
    hasExpenses,

    // Selection state
    selectedIds,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    batchDeleteLoading,

    // Actions
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    confirmDelete,

    // Selection actions
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    batchDeleteExpenses,
    confirmBatchDelete,
  }
}
