import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

const handleSearchMock = vi.fn()
const handlePageChangeMock = vi.fn()
const handleToggleSelectMock = vi.fn()
const handleToggleSelectAllMock = vi.fn()
const handleBatchDeleteMock = vi.fn()
const handleCancelSelectionMock = vi.fn()
const handleEditMock = vi.fn()
const handleDeleteMock = vi.fn()

vi.mock('~/composables/useExpenseListViewModel', () => ({
  useExpenseListViewModel: () => ({
    expenses: ref([{ id: 1 }]),
    loading: ref(false),
    currentPage: ref(1),
    totalPages: ref(3),
    totalItems: ref(30),
    selectedIds: ref(new Set<number>()),
    selectedCount: ref(2),
    isAllSelected: ref(false),
    isIndeterminate: ref(true),
    batchDeleteLoading: ref(false),
    filters: ref({
      preset: 'this_month',
      categories: [],
      intents: [],
      startDate: undefined,
      endDate: undefined,
    }),
    perPage: ref(15),
    handleSearch: handleSearchMock,
    handlePageChange: handlePageChangeMock,
    handleToggleSelect: handleToggleSelectMock,
    handleToggleSelectAll: handleToggleSelectAllMock,
    handleBatchDelete: handleBatchDeleteMock,
    handleCancelSelection: handleCancelSelectionMock,
    handleEdit: handleEditMock,
    handleDelete: handleDeleteMock,
  }),
}))

vi.mock('~/stores/ui', () => ({
  useUiStore: () => ({
    isConfirmDialogOpen: false,
    confirmDialogProps: null,
    closeConfirmDialog: vi.fn(),
  }),
}))

describe('records page smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders core sections and binds primary interactions', async () => {
    const RecordsPage = (await import('~/pages/records.vue')).default

    const wrapper = mount(RecordsPage, {
      global: {
        stubs: {
          ExpenseFilterBar: {
            props: ['modelValue'],
            emits: ['update:modelValue', 'search'],
            template: '<button data-testid="search" @click="$emit(\'search\')">search</button>',
          },
          BatchActionBar: {
            props: ['selectedCount', 'loading'],
            emits: ['delete', 'cancel'],
            template: `
              <div>
                <button data-testid="batch-delete" @click="$emit('delete')">delete</button>
                <button data-testid="batch-cancel" @click="$emit('cancel')">cancel</button>
              </div>
            `,
          },
          ExpenseRecordList: {
            emits: ['edit', 'delete', 'toggle-select', 'toggle-select-all'],
            template: `
              <div>
                <button data-testid="edit" @click="$emit('edit', { id: 1 })">edit</button>
                <button data-testid="delete" @click="$emit('delete', { id: 1 })">delete</button>
                <button data-testid="toggle-select" @click="$emit('toggle-select', { id: 1 })">toggle</button>
                <button data-testid="toggle-select-all" @click="$emit('toggle-select-all')">toggle-all</button>
              </div>
            `,
          },
          AppPagination: {
            emits: ['update:current-page'],
            template:
              '<button data-testid="change-page" @click="$emit(\'update:current-page\', 2)">page</button>',
          },
          AppConfirmDialog: true,
        },
      },
    })

    expect(wrapper.text()).toContain('消費記錄')

    await wrapper.get('[data-testid="search"]').trigger('click')
    await wrapper.get('[data-testid="change-page"]').trigger('click')
    await wrapper.get('[data-testid="toggle-select"]').trigger('click')
    await wrapper.get('[data-testid="toggle-select-all"]').trigger('click')
    await wrapper.get('[data-testid="batch-delete"]').trigger('click')
    await wrapper.get('[data-testid="batch-cancel"]').trigger('click')
    await wrapper.get('[data-testid="edit"]').trigger('click')
    await wrapper.get('[data-testid="delete"]').trigger('click')

    expect(handleSearchMock).toHaveBeenCalledTimes(1)
    expect(handlePageChangeMock).toHaveBeenCalledWith(2)
    expect(handleToggleSelectMock).toHaveBeenCalledWith({ id: 1 })
    expect(handleToggleSelectAllMock).toHaveBeenCalledTimes(1)
    expect(handleBatchDeleteMock).toHaveBeenCalledTimes(1)
    expect(handleCancelSelectionMock).toHaveBeenCalledTimes(1)
    expect(handleEditMock).toHaveBeenCalledWith({ id: 1 })
    expect(handleDeleteMock).toHaveBeenCalledWith({ id: 1 })
  })
})
