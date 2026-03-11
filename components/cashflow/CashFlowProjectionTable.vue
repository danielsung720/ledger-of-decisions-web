<script setup lang="ts">
import type { CashFlowProjection } from '~/types/cashflow'

interface Props {
  projections: CashFlowProjection[]
  selectedMonths: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const hasProjections = computed(() => props.projections.length > 0)

function formatCurrency(value: string): string {
  const num = parseFloat(value)
  const formatted = `$${Math.abs(num).toLocaleString('zh-TW')}`
  return num < 0 ? `-${formatted}` : formatted
}

function getNetClass(value: string): string {
  const num = parseFloat(value)
  if (num > 0) return 'text-theme-success'
  if (num < 0) return 'text-theme-error'
  return 'text-theme-text'
}

function getCumulativeClass(value: string): string {
  const num = parseFloat(value)
  if (num > 0) return 'text-theme-success'
  if (num < 0) return 'text-theme-error'
  return 'text-theme-text'
}
</script>

<template>
  <div class="card overflow-hidden">
    <div class="border-b border-theme-border bg-theme-bg px-4 py-3">
      <h3 class="text-heading-sm font-semibold text-theme-text">
        多月預測 ({{ selectedMonths }} 個月)
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasProjections" class="py-12 text-center">
      <p class="text-body-md text-theme-text-muted">無預測資料</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-theme-border text-left text-body-sm text-theme-text-muted">
            <th class="px-4 py-3 font-medium">月份</th>
            <th class="px-4 py-3 text-right font-medium">收入</th>
            <th class="px-4 py-3 text-right font-medium">支出</th>
            <th class="px-4 py-3 text-right font-medium">淨額</th>
            <th class="px-4 py-3 text-right font-medium">累計餘額</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="projection in projections"
            :key="projection.month"
            class="border-b border-theme-border transition-colors hover:bg-theme-surface-secondary"
          >
            <td class="px-4 py-3 text-body-md font-medium text-theme-text">
              {{ projection.month }}
            </td>
            <td class="px-4 py-3 text-right text-body-md text-theme-text">
              {{ formatCurrency(projection.income) }}
            </td>
            <td class="px-4 py-3 text-right text-body-md text-theme-text">
              {{ formatCurrency(projection.expense) }}
            </td>
            <td
              :class="[
                'px-4 py-3 text-right text-body-md font-medium',
                getNetClass(projection.net),
              ]"
            >
              {{ parseFloat(projection.net) >= 0 ? '+' : '' }}{{ formatCurrency(projection.net) }}
            </td>
            <td
              :class="[
                'px-4 py-3 text-right text-body-md font-medium',
                getCumulativeClass(projection.cumulative_balance),
              ]"
            >
              {{ formatCurrency(projection.cumulative_balance) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
