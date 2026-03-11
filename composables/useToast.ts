import { useUiStore } from '~/stores/ui'

export function useToast() {
  const uiStore = useUiStore()

  return {
    success: (title: string, message?: string) => uiStore.success(title, message),
    warning: (title: string, message?: string) => uiStore.warning(title, message),
    error: (title: string, message?: string) => uiStore.error(title, message),
    info: (title: string, message?: string) => uiStore.info(title, message),
    remove: (id: string) => uiStore.removeToast(id),
    toasts: computed(() => uiStore.toasts),
  }
}
