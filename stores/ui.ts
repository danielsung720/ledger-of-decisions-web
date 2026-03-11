import { defineStore } from 'pinia'

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface UiState {
  isExpenseModalOpen: boolean
  isConfirmDialogOpen: boolean
  confirmDialogProps: {
    title: string
    message: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'info'
    loading?: boolean
  } | null
  toasts: Toast[]
  editingExpenseId: number | null
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    isExpenseModalOpen: false,
    isConfirmDialogOpen: false,
    confirmDialogProps: null,
    toasts: [],
    editingExpenseId: null,
  }),

  actions: {
    // Expense Modal
    openExpenseModal(expenseId?: number) {
      this.editingExpenseId = expenseId ?? null
      this.isExpenseModalOpen = true
    },

    closeExpenseModal() {
      this.isExpenseModalOpen = false
      this.editingExpenseId = null
    },

    // Confirm Dialog
    openConfirmDialog(props: UiState['confirmDialogProps']) {
      this.confirmDialogProps = props
      this.isConfirmDialogOpen = true
    },

    closeConfirmDialog() {
      this.isConfirmDialogOpen = false
      this.confirmDialogProps = null
    },

    setConfirmDialogLoading(loading: boolean) {
      if (this.confirmDialogProps) {
        this.confirmDialogProps.loading = loading
      }
    },

    // Toast Notifications
    showToast(toast: Omit<Toast, 'id'>) {
      const id = Math.random().toString(36).slice(2, 11)
      this.toasts = [...this.toasts, { id, ...toast }]

      // Auto remove after duration
      const duration = toast.duration ?? 5000
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, duration)
      }
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    // Convenience methods for toasts
    success(title: string, message?: string) {
      this.showToast({ type: 'success', title, ...(message && { message }) })
    },

    warning(title: string, message?: string) {
      this.showToast({ type: 'warning', title, ...(message && { message }) })
    },

    error(title: string, message?: string) {
      this.showToast({ type: 'error', title, ...(message && { message }) })
    },

    info(title: string, message?: string) {
      this.showToast({ type: 'info', title, ...(message && { message }) })
    },
  },
})
