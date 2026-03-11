<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

interface Props {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '確認',
  cancelText: '取消',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const iconColorClass = computed(() => {
  const colors = {
    danger: 'text-theme-error bg-theme-error-light',
    warning: 'text-theme-warning bg-theme-warning-light',
    info: 'text-theme-info bg-theme-info-light',
  }
  return colors[props.variant]
})

const confirmButtonClass = computed(() => {
  if (props.variant === 'danger') {
    return 'bg-theme-error hover:bg-theme-error/90 text-white'
  }
  return 'bg-theme-primary hover:bg-theme-primary-hover text-white'
})
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-modal" @close="emit('cancel')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-theme-text/30 fixed inset-0 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-sm transform overflow-hidden rounded-xl bg-theme-surface p-6 shadow-xl transition-all"
            >
              <div class="flex flex-col items-center text-center">
                <div
                  :class="[
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    iconColorClass,
                  ]"
                >
                  <ExclamationTriangleIcon class="h-6 w-6" aria-hidden="true" />
                </div>

                <DialogTitle as="h3" class="mt-4 text-heading-sm font-semibold text-theme-text">
                  {{ title }}
                </DialogTitle>

                <p class="mt-2 text-body-sm text-theme-text-secondary">
                  {{ message }}
                </p>
              </div>

              <div class="mt-6 flex gap-3">
                <button
                  type="button"
                  class="btn-secondary flex-1"
                  :disabled="loading"
                  @click="emit('cancel')"
                >
                  {{ cancelText }}
                </button>
                <button
                  type="button"
                  :class="[
                    'inline-flex h-12 flex-1 items-center justify-center rounded-md px-6 font-medium transition-all duration-fast',
                    confirmButtonClass,
                    loading ? 'cursor-not-allowed opacity-70' : '',
                  ]"
                  :disabled="loading"
                  @click="emit('confirm')"
                >
                  <AppSpinner v-if="loading" size="sm" class="mr-2" />
                  {{ confirmText }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
