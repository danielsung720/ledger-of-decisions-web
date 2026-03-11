<script setup lang="ts">
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Income } from '~/types/cashflow'

interface Props {
  incomes: Income[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  edit: [income: Income]
  delete: [income: Income]
}>()

const hasIncomes = computed(() => props.incomes.length > 0)

const totalMonthlyIncome = computed(() => {
  return props.incomes
    .filter((i) => i.is_active)
    .reduce((sum, i) => sum + parseFloat(i.monthly_amount), 0)
})

function formatCurrency(value: string): string {
  const num = parseFloat(value)
  return `$${num.toLocaleString('zh-TW')}`
}
</script>

<template>
  <div class="card overflow-hidden">
    <div class="border-b border-theme-border bg-theme-bg px-4 py-3">
      <h3 class="text-heading-sm font-semibold text-theme-text">收入項目</h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasIncomes" class="py-12 text-center">
      <p class="text-body-md text-theme-text-muted">尚無收入項目</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-theme-border text-left text-body-sm text-theme-text-muted">
            <th class="px-4 py-3 font-medium">項目名稱</th>
            <th class="px-4 py-3 font-medium">金額</th>
            <th class="px-4 py-3 font-medium">頻率</th>
            <th class="px-4 py-3 text-right font-medium">月均額</th>
            <th class="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="income in incomes"
            :key="income.id"
            :class="[
              'border-b border-theme-surface-secondary transition-colors hover:bg-theme-bg',
              !income.is_active && 'opacity-50',
            ]"
          >
            <td class="px-4 py-3">
              <div class="text-body-md text-theme-text">{{ income.name }}</div>
              <div v-if="income.note" class="text-caption text-theme-text-muted">
                {{ income.note }}
              </div>
            </td>
            <td class="px-4 py-3 text-body-md text-theme-text">
              {{ income.amount_display }}
            </td>
            <td class="px-4 py-3 text-body-md text-theme-text-secondary">
              {{ income.frequency_display }}
            </td>
            <td class="px-4 py-3 text-right text-body-md font-medium text-theme-text">
              {{ formatCurrency(income.monthly_amount) }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-theme-text-muted transition-colors hover:bg-theme-surface-secondary hover:text-theme-text-secondary"
                  title="編輯"
                  @click="emit('edit', income)"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-theme-text-muted transition-colors hover:bg-theme-error-light hover:text-theme-error"
                  title="刪除"
                  @click="emit('delete', income)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          <!-- Total Row -->
          <tr class="bg-theme-bg font-medium">
            <td class="px-4 py-3 text-body-md text-theme-text">小計</td>
            <td class="px-4 py-3" />
            <td class="px-4 py-3" />
            <td class="px-4 py-3 text-right text-body-md text-theme-text">
              {{ formatCurrency(String(totalMonthlyIncome)) }}
            </td>
            <td class="px-4 py-3" />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
