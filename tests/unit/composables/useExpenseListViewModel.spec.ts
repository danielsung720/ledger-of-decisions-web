import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import type { Expense } from '~/types'

const fetchExpensesMock = vi.fn().mockResolvedValue(undefined)
const confirmDeleteMock = vi.fn()
const toggleSelectionMock = vi.fn()
const toggleSelectAllMock = vi.fn()
const clearSelectionMock = vi.fn()
const confirmBatchDeleteMock = vi.fn()
const openExpenseModalMock = vi.fn()

const expensesRef = ref<Expense[]>([])
const loadingRef = ref(false)
const currentPageRef = ref(1)
const totalPagesRef = ref(1)
const totalItemsRef = ref(0)
const selectedIdsRef = ref(new Set<number>())
const selectedCountRef = ref(0)
const isAllSelectedRef = ref(false)
const isIndeterminateRef = ref(false)
const batchDeleteLoadingRef = ref(false)

vi.mock('~/composables/useExpenses', () => ({
  useExpenses: () => ({
    expenses: expensesRef,
    loading: loadingRef,
    currentPage: currentPageRef,
    totalPages: totalPagesRef,
    totalItems: totalItemsRef,
    fetchExpenses: fetchExpensesMock,
    confirmDelete: confirmDeleteMock,
    selectedIds: selectedIdsRef,
    selectedCount: selectedCountRef,
    isAllSelected: isAllSelectedRef,
    isIndeterminate: isIndeterminateRef,
    batchDeleteLoading: batchDeleteLoadingRef,
    toggleSelection: toggleSelectionMock,
    toggleSelectAll: toggleSelectAllMock,
    clearSelection: clearSelectionMock,
    confirmBatchDelete: confirmBatchDeleteMock,
  }),
}))

vi.mock('~/stores/ui', () => ({
  useUiStore: () => ({
    openExpenseModal: openExpenseModalMock,
  }),
}))

