<script setup lang="ts">
import type { IconKey } from '~/types/icon'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  title: string
  icon: IconKey
  count: number
  amount: number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
    label: string
  }
}

const props = defineProps<Props>()

const trendColorClass = computed(() => {
  if (!props.trend) return ''

  switch (props.trend.direction) {
    case 'up':
      return 'text-theme-error'
    case 'down':
      return 'text-theme-success'
    default:
      return 'text-theme-text-muted'
  }
})

const trendIcon = computed(() => {
  if (!props.trend) return ''

  switch (props.trend.direction) {
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    default:
      return '→'
  }
})
</script>

<template>
  <div class="card card-hover">
    <div class="mb-4 flex items-start justify-between">
      <div class="flex items-center gap-2">
        <AppIcon :name="icon" class="h-5 w-5 text-theme-text-secondary" />
        <h3 class="text-body-md font-medium text-theme-text-secondary">{{ title }}</h3>
      </div>

      <span
        v-if="trend"
        :class="['flex items-center gap-1 text-body-sm font-medium', trendColorClass]"
      >
        <span>{{ trendIcon }}</span>
        <span>{{ trend.label }}</span>
      </span>
    </div>

    <div class="space-y-1">
      <p class="text-body-sm text-theme-text-muted">消費 {{ count }} 筆</p>
      <p class="font-number text-heading-lg font-bold text-theme-text">
        {{ formatCurrency(amount) }}
      </p>
    </div>
  </div>
</template>
