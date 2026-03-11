import type {
  IncomeListParams,
  CashFlowItemListParams,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  CreateCashFlowItemRequest,
  UpdateCashFlowItemRequest,
} from '~/types/cashflow'
import { useCashFlowStore } from '~/stores/cashflow'
import { useUiStore } from '~/stores/ui'

export function useCashFlow() {
  const store = useCashFlowStore()
  const uiStore = useUiStore()

  // State
  const incomes = computed(() => store.incomes)
  const currentIncome = computed(() => store.currentIncome)
  const cashFlowItems = computed(() => store.cashFlowItems)
  const currentCashFlowItem = computed(() => store.currentCashFlowItem)
  const summary = computed(() => store.summary)
  const projections = computed(() => store.projections)
  const selectedMonths = computed(() => store.selectedMonths)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)
  const hasIncomes = computed(() => store.hasIncomes)
  const hasCashFlowItems = computed(() => store.hasCashFlowItems)
  const activeIncomes = computed(() => store.activeIncomes)
  const activeCashFlowItems = computed(() => store.activeCashFlowItems)
  const totalMonthlyIncome = computed(() => store.totalMonthlyIncome)
  const totalMonthlyExpense = computed(() => store.totalMonthlyExpense)

  // ============================================================
  // Income Actions
  // ============================================================

  async function fetchIncomes(params?: IncomeListParams) {
    try {
      await store.fetchIncomes(params)
    } catch (err) {
      uiStore.error('載入失敗', '無法載入收入項目，請稍後再試')
      throw err
    }
  }

  async function fetchIncomeById(id: number) {
    try {
      return await store.fetchIncomeById(id)
    } catch {
      uiStore.error('載入失敗', '無法載入收入詳情，請稍後再試')
      throw new Error('Failed to fetch income')
    }
  }

  async function createIncome(data: CreateIncomeRequest) {
    try {
      const income = await store.createIncome(data)
      uiStore.success('新增成功', '收入項目已建立')
      return income
    } catch (err) {
      uiStore.error('新增失敗', '無法建立收入項目，請稍後再試')
      throw err
    }
  }

  async function updateIncome(id: number, data: UpdateIncomeRequest) {
    try {
      const income = await store.updateIncome(id, data)
      uiStore.success('更新成功', '收入項目已更新')
      return income
    } catch (err) {
      uiStore.error('更新失敗', '無法更新收入項目，請稍後再試')
      throw err
    }
  }

  async function deleteIncome(id: number) {
    try {
      await store.deleteIncome(id)
      uiStore.success('刪除成功', '收入項目已刪除')
    } catch (err) {
      uiStore.error('刪除失敗', '無法刪除收入項目，請稍後再試')
      throw err
    }
  }

  async function toggleIncomeActive(id: number, isActive: boolean) {
    try {
      await store.updateIncome(id, { is_active: isActive })
      uiStore.success(
        isActive ? '已啟用' : '已停用',
        isActive ? '收入項目已重新啟用' : '收入項目已暫停'
      )
    } catch (err) {
      uiStore.error('操作失敗', '無法更新狀態，請稍後再試')
      throw err
    }
  }

  function confirmDeleteIncome(id: number, onSuccess?: () => void) {
    uiStore.openConfirmDialog({
      title: '確認刪除',
      message: '確定要刪除這筆收入項目嗎？此操作無法復原。',
      variant: 'danger',
      onConfirm: async () => {
        uiStore.setConfirmDialogLoading(true)
        try {
          await deleteIncome(id)
          uiStore.closeConfirmDialog()
          onSuccess?.()
        } catch {
          uiStore.setConfirmDialogLoading(false)
        }
      },
    })
  }

  // ============================================================
  // Cash Flow Item Actions
  // ============================================================

  async function fetchCashFlowItems(params?: CashFlowItemListParams) {
    try {
      await store.fetchCashFlowItems(params)
    } catch {
      uiStore.error('載入失敗', '無法載入支出項目，請稍後再試')
    }
  }

  async function fetchCashFlowItemById(id: number) {
    try {
      return await store.fetchCashFlowItemById(id)
    } catch {
      uiStore.error('載入失敗', '無法載入支出項目詳情，請稍後再試')
      throw new Error('Failed to fetch cash flow item')
    }
  }

  async function createCashFlowItem(data: CreateCashFlowItemRequest) {
    try {
      const item = await store.createCashFlowItem(data)
      uiStore.success('新增成功', '支出項目已建立')
      return item
    } catch (err) {
      uiStore.error('新增失敗', '無法建立支出項目，請稍後再試')
      throw err
    }
  }

  async function updateCashFlowItem(id: number, data: UpdateCashFlowItemRequest) {
    try {
      const item = await store.updateCashFlowItem(id, data)
      uiStore.success('更新成功', '支出項目已更新')
      return item
    } catch (err) {
      uiStore.error('更新失敗', '無法更新支出項目，請稍後再試')
      throw err
    }
  }

  async function deleteCashFlowItem(id: number) {
    try {
      await store.deleteCashFlowItem(id)
      uiStore.success('刪除成功', '支出項目已刪除')
    } catch (err) {
      uiStore.error('刪除失敗', '無法刪除支出項目，請稍後再試')
      throw err
    }
  }

  async function toggleCashFlowItemActive(id: number, isActive: boolean) {
    try {
      await store.updateCashFlowItem(id, { is_active: isActive })
      uiStore.success(
        isActive ? '已啟用' : '已停用',
        isActive ? '支出項目已重新啟用' : '支出項目已暫停'
      )
    } catch (err) {
      uiStore.error('操作失敗', '無法更新狀態，請稍後再試')
      throw err
    }
  }

  function confirmDeleteCashFlowItem(id: number, onSuccess?: () => void) {
    uiStore.openConfirmDialog({
      title: '確認刪除',
      message: '確定要刪除這筆支出項目嗎？此操作無法復原。',
      variant: 'danger',
      onConfirm: async () => {
        uiStore.setConfirmDialogLoading(true)
        try {
          await deleteCashFlowItem(id)
          uiStore.closeConfirmDialog()
          onSuccess?.()
        } catch {
          uiStore.setConfirmDialogLoading(false)
        }
      },
    })
  }

  // ============================================================
  // Summary and Projection Actions
  // ============================================================

  async function fetchSummary() {
    try {
      return await store.fetchSummary()
    } catch {
      uiStore.error('載入失敗', '無法載入現金流摘要，請稍後再試')
      throw new Error('Failed to fetch summary')
    }
  }

  async function fetchProjection(months?: number) {
    try {
      return await store.fetchProjection(months)
    } catch {
      uiStore.error('載入失敗', '無法載入預測資料，請稍後再試')
      throw new Error('Failed to fetch projection')
    }
  }

  function setSelectedMonths(months: number) {
    store.setSelectedMonths(months)
  }

  function clearCurrentIncome() {
    store.clearCurrentIncome()
  }

  function clearCurrentCashFlowItem() {
    store.clearCurrentCashFlowItem()
  }

  return {
    // State
    incomes,
    currentIncome,
    cashFlowItems,
    currentCashFlowItem,
    summary,
    projections,
    selectedMonths,
    loading,
    error,
    hasIncomes,
    hasCashFlowItems,
    activeIncomes,
    activeCashFlowItems,
    totalMonthlyIncome,
    totalMonthlyExpense,

    // Income Actions
    fetchIncomes,
    fetchIncomeById,
    createIncome,
    updateIncome,
    deleteIncome,
    toggleIncomeActive,
    confirmDeleteIncome,
    clearCurrentIncome,

    // Cash Flow Item Actions
    fetchCashFlowItems,
    fetchCashFlowItemById,
    createCashFlowItem,
    updateCashFlowItem,
    deleteCashFlowItem,
    toggleCashFlowItemActive,
    confirmDeleteCashFlowItem,
    clearCurrentCashFlowItem,

    // Summary and Projection Actions
    fetchSummary,
    fetchProjection,
    setSelectedMonths,
  }
}
