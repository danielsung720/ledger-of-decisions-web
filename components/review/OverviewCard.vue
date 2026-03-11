<script setup lang="ts">
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, MinusIcon } from '@heroicons/vue/24/outline'
import { formatCurrency, formatPercentage, formatChangePercentage } from '~/utils/formatters'

interface Props {
  totalAmount: number
  totalCount: number
  impulseRatio: number
  impulseTrend?: {
    thisWeek: number
    lastWeek: number
    changePercentage: number
    trend: 'up' | 'down' | 'stable'
  }
}

const props = defineProps<Props>()

const trendIcon = computed(() => {
  switch (props.impulseTrend?.trend) {
    case 'up':
      return ArrowTrendingUpIcon
    case 'down':
      return ArrowTrendingDownIcon
    default:
      return MinusIcon
  }
})

const trendColorClass = computed(() => {
  // For impulse spending, down is good
  switch (props.impulseTrend?.trend) {
    case 'up':
      return 'text-theme-error'
    case 'down':
      return 'text-theme-success'
    default:
      return 'text-theme-text-muted'
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <!-- Total Amount -->
    <div class="card text-center">
      <p class="mb-2 text-body-sm text-theme-text-muted">總消費</p>
      <p class="font-number text-display-md font-bold text-theme-text">
        {{ formatCurrency(totalAmount) }}
      </p>
      <p class="mt-1 text-body-sm text-theme-text-muted">共 {{ totalCount }} 筆</p>
    </div>

    <!-- Impulse Ratio -->
    <div class="card text-center">
      <p class="mb-2 text-body-sm text-theme-text-muted">衝動消費佔比</p>
      <p
        :class="[
          'font-number text-display-md font-bold',
          impulseRatio > 20 ? 'text-theme-error' : 'text-theme-success',
        ]"
      >
        {{ formatPercentage(impulseRatio, 0) }}
      </p>
      <p class="mt-1 text-body-sm text-theme-text-muted">
        {{ impulseRatio > 20 ? '建議控制在 20% 以下' : '控制得很好' }}
      </p>
    </div>

    <!-- Impulse Trend -->
    <div class="card text-center">
      <p class="mb-2 text-body-sm text-theme-text-muted">衝動消費趨勢</p>
      <div v-if="impulseTrend" class="flex items-center justify-center gap-2">
        <component :is="trendIcon" :class="['h-8 w-8', trendColorClass]" />
        <span :class="['font-number text-display-md font-bold', trendColorClass]">
          {{ formatChangePercentage(impulseTrend.changePercentage) }}
        </span>
      </div>
      <p v-else class="text-heading-lg text-theme-text-placeholder">-</p>
      <p class="mt-1 text-body-sm text-theme-text-muted">相較上週</p>
    </div>
  </div>
</template>
