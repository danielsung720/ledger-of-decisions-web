import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import RecurringExpenseFormModal from '~/components/recurring/RecurringExpenseFormModal.vue'

const createRecurringExpenseMock = vi.fn().mockResolvedValue(undefined)
const updateRecurringExpenseMock = vi.fn().mockResolvedValue(undefined)
const fetchRecurringExpenseByIdMock = vi.fn()

vi.mock('~/composables/useRecurringExpenses', () => ({
  useRecurringExpenses: () => ({
    createRecurringExpense: createRecurringExpenseMock,
    updateRecurringExpense: updateRecurringExpenseMock,
  }),
}))

vi.mock('~/stores/recurring-expense', () => ({
  useRecurringExpenseStore: () => ({
    fetchRecurringExpenseById: fetchRecurringExpenseByIdMock,
  }),
}))

const submitPayload = {
  name: 'Netflix',
  amount_min: 390,
  amount_max: null,
  category: 'living',
  frequency_type: 'monthly',
  frequency_interval: 1,
  day_of_month: 15,
  month_of_year: null,
  day_of_week: null,
  start_date: '2026-02-01',
  end_date: null,
  default_intent: 'enjoyment',
  note: '  family plan  ',
}

const minimalSubmitPayload = {
  name: 'Gym',
  amount_min: 1200,
  amount_max: null,
  category: 'training',
  frequency_type: 'monthly',
  frequency_interval: null,
  day_of_month: null,
  month_of_year: null,
  day_of_week: null,
  start_date: '2026-02-01',
  end_date: '',
  default_intent: null,
  note: '   ',
}

const AppModalStub = {
  props: ['open', 'title', 'size', 'closeable'],
  emits: ['close'],
  template: '<div><slot /></div>',
}

const RecurringExpenseFormStub = defineComponent({
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

const MinimalRecurringExpenseFormStub = defineComponent({
  emits: ['submit'],
  setup(_, { emit }) {
    const emitSubmit = () => emit('submit', minimalSubmitPayload)
    return { emitSubmit }
  },
  template: '<button data-testid="submit-minimal" @click="emitSubmit">submit-minimal</button>',
})

function mountModal(props: Record<string, unknown>, formStub = RecurringExpenseFormStub) {
  return mount(RecurringExpenseFormModal, {
    props,
    global: {
      stubs: {
        AppModal: AppModalStub,
        AppSpinner: true,
        RecurringExpenseForm: formStub,
      },
    },
  })
}

describe('RecurringExpenseFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates recurring expense payload and emits saved/close in create mode', async () => {
    const wrapper = mountModal({ open: true, recurringExpenseId: null })

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(createRecurringExpenseMock).toHaveBeenCalledWith({
      name: 'Netflix',
      amount_min: 390,
      category: 'living',
      frequency_type: 'monthly',
      frequency_interval: 1,
      day_of_month: 15,
      start_date: '2026-02-01',
      default_intent: 'enjoyment',
      note: 'family plan',
    })
    expect(updateRecurringExpenseMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('updates recurring expense payload by id in edit mode', async () => {
    fetchRecurringExpenseByIdMock.mockResolvedValueOnce({
      id: 7,
      name: 'Netflix',
      amount_min: '390.00',
      amount_max: null,
      category: 'living',
      frequency_type: 'monthly',
      frequency_interval: 1,
      day_of_month: 15,
      month_of_year: null,
      day_of_week: null,
      start_date: '2026-02-01',
      end_date: null,
      default_intent: null,
      note: null,
      is_active: true,
    })

    const wrapper = mountModal({ open: true, recurringExpenseId: 7 })
    await flushPromises()
    await flushPromises()

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(fetchRecurringExpenseByIdMock).toHaveBeenCalledWith(7)
    expect(updateRecurringExpenseMock).toHaveBeenCalledWith(7, {
      name: 'Netflix',
      amount_min: 390,
      amount_max: null,
      category: 'living',
      frequency_type: 'monthly',
      frequency_interval: 1,
      day_of_month: 15,
      month_of_year: null,
      day_of_week: null,
      start_date: '2026-02-01',
      end_date: null,
      default_intent: 'enjoyment',
      note: 'family plan',
    })
    expect(wrapper.emitted('saved')).toHaveLength(1)
  })

  it('keeps modal open when create request fails', async () => {
    createRecurringExpenseMock.mockRejectedValueOnce(new Error('validation failed'))
    const wrapper = mountModal({ open: true, recurringExpenseId: null })

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('keeps modal open when update request fails', async () => {
    fetchRecurringExpenseByIdMock.mockResolvedValueOnce({ id: 7 })
    updateRecurringExpenseMock.mockRejectedValueOnce(new Error('update failed'))

    const wrapper = mountModal({ open: true, recurringExpenseId: 7 })
    await flushPromises()

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('omits optional fields when create payload has blank values', async () => {
    const wrapper = mountModal(
      { open: true, recurringExpenseId: null },
      MinimalRecurringExpenseFormStub
    )

    await wrapper.get('[data-testid="submit-minimal"]').trigger('click')
    await flushPromises()

    expect(createRecurringExpenseMock).toHaveBeenCalledWith({
      name: 'Gym',
      amount_min: 1200,
      category: 'training',
      frequency_type: 'monthly',
      start_date: '2026-02-01',
    })
  })

  it('emits close when loading edit recurring expense fails', async () => {
    fetchRecurringExpenseByIdMock.mockRejectedValueOnce(new Error('not-found'))
    const wrapper = mountModal({ open: true, recurringExpenseId: 999 })
    await flushPromises()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