describe('useExpenseListViewModel', () => {
  const expenseDataVersionRef = ref(0)

  beforeEach(() => {
    vi.clearAllMocks()
    expenseDataVersionRef.value = 0
    loadingRef.value = false
    totalPagesRef.value = 1
  })

  it('builds default query params with preset and array filters', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.page.value = 2
    vm.perPage.value = 20
    vm.filters.value.categories = ['food', 'living']
    vm.filters.value.intents = ['necessity', 'impulse']

    expect(vm.buildQueryParams()).toEqual({
      page: 2,
      per_page: 20,
      preset: 'this_month',
      category: ['food', 'living'],
      intent: ['necessity', 'impulse'],
    })
  })

  it('builds custom date-range query without preset', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.filters.value.preset = 'custom'
    vm.filters.value.startDate = '2026-02-01'
    vm.filters.value.endDate = '2026-02-29'

    expect(vm.buildQueryParams()).toEqual({
      page: 1,
      per_page: 15,
      start_date: '2026-02-01',
      end_date: '2026-02-29',
    })
  })

  it('ignores custom dates when preset is not custom', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.filters.value.preset = 'today'
    vm.filters.value.startDate = '2026-02-01'
    vm.filters.value.endDate = '2026-02-29'

    expect(vm.buildQueryParams()).toEqual({
      page: 1,
      per_page: 15,
      preset: 'today',
    })
  })

  it('normalizes page/per-page query params to backend-safe bounds', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.page.value = -99
    vm.perPage.value = 999

    expect(vm.buildQueryParams()).toEqual({
      page: 1,
      per_page: 100,
      preset: 'this_month',
    })
  })

  it('loads expenses with built query params', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.filters.value.categories = ['transport']
    await vm.loadExpenses()

    expect(fetchExpensesMock).toHaveBeenCalledWith({
      page: 1,
      per_page: 15,
      preset: 'this_month',
      category: ['transport'],
    })
  })

  it('resets page and reloads on search', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.page.value = 3
    vm.handleSearch()
    await nextTick()

    expect(vm.page.value).toBe(1)
    expect(clearSelectionMock).toHaveBeenCalledTimes(1)
    expect(fetchExpensesMock).toHaveBeenCalledTimes(1)
  })

  it('changes page and reloads', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    totalPagesRef.value = 10
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.handlePageChange(4)
    await nextTick()

    expect(vm.page.value).toBe(4)
    expect(clearSelectionMock).toHaveBeenCalledTimes(1)
    expect(fetchExpensesMock).toHaveBeenCalledWith({
      page: 4,
      per_page: 15,
      preset: 'this_month',
    })
  })

  it('bounds page change by available page range', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    totalPagesRef.value = 3
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.handlePageChange(999)
    await nextTick()

    expect(vm.page.value).toBe(3)
    expect(fetchExpensesMock).toHaveBeenCalledWith({
      page: 3,
      per_page: 15,
      preset: 'this_month',
    })
  })

  it('resets to last available page when current page exceeds total pages after reload', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })
    vm.page.value = 3

    fetchExpensesMock.mockImplementationOnce(async () => {
      totalPagesRef.value = 2
    })

    await vm.loadExpenses()

    expect(vm.page.value).toBe(2)
    expect(fetchExpensesMock).toHaveBeenCalledTimes(2)
    expect(fetchExpensesMock).toHaveBeenNthCalledWith(2, {
      page: 2,
      per_page: 15,
      preset: 'this_month',
    })
  })

  it('opens edit modal with expense id', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.handleEdit({ id: 77 } as Expense)

    expect(openExpenseModalMock).toHaveBeenCalledWith(77)
  })

  it('confirms delete and reloads after callback', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.handleDelete({ id: 33 } as Expense)
    expect(confirmDeleteMock).toHaveBeenCalledWith(33, expect.any(Function))

    const callback = confirmDeleteMock.mock.calls[0]?.[1] as (() => void) | undefined
    callback?.()
    await nextTick()

    expect(fetchExpensesMock).toHaveBeenCalledTimes(1)
  })

  it('does not trigger search/page/delete while loading', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })
    loadingRef.value = true

    vm.handleSearch()
    vm.handlePageChange(2)
    vm.handleDelete({ id: 33 } as Expense)
    await nextTick()

    expect(fetchExpensesMock).not.toHaveBeenCalled()
    expect(confirmDeleteMock).not.toHaveBeenCalled()
    expect(clearSelectionMock).not.toHaveBeenCalled()
  })

  it('confirms batch delete and reloads after callback', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const vm = useExpenseListViewModel({
      autoLoad: false,
      expenseDataVersion: expenseDataVersionRef,
    })

    vm.handleBatchDelete()
    expect(confirmBatchDeleteMock).toHaveBeenCalledWith(expect.any(Function))

    const callback = confirmBatchDeleteMock.mock.calls[0]?.[0] as (() => void) | undefined
    callback?.()
    await nextTick()

    expect(fetchExpensesMock).toHaveBeenCalledTimes(1)
  })

  it('reloads when expense data version changes', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const versionRef = ref(0)
    useExpenseListViewModel({ autoLoad: false, expenseDataVersion: versionRef })

    versionRef.value += 1
    await nextTick()

    expect(fetchExpensesMock).toHaveBeenCalledTimes(1)
  })

  it('queues one reload when version changes during in-flight loading', async () => {
    const { useExpenseListViewModel } = await import('~/composables/useExpenseListViewModel')
    const versionRef = ref(0)
    const vm = useExpenseListViewModel({ autoLoad: false, expenseDataVersion: versionRef })

    let resolveFirstCall: (() => void) | undefined
    const firstCall = new Promise<void>((resolve) => {
      resolveFirstCall = resolve
    })

    fetchExpensesMock.mockImplementationOnce(() => firstCall).mockResolvedValueOnce(undefined)

    const loadPromise = vm.loadExpenses()
    versionRef.value += 1
    await nextTick()

    resolveFirstCall?.()
    await loadPromise

    expect(fetchExpensesMock).toHaveBeenCalledTimes(2)
    expect(fetchExpensesMock).toHaveBeenNthCalledWith(1, {
      page: 1,
      per_page: 15,
      preset: 'this_month',
    })
    expect(fetchExpensesMock).toHaveBeenNthCalledWith(2, {
      page: 1,
      per_page: 15,
      preset: 'this_month',
    })
  })
})
