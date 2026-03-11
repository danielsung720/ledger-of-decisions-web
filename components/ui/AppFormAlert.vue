<script setup lang="ts">
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  message: string
  type?: 'error' | 'success' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
})

const styles = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        container: 'bg-theme-success-light border-theme-success',
        icon: 'text-theme-success',
        text: 'text-theme-success',
      }
    case 'info':
      return {
        container: 'bg-theme-info-light border-theme-info',
        icon: 'text-theme-info',
        text: 'text-theme-info',
      }
    case 'error':
    default:
      return {
        container: 'bg-theme-error-light border-theme-error',
        icon: 'text-theme-error',
        text: 'text-theme-error',
      }
  }
})

const IconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CheckCircleIcon
    case 'info':
      return InformationCircleIcon
    case 'error':
    default:
      return ExclamationTriangleIcon
  }
})
</script>

<template>
  <div
    role="alert"
    aria-live="polite"
    :class="['flex items-center gap-2.5 rounded-lg border px-4 py-3', styles.container]"
  >
    <component :is="IconComponent" :class="['h-[18px] w-[18px] flex-shrink-0', styles.icon]" />
    <p :class="['text-body-md', styles.text]">
      {{ message }}
    </p>
  </div>
</template>
