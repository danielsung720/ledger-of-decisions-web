<script setup lang="ts">
import type { IntentStats } from '~/types'
import type { IconKey } from '~/types/icon'
import { INTENT_COLORS, INTENT_MAP } from '~/utils/constants'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  data: IntentStats[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '意圖分布',
})

const maxAmount = computed(() => {
  if (props.data.length === 0) return 0
  return Math.max(...props.data.map((d) => d.total_amount))
})

function getBarWidth(amount: number): string {
  if (maxAmount.value === 0) return '0%'
  return `${(amount / maxAmount.value) * 100}%`
}

function getIntentColor(intent: string): string {
  return INTENT_COLORS[intent as keyof typeof INTENT_COLORS] ?? '#8C8279'
}

function getIntentIcon(intent: string): IconKey {
  return INTENT_MAP[intent as keyof typeof INTENT_MAP]?.icon ?? 'chart-bar'
}
</script>

<template>
  <div class="card">
    <h3 class="mb-4 text-body-md font-medium text-theme-text-secondary">
      {{ title }}
    </h3>

    <div v-if="data.length === 0" class="py-8 text-center text-theme-text-muted">尚無數據</div>

    <div v-else class="space-y-3">
      <div v-for="item in data" :key="item.intent" class="flex items-center gap-3">
        <div class="flex w-24 flex-shrink-0 items-center gap-2">
          <AppIcon :name="getIntentIcon(item.intent)" class="h-4 w-4 text-theme-text-secondary" />
          <span class="text-body-sm text-theme-text-secondary">{{ item.intent_label }}</span>
        </div>

        <div class="h-6 flex-1 overflow-hidden rounded-full bg-theme-surface-secondary">
          <div
            class="h-full rounded-full transition-all duration-slow"
            :style="{
              width: getBarWidth(item.total_amount),
              backgroundColor: getIntentColor(item.intent),
            }"
          />
        </div>

        <div class="w-20 text-right">
          <span class="font-number text-body-sm font-medium text-theme-text">
            {{ formatCurrency(item.total_amount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
