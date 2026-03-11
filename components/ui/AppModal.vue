<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  closeable: true,
})

const emit = defineEmits<{
  close: []
}>()

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

function handleClose() {
  if (props.closeable) {
    emit('close')
  }
}
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-modal" @close="handleClose">
      <!-- Overlay -->
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
              v-bind="$attrs"
              :class="[
                'w-full transform overflow-hidden rounded-xl bg-theme-surface shadow-xl transition-all',
                sizeClasses[size],
              ]"
            >
              <!-- Header -->
              <div
                v-if="title || closeable"
                class="flex items-center justify-between border-b border-theme-border px-6 py-4"
              >
                <DialogTitle
                  v-if="title"
                  as="h3"
                  class="text-heading-sm font-semibold text-theme-text"
                >
                  {{ title }}
                </DialogTitle>
                <span v-else />

                <button v-if="closeable" type="button" class="btn-icon" @click="handleClose">
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </div>

              <!-- Content -->
              <div class="p-6">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="border-t border-theme-border bg-theme-bg px-6 py-4">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
