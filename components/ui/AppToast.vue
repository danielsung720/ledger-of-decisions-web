<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface Props {
  show: boolean
  type?: ToastType
  title: string
  message?: string
  duration?: number
  closeable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  message: '',
  duration: 5000,
  closeable: true,
})

const emit = defineEmits<{
  close: []
}>()

const iconMap: Record<ToastType, typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
}

const colorMap: Record<ToastType, { icon: string; bg: string; border: string }> = {
  success: {
    icon: 'text-theme-success',
    bg: 'bg-theme-success-light',
    border: 'border-theme-success/20',
  },
  warning: {
    icon: 'text-theme-warning',
    bg: 'bg-theme-warning-light',
    border: 'border-theme-warning/20',
  },
  error: {
    icon: 'text-theme-error',
    bg: 'bg-theme-error-light',
    border: 'border-theme-error/20',
  },
  info: {
    icon: 'text-theme-info',
    bg: 'bg-theme-info-light',
    border: 'border-theme-info/20',
  },
}

const IconComponent = computed(() => iconMap[props.type])
const colors = computed(() => colorMap[props.type])

let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.show,
  (show) => {
    if (show && props.duration > 0) {
      timer = setTimeout(() => {
        emit('close')
      }, props.duration)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="show"
      :class="[
        'fixed bottom-6 right-6 z-toast flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
        colors.bg,
        colors.border,
      ]"
    >
      <component :is="IconComponent" :class="['h-5 w-5 flex-shrink-0', colors.icon]" />

      <div class="min-w-0 flex-1">
        <p class="text-body-sm font-medium text-theme-text">
          {{ title }}
        </p>
        <p v-if="message" class="mt-1 text-body-sm text-theme-text-secondary">
          {{ message }}
        </p>
      </div>

      <button
        v-if="closeable"
        type="button"
        class="flex-shrink-0 text-theme-text-muted hover:text-theme-text-secondary"
        @click="emit('close')"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
  </Transition>
</template>
