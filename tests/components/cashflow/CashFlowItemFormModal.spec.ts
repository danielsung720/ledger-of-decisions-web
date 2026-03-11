import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import CashFlowItemFormModal from '~/components/cashflow/CashFlowItemFormModal.vue'
import { mockCashFlowItemSubmitPayload } from '~/tests/fixtures/cashflow'

const createCashFlowItemMock = vi.fn().mockResolvedValue(undefined)
const updateCashFlowItemMock = vi.fn().mockResolvedValue(undefined)
const fetchCashFlowItemByIdMock = vi.fn()
const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})

vi.mock('~/composables/useCashFlow', () => ({
  useCashFlow: () => ({
    createCashFlowItem: createCashFlowItemMock,
    updateCashFlowItem: updateCashFlowItemMock,
  }),
}))

vi.mock('~/stores/cashflow', () => ({
  useCashFlowStore: () => ({
    fetchCashFlowItemById: fetchCashFlowItemByIdMock,
  }),
}))

const submitPayload = { ...mockCashFlowItemSubmitPayload }

const AppModalStub = {
  props: ['open', 'title', 'closeable'],
  emits: ['close'],
  template: `
    <div>
      <slot />
      <button data-testid="modal-close" :disabled="!closeable" @click="$emit('close')">modal-close</button>
    </div>
  `,
}

const CashFlowItemFormStub = defineComponent({
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const emitSubmit = () => emit('submit', submitPayload)
    const emitCancel = () => {
      if (!props.loading) {
        emit('cancel')
      }
    }
    return { emitSubmit, emitCancel, props }
  },
  template: `
    <div>
      <button data-testid="submit" @click="emitSubmit">submit</button>
      <button data-testid="cancel" :disabled="props.loading" @click="emitCancel">cancel</button>
    </div>
  `,
})

function mountModal(props: Record<string, unknown>) {
  return mount(CashFlowItemFormModal, {
    props,
    global: {
      stubs: {
        AppModal: AppModalStub,
        AppSpinner: true,
        CashFlowItemForm: CashFlowItemFormStub,
      },
    },
  })
}

describe('CashFlowItemFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates cashflow item and emits saved/close in create mode', async () => {
    const wrapper = mountModal({ open: true, itemId: null })

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(createCashFlowItemMock).toHaveBeenCalledWith(submitPayload)
    expect(updateCashFlowItemMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('updates cashflow item by id in edit mode', async () => {
    fetchCashFlowItemByIdMock.mockResolvedValueOnce({
      id: 9,
      ...submitPayload,
      amount: '25000.00',
    })

    const wrapper = mountModal({ open: true, itemId: 9 })
    await vi.waitFor(() => {
      expect(fetchCashFlowItemByIdMock).toHaveBeenCalledWith(9)
    })
    await flushPromises()

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(fetchCashFlowItemByIdMock).toHaveBeenCalledWith(9)
    expect(updateCashFlowItemMock).toHaveBeenCalledWith(9, submitPayload)
    expect(wrapper.emitted('saved')).toHaveLength(1)
  })

  it('emits close when fetching edit item fails', async () => {
    fetchCashFlowItemByIdMock.mockRejectedValueOnce(new Error('not-found'))

    const wrapper = mountModal({ open: true, itemId: 99 })
    await flushPromises()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('keeps modal open when create api fails and resets loading state', async () => {
    createCashFlowItemMock.mockRejectedValueOnce(new Error('create-failed'))
    const wrapper = mountModal({ open: true, itemId: null })

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(createCashFlowItemMock).toHaveBeenCalledWith(submitPayload)
    expect(consoleErrorMock).toHaveBeenCalled()
    expect(wrapper.emitted('saved')).toBeFalsy()
    expect(wrapper.emitted('close')).toBeFalsy()
    expect(wrapper.get('[data-testid="cancel"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[data-testid="modal-close"]').attributes('disabled')).toBeUndefined()
  })

  it('blocks close interactions while submitting', async () => {
    let resolveCreate: (() => void) | undefined
    createCashFlowItemMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCreate = () => resolve(undefined)
        })
    )

    const wrapper = mountModal({ open: true, itemId: null })

    await wrapper.get('[data-testid="submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="cancel"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="modal-close"]').attributes('disabled')).toBeDefined()

    await wrapper.get('[data-testid="cancel"]').trigger('click')
    await wrapper.get('[data-testid="modal-close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeFalsy()

    resolveCreate?.()
    await flushPromises()

    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
