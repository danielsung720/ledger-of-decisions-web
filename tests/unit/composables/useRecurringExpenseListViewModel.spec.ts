import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import type { RecurringExpense } from '~/types/recurring-expense'

const fetchRecurringExpensesMock = vi.fn().mockResolvedValue(undefined)
const toggleActiveMock = vi.fn().mockResolvedValue(undefined)
const confirmDeleteMock = vi.fn()
const confirmGenerateMock = vi.fn()

const recurringExpensesRef = ref<RecurringExpense[]>([])
const loadingRef = ref(false)
const currentPageRef = ref(1)
const totalPagesRef = ref(1)
const totalItemsRef = ref(0)

vi.mock('~/composables/useRecurringExpenses', () => ({
  useRecurringExpenses: () => ({
    recurringExpenses: recurringExpensesRef,
    loading: loadingRef,
    currentPage: currentPageRef,
    totalPages: totalPagesRef,
    totalItems: totalItemsRef,
    fetchRecurringExpenses: fetchRecurringExpensesMock,
    toggleActive: toggleActiveMock,
    confirmDelete: confirmDeleteMock,
    confirmGenerate: confirmGenerateMock,
  }),
}))

describe('useRecurringExpenseListViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadingRef.value = false
    totalPagesRef.value = 1
  })

  it('builds default query params with normalized bounds and array filters', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    vm.page.value = -99
    vm.perPage.value = 999
    vm.filters.value.categories = ['food', 'living']
    vm.filters.value.frequencyTypes = ['monthly', 'yearly']
    vm.filters.value.isActive = true

    expect(vm.buildQueryParams()).toEqual({
      page: 1,
      per_page: 100,
      category: ['food', 'living'],
      frequency_type: ['monthly', 'yearly'],
      is_active: true,
    })
  })

  it('loads recurring expenses with query params', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })
    vm.filters.value.categories = ['transport']

    await vm.loadRecurringExpenses()

    expect(fetchRecurringExpensesMock).toHaveBeenCalledWith({
      page: 1,
      per_page: 15,
      category: ['transport'],
    })
  })

  it('prevents duplicate loads while previous request is still running', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    let resolveRequest: (() => void) | null = null
    fetchRecurringExpensesMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve
        })
    )

    const pendingLoad = vm.loadRecurringExpenses()
    void vm.loadRecurringExpenses()
    await nextTick()

    expect(fetchRecurringExpensesMock).toHaveBeenCalledTimes(1)
    resolveRequest?.()
    await pendingLoad
  })

  it('reloads with bounded page when current page exceeds total pages after fetch', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })
    vm.page.value = 4

    fetchRecurringExpensesMock.mockImplementationOnce(async () => {
      totalPagesRef.value = 2
    })

    await vm.loadRecurringExpenses()

    expect(vm.page.value).toBe(2)
    expect(fetchRecurringExpensesMock).toHaveBeenCalledTimes(2)
    expect(fetchRecurringExpensesMock).toHaveBeenNthCalledWith(2, {
      page: 2,
      per_page: 15,
    })
  })

  it('changes page and reloads with page bound', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    totalPagesRef.value = 3
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    vm.handlePageChange(999)
    await nextTick()

    expect(vm.page.value).toBe(3)
    expect(fetchRecurringExpensesMock).toHaveBeenCalledWith({
      page: 3,
      per_page: 15,
    })
  })

  it('does not trigger page/filter/delete while loading', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    loadingRef.value = true
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    vm.handlePageChange(2)
    vm.setActiveFilter('active')
    vm.handleDelete({ id: 33 } as RecurringExpense)
    await nextTick()

    expect(fetchRecurringExpensesMock).not.toHaveBeenCalled()
    expect(confirmDeleteMock).not.toHaveBeenCalled()
  })

  it('updates active filter state and resets page before reloading', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })
    vm.page.value = 6

    vm.setActiveFilter('inactive')
    await nextTick()

    expect(vm.activeFilter.value).toBe('inactive')
    expect(vm.filters.value.isActive).toBe(false)
    expect(vm.page.value).toBe(1)
    expect(fetchRecurringExpensesMock).toHaveBeenCalledTimes(1)
  })

  it('invokes delete confirmation and reloads when callback runs', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    vm.handleDelete({ id: 99 } as RecurringExpense)
    expect(confirmDeleteMock).toHaveBeenCalledWith(99, expect.any(Function))

    const callback = confirmDeleteMock.mock.calls[0]?.[1] as (() => void) | undefined
    callback?.()
    await nextTick()

    expect(fetchRecurringExpensesMock).toHaveBeenCalledTimes(1)
  })

  it('toggles active state then reloads list', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    await vm.handleToggleActive({ id: 10, is_active: false } as RecurringExpense)

    expect(toggleActiveMock).toHaveBeenCalledWith(10, true)
    expect(fetchRecurringExpensesMock).toHaveBeenCalledTimes(1)
  })

  it('opens and resets modal state for add/edit/close actions', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    vm.handleAdd()
    expect(vm.showFormModal.value).toBe(true)
    expect(vm.editingRecurringExpenseId.value).toBe(null)

    vm.handleEdit({ id: 56 } as RecurringExpense)
    expect(vm.editingRecurringExpenseId.value).toBe(56)

    vm.handleModalClose()
    expect(vm.showFormModal.value).toBe(false)
    expect(vm.editingRecurringExpenseId.value).toBe(null)
  })

  it('reloads list when modal emits saved event', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })
    vm.page.value = 2
    vm.filters.value.isActive = true

    vm.handleModalSaved()
    await nextTick()

    expect(fetchRecurringExpensesMock).toHaveBeenCalledWith({
      page: 2,
      per_page: 15,
      is_active: true,
    })
  })

  it('invokes generate confirmation with name and reload callback', async () => {
    const { useRecurringExpenseListViewModel } =
      await import('~/composables/useRecurringExpenseListViewModel')
    const vm = useRecurringExpenseListViewModel({ autoLoad: false })

    vm.handleGenerate({ id: 88, name: 'Gym', is_active: true } as RecurringExpense)
    expect(confirmGenerateMock).toHaveBeenCalledWith(88, 'Gym', expect.any(Function))

    const callback = confirmGenerateMock.mock.calls[0]?.[2] as (() => void) | undefined
    callback?.()
    await nextTick()

    expect(fetchRecurringExpensesMock).toHaveBeenCalledTimes(1)
  })
})
