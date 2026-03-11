import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const handleMonthChangeMock = vi.fn()
const handleAddIncomeMock = vi.fn()
const handleAddExpenseMock = vi.fn()
const localSelectedMonthsRef = ref(1)
const showIncomeModalRef = ref(false)
const editingIncomeIdRef = ref<number | null>(null)
const showExpenseModalRef = ref(false)
const editingExpenseIdRef = ref<number | null>(null)
const closeConfirmDialogMock = vi.fn()
const confirmDialogActionMock = vi.fn()
const uiStoreMock = {
  isConfirmDialogOpen: false,
  confirmDialogProps: null as null | {
    title: string
    message: string
    variant: 'warning' | 'danger'
    loading: boolean
    onConfirm?: () => void
  },
  closeConfirmDialog: closeConfirmDialogMock,
}

vi.mock('~/composables/useCashFlowViewModel', () => ({
  useCashFlowViewModel: () => ({
    incomes: ref([]),
    cashFlowItems: ref([]),
    summary: ref(null),
    projections: ref([]),
    localSelectedMonths: localSelectedMonthsRef,
    loading: ref(false),
    showIncomeModal: showIncomeModalRef,
    editingIncomeId: editingIncomeIdRef,
    showExpenseModal: showExpenseModalRef,
    editingExpenseId: editingExpenseIdRef,
    handleMonthChange: handleMonthChangeMock,
    handleAddIncome: handleAddIncomeMock,
    handleEditIncome: vi.fn(),
    handleDeleteIncome: vi.fn(),
    handleIncomeModalClose: vi.fn(),
    handleIncomeModalSaved: vi.fn(),
    handleAddExpense: handleAddExpenseMock,
    handleEditExpense: vi.fn(),
    handleDeleteExpense: vi.fn(),
    handleExpenseModalClose: vi.fn(),
    handleExpenseModalSaved: vi.fn(),
  }),
}))

vi.mock('~/stores/ui', () => ({
  useUiStore: () => uiStoreMock,
}))

describe('cashflow page smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uiStoreMock.isConfirmDialogOpen = false
    uiStoreMock.confirmDialogProps = null
    localSelectedMonthsRef.value = 1
    showIncomeModalRef.value = false
    editingIncomeIdRef.value = null
    showExpenseModalRef.value = false
    editingExpenseIdRef.value = null
  })

  it('renders core sections and binds primary interactions', async () => {
    const CashflowPage = (await import('~/pages/cashflow.vue')).default

    const wrapper = mount(CashflowPage, {
      global: {
        stubs: {
          AppButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          MonthSelector: {
            props: ['modelValue'],
            emits: ['update:model-value'],
            template: `
              <input
                data-testid="month-selector"
                :value="modelValue"
                @input="$emit('update:model-value', Number($event.target.value))"
              >
            `,
          },
          CashFlowSummaryCards: true,
          IncomeTable: true,
          CashFlowItemTable: true,
          CashFlowProjectionTable: true,
          IncomeFormModal: true,
          CashFlowItemFormModal: true,
          AppConfirmDialog: {
            emits: ['confirm', 'cancel'],
            template: `
              <button data-testid="confirm-dialog-confirm" @click="$emit('confirm')">
                confirm
              </button>
            `,
          },
          PlusIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('每月現金流估算')
    expect(wrapper.text()).toContain('新增收入')
    expect(wrapper.text()).toContain('新增支出')
    expect(wrapper.find('[data-testid="btn-add-income"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="btn-add-expense"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="month-selector"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="income-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="expense-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="projection-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="income-modal"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="expense-modal"]').exists()).toBe(false)

    const incomeButton = wrapper.findAll('button').find((b) => b.text().includes('新增收入'))
    const expenseButton = wrapper.findAll('button').find((b) => b.text().includes('新增支出'))

    expect(incomeButton).toBeTruthy()
    expect(expenseButton).toBeTruthy()

    await incomeButton!.trigger('click')
    await expenseButton!.trigger('click')
    await wrapper.get('[data-testid="month-selector"]').setValue('6')

    expect(handleAddIncomeMock).toHaveBeenCalled()
    expect(handleAddExpenseMock).toHaveBeenCalled()
    expect(handleMonthChangeMock).toHaveBeenCalledWith(6)
  })

  it('renders modal components only when open state is true', async () => {
    const CashflowPage = (await import('~/pages/cashflow.vue')).default
    showIncomeModalRef.value = true
    editingIncomeIdRef.value = 77
    showExpenseModalRef.value = true
    editingExpenseIdRef.value = 88

    const wrapper = mount(CashflowPage, {
      global: {
        stubs: {
          AppButton: true,
          MonthSelector: true,
          CashFlowSummaryCards: true,
          IncomeTable: true,
          CashFlowItemTable: true,
          CashFlowProjectionTable: true,
          IncomeFormModal: true,
          CashFlowItemFormModal: true,
          AppConfirmDialog: true,
          PlusIcon: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="income-modal"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="expense-modal"]').exists()).toBe(true)
  })

  it('closes confirm dialog when confirm callback is missing', async () => {
    const CashflowPage = (await import('~/pages/cashflow.vue')).default
    uiStoreMock.isConfirmDialogOpen = true
    uiStoreMock.confirmDialogProps = null

    const wrapper = mount(CashflowPage, {
      global: {
        stubs: {
          AppButton: true,
          MonthSelector: true,
          CashFlowSummaryCards: true,
          IncomeTable: true,
          CashFlowItemTable: true,
          CashFlowProjectionTable: true,
          IncomeFormModal: true,
          CashFlowItemFormModal: true,
          AppConfirmDialog: {
            emits: ['confirm', 'cancel'],
            template: `
              <button data-testid="confirm-dialog-confirm" @click="$emit('confirm')">
                confirm
              </button>
            `,
          },
          PlusIcon: true,
        },
      },
    })

    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')

    expect(closeConfirmDialogMock).toHaveBeenCalledTimes(1)
  })

  it('calls confirm callback when present', async () => {
    const CashflowPage = (await import('~/pages/cashflow.vue')).default
    uiStoreMock.isConfirmDialogOpen = true
    uiStoreMock.confirmDialogProps = {
      title: '確認',
      message: 'message',
      variant: 'warning',
      loading: false,
      onConfirm: confirmDialogActionMock,
    }

    const wrapper = mount(CashflowPage, {
      global: {
        stubs: {
          AppButton: true,
          MonthSelector: true,
          CashFlowSummaryCards: true,
          IncomeTable: true,
          CashFlowItemTable: true,
          CashFlowProjectionTable: true,
          IncomeFormModal: true,
          CashFlowItemFormModal: true,
          AppConfirmDialog: {
            emits: ['confirm', 'cancel'],
            template: `
              <button data-testid="confirm-dialog-confirm" @click="$emit('confirm')">
                confirm
              </button>
            `,
          },
          PlusIcon: true,
        },
      },
    })

    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')

    expect(confirmDialogActionMock).toHaveBeenCalledTimes(1)
    expect(closeConfirmDialogMock).not.toHaveBeenCalled()
  })
})
