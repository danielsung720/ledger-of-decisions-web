import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '~/stores/ui'

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('has correct initial state', () => {
      const store = useUiStore()

      expect(store.isExpenseModalOpen).toBe(false)
      expect(store.isConfirmDialogOpen).toBe(false)
      expect(store.confirmDialogProps).toBe(null)
      expect(store.toasts).toEqual([])
      expect(store.editingExpenseId).toBe(null)
    })
  })

  describe('openExpenseModal', () => {
    it('opens modal without expense id', () => {
      const store = useUiStore()

      store.openExpenseModal()

      expect(store.isExpenseModalOpen).toBe(true)
      expect(store.editingExpenseId).toBe(null)
    })

    it('opens modal with expense id for editing', () => {
      const store = useUiStore()

      store.openExpenseModal(123)

      expect(store.isExpenseModalOpen).toBe(true)
      expect(store.editingExpenseId).toBe(123)
    })
  })

  describe('closeExpenseModal', () => {
    it('closes modal and clears editing id', () => {
      const store = useUiStore()
      store.openExpenseModal(123)

      store.closeExpenseModal()

      expect(store.isExpenseModalOpen).toBe(false)
      expect(store.editingExpenseId).toBe(null)
    })
  })

  describe('openConfirmDialog', () => {
    it('opens confirm dialog with props', () => {
      const store = useUiStore()
      const props = {
        title: 'Delete Expense',
        message: 'Are you sure?',
        onConfirm: vi.fn(),
        variant: 'danger' as const,
      }

      store.openConfirmDialog(props)

      expect(store.isConfirmDialogOpen).toBe(true)
      expect(store.confirmDialogProps).toEqual(props)
    })
  })

  describe('closeConfirmDialog', () => {
    it('closes confirm dialog and clears props', () => {
      const store = useUiStore()
      store.openConfirmDialog({
        title: 'Test',
        message: 'Test message',
        onConfirm: vi.fn(),
      })

      store.closeConfirmDialog()

      expect(store.isConfirmDialogOpen).toBe(false)
      expect(store.confirmDialogProps).toBe(null)
    })
  })

  describe('setConfirmDialogLoading', () => {
    it('sets loading state on confirm dialog', () => {
      const store = useUiStore()
      store.openConfirmDialog({
        title: 'Test',
        message: 'Test message',
        onConfirm: vi.fn(),
      })

      store.setConfirmDialogLoading(true)

      expect(store.confirmDialogProps?.loading).toBe(true)
    })

    it('does nothing if no confirm dialog props', () => {
      const store = useUiStore()

      store.setConfirmDialogLoading(true)

      expect(store.confirmDialogProps).toBe(null)
    })
  })

  describe('showToast', () => {
    it('adds toast to list', () => {
      const store = useUiStore()

      store.showToast({ type: 'success', title: 'Test' })

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].type).toBe('success')
      expect(store.toasts[0].title).toBe('Test')
      expect(store.toasts[0].id).toBeTruthy()
    })

    it('adds toast with message', () => {
      const store = useUiStore()

      store.showToast({ type: 'error', title: 'Error', message: 'Something went wrong' })

      expect(store.toasts[0].message).toBe('Something went wrong')
    })

    it('auto removes toast after duration', () => {
      const store = useUiStore()

      store.showToast({ type: 'info', title: 'Info', duration: 3000 })

      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(3000)

      expect(store.toasts).toHaveLength(0)
    })

    it('uses default duration of 5000ms', () => {
      const store = useUiStore()

      store.showToast({ type: 'info', title: 'Info' })

      vi.advanceTimersByTime(4999)
      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(store.toasts).toHaveLength(0)
    })

    it('does not auto remove if duration is 0', () => {
      const store = useUiStore()

      store.showToast({ type: 'info', title: 'Info', duration: 0 })

      vi.advanceTimersByTime(10000)
      expect(store.toasts).toHaveLength(1)
    })
  })

  describe('removeToast', () => {
    it('removes toast by id', () => {
      const store = useUiStore()
      store.showToast({ type: 'success', title: 'Test 1', duration: 0 })
      store.showToast({ type: 'error', title: 'Test 2', duration: 0 })

      const toastId = store.toasts[0].id
      store.removeToast(toastId)

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].title).toBe('Test 2')
    })

    it('does nothing if id not found', () => {
      const store = useUiStore()
      store.showToast({ type: 'success', title: 'Test', duration: 0 })

      store.removeToast('non-existent-id')

      expect(store.toasts).toHaveLength(1)
    })
  })

  describe('convenience toast methods', () => {
    it('success shows success toast', () => {
      const store = useUiStore()

      store.success('Success!')

      expect(store.toasts[0].type).toBe('success')
      expect(store.toasts[0].title).toBe('Success!')
    })

    it('success with message', () => {
      const store = useUiStore()

      store.success('Success!', 'Details here')

      expect(store.toasts[0].message).toBe('Details here')
    })

    it('warning shows warning toast', () => {
      const store = useUiStore()

      store.warning('Warning!')

      expect(store.toasts[0].type).toBe('warning')
      expect(store.toasts[0].title).toBe('Warning!')
    })

    it('error shows error toast', () => {
      const store = useUiStore()

      store.error('Error!')

      expect(store.toasts[0].type).toBe('error')
      expect(store.toasts[0].title).toBe('Error!')
    })

    it('info shows info toast', () => {
      const store = useUiStore()

      store.info('Info!')

      expect(store.toasts[0].type).toBe('info')
      expect(store.toasts[0].title).toBe('Info!')
    })
  })
})
