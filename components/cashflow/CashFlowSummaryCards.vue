<script setup lang="ts">
import type { CashFlowSummary } from '~/types/cashflow'

interface Props {
  summary: CashFlowSummary | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

function formatCurrency(value: string | undefined): string {
  if (!value) return '$0'
  const num = parseFloat(value)
  return `$${num.toLocaleString('zh-TW')}`
}

function formatPercentage(value: string | undefined): string {
  if (!value) return '0%'
  return `${value}%`
}

const netCashFlowClass = computed(() => {
  if (!props.summary) return 'text-theme-text'
  const net = parseFloat(props.summary.net_cash_flow)
  if (net > 0) return 'text-theme-success'
  if (net < 0) return 'text-theme-error'
  return 'text-theme-text'
})

const savingsRateClass = computed(() => {
  if (!props.summary) return 'text-theme-text'
  const rate = parseFloat(props.summary.savings_rate)
  if (rate >= 20) return 'text-theme-success'
  if (rate >= 10) return 'text-theme-text'
  return 'text-theme-error'
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <!-- Total Income -->
    <div class="card p-4">
      <div class="mb-1 text-body-sm text-theme-text-muted">總收入</div>
      <div v-if="loading" class="h-8 animate-pulse rounded bg-theme-surface-secondary" />
      <div v-else class="text-heading-md font-bold text-theme-text">
        {{ formatCurrency(summary?.total_income) }}/月
      </div>
    </div>

    <!-- Total Expense -->
    <div class="card p-4">
      <div class="mb-1 text-body-sm text-theme-text-muted">總支出</div>
      <div v-if="loading" class="h-8 animate-pulse rounded bg-theme-surface-secondary" />
      <div v-else class="text-heading-md font-bold text-theme-text">
        {{ formatCurrency(summary?.total_expense) }}/月
      </div>
    </div>

    <!-- Net Cash Flow -->
    <div class="card p-4">
      <div class="mb-1 text-body-sm text-theme-text-muted">淨現金流</div>
      <div v-if="loading" class="h-8 animate-pulse rounded bg-theme-surface-secondary" />
      <div v-else :class="['text-heading-md font-bold', netCashFlowClass]">
        {{ parseFloat(summary?.net_cash_flow ?? '0') >= 0 ? '+' : ''
        }}{{ formatCurrency(summary?.net_cash_flow) }}/月
      </div>
    </div>

    <!-- Savings Rate -->
    <div class="card p-4">
      <div class="mb-1 text-body-sm text-theme-text-muted">儲蓄率</div>
      <div v-if="loading" class="h-8 animate-pulse rounded bg-theme-surface-secondary" />
      <div v-else :class="['text-heading-md font-bold', savingsRateClass]">
        {{ formatPercentage(summary?.savings_rate) }}
      </div>
    </div>
  </div>
</template>
