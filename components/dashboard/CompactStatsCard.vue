<script setup lang="ts">
import type { IconKey } from '~/types/icon'
import { formatCurrency, formatPercentage } from '~/utils/formatters'

interface Props {
  title: string
  icon: IconKey
  amount?: number
  ratio?: number
  subText: string
  isImpulse?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  amount: undefined,
  ratio: undefined,
  isImpulse: false,
  loading: false,
})

const displayValue = computed(() => {
  if (props.isImpulse) {
    return props.ratio ?? 0
  }

  return props.amount ?? 0
})

const mainText = computed(() => {
  if (props.isImpulse) {
    return formatPercentage(displayValue.value, 0)
  }

  return formatCurrency(displayValue.value)
})

const displaySubText = computed(() => {
  if (displayValue.value <= 0) {
    return '尚無記錄'
  }

  return props.subText
})
</script>

<template>
  <div
    class="flex h-[88px] flex-col justify-between rounded-lg border border-cream-200 bg-cream-100 px-5 py-4 transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
  >
    <template v-if="loading">
      <div class="skeleton-pulse h-3 w-1/3 rounded-md bg-cream-200" />
      <div class="skeleton-pulse h-5 w-1/2 rounded-md bg-cream-200" />
    </template>

    <template v-else>
      <div class="flex items-center gap-1.5">
        <AppIcon :name="icon" class="h-4 w-4 text-warm-gray-500" />
        <p class="text-[12px] font-medium leading-[1.2] text-warm-gray-500">{{ title }}</p>
      </div>

      <p
        :class="[
          'font-number text-[24px] font-bold leading-none',
          isImpulse ? 'text-intent-impulse' : 'text-warm-gray-900',
        ]"
      >
        {{ mainText }}
      </p>

      <p class="text-[12px] leading-[1.2] text-warm-gray-500">{{ displaySubText }}</p>
    </template>
  </div>
</template>

<style scoped>
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.skeleton-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
</style>
