import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ExpenseFormModal from '~/components/expense/ExpenseFormModal.vue'

const createExpenseMock = vi.fn().mockResolvedValue(undefined)
const updateExpenseMock = vi.fn().mockResolvedValue(undefined)
const fetchExpenseByIdMock = vi.fn()

vi.mock('~/composables/useExpenses', () => ({
  useExpenses: () => ({
    createExpense: createExpenseMock,
    updateExpense: updateExpenseMock,
  }),
}))

vi.mock('~/stores/expense', () => ({
  useExpenseStore: () => ({
    fetchExpenseById: fetchExpenseByIdMock,
  }),
}))

const submitPayload = {
  amount: 500,
  category: 'food',
  occurred_at: '2026-02-15 10:00:00',
  intent: 'necessity',
  note: '  lunch  ',
  confidence_level: 'high',
  decision_note: '  needed energy  ',
}

const minimalSubmitPayload = {
  amount: 120,
  category: 'other',
  occurred_at: '2026-02-15 18:00:00',
  intent: 'impulse',
  note: '   ',
  confidence_level: null,
  decision_note: '',
}

const clearedOptionalUpdatePayload = {
  amount: 520,
  category: 'food',
  occurred_at: '2026-02-15 19:00:00',
  intent: 'necessity',
  note: '   ',
  confidence_level: null,
  decision_note: '',
}

const AppModalStub = {
  props: ['open', 'title'],
  emits: ['close'],
  template: '<div><slot /></div>',
}

const ExpenseFormStub = defineComponent({
  emits: ['submit', 'cancel'],
  setup(_, { emit }) {
    const emitSubmit = () => emit('submit', submitPayload)
    const emitCancel = () => emit('cancel')
    return { emitSubmit, emitCancel }
  },
  template: `
    <div>
      <button data-testid="submit" @click="emitSubmit">submit</button>
      <button data-testid="cancel" @click="emitCancel">cancel</button>
    </div>
  `,
})

const MinimalExpenseFormStub = defineComponent({
  emits: ['submit'],
  setup(_, { emit }) {
    const emitSubmit = () => emit('submit', minimalSubmitPayload)
    return { emitSubmit }
  },
  template: '<button data-testid="submit-minimal" @click="emitSubmit">submit-minimal</button>',
})

const ClearedOptionalExpenseFormStub = defineComponent({
  emits: ['submit'],
  setup(_, { emit }) {
    const emitSubmit = () => emit('submit', clearedOptionalUpdatePayload)
    return { emitSubmit }
  },
  template: '<button data-testid="submit-cleared" @click="emitSubmit">submit-cleared</button>',
})

function mountModal(props: Record<string, unknown>, formStub = ExpenseFormStub) {
  return mount(ExpenseFormModal, {
    props,
    global: {
      stubs: {
        AppModal: AppModalStub,
        AppSpinner: true,
        ExpenseForm: formStub,
      },
    },
  })
}

describe('ExpenseFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates entry payload and emits saved/close in create mode', async () => {
    const wrapper = mountModal({ open: true, expenseId: null })

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(createExpenseMock).toHaveBeenCalledWith({
      amount: 500,
      category: 'food',
      occurred_at: '2026-02-15 10:00:00',
      intent: 'necessity',
      note: 'lunch',
      confidence_level: 'high',
      decision_note: 'needed energy',
    })
    expect(updateExpenseMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('updates entry payload by id in edit mode', async () => {
    fetchExpenseByIdMock.mockResolvedValueOnce({
      id: 7,
      amount: '500.00',
      category: 'food',
      occurred_at: '2026-02-15 10:00:00',
      note: null,
      decision: null,
    })

    const wrapper = mountModal({ open: true, expenseId: 7 })
    await flushPromises()
    await flushPromises()

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(fetchExpenseByIdMock).toHaveBeenCalledWith(7)
    expect(updateExpenseMock).toHaveBeenCalledWith(7, {
      amount: 500,
      category: 'food',
      occurred_at: '2026-02-15 10:00:00',
      intent: 'necessity',
      note: 'lunch',
      confidence_level: 'high',
      decision_note: 'needed energy',
    })
    expect(wrapper.emitted('saved')).toHaveLength(1)
  })

  it('keeps modal open when create request fails', async () => {
    createExpenseMock.mockRejectedValueOnce(new Error('validation failed'))
    const wrapper = mountModal({ open: true, expenseId: null })

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('keeps modal open when update request fails', async () => {
    fetchExpenseByIdMock.mockResolvedValueOnce({
      id: 7,
      amount: '500.00',
      category: 'food',
      occurred_at: '2026-02-15 10:00:00',
      note: null,
      decision: null,
    })
    updateExpenseMock.mockRejectedValueOnce(new Error('update failed'))

    const wrapper = mountModal({ open: true, expenseId: 7 })
    await flushPromises()
    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('omits optional fields when create payload has blank values', async () => {
    const wrapper = mountModal({ open: true, expenseId: null }, MinimalExpenseFormStub)

    await wrapper.get('[data-testid="submit-minimal"]').trigger('click')
    await flushPromises()

    expect(createExpenseMock).toHaveBeenCalledWith({
      amount: 120,
      category: 'other',
      occurred_at: '2026-02-15 18:00:00',
      intent: 'impulse',
    })
  })

  it('sends null for cleared optional fields in update payload', async () => {
    fetchExpenseByIdMock.mockResolvedValueOnce({
      id: 7,
      amount: '500.00',
      category: 'food',
      occurred_at: '2026-02-15 10:00:00',
      note: 'legacy note',
      decision: {
        id: 1,
        expense_id: 7,
        intent: 'necessity',
        intent_label: '必要',
        confidence_level: 'high',
        confidence_level_label: '很滿意',
        decision_note: 'legacy decision note',
        created_at: '2026-02-15 10:00:00',
        updated_at: '2026-02-15 10:00:00',
      },
    })

    const wrapper = mountModal({ open: true, expenseId: 7 }, ClearedOptionalExpenseFormStub)
    await flushPromises()
    await wrapper.get('[data-testid="submit-cleared"]').trigger('click')
    await flushPromises()

    expect(updateExpenseMock).toHaveBeenCalledWith(7, {
      amount: 520,
      category: 'food',
      occurred_at: '2026-02-15 19:00:00',
      intent: 'necessity',
      confidence_level: null,
      note: null,
      decision_note: null,
    })
  })

  it('emits close when loading edit expense fails', async () => {
    fetchExpenseByIdMock.mockRejectedValueOnce(new Error('not-found'))
    const wrapper = mountModal({ open: true, expenseId: 999 })
    await flushPromises()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
