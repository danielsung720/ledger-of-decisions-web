<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import type { Expense } from '~/types'
import type { IconKey } from '~/types/icon'
import { CATEGORY_MAP, INTENT_MAP } from '~/utils/constants'
import { formatCurrency, formatSmartDate } from '~/utils/formatters'

interface Props {
  expenses: Expense[]
  loading?: boolean
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  limit: 5,
})

const emit = defineEmits<{
  viewAll: []
}>()

const displayExpenses = computed(() => props.expenses.slice(0, props.limit))

function getCategoryIcon(category: string): IconKey {
  return CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.icon ?? 'package'
}

function getIntentIcon(intent: string | undefined): IconKey | null {
  if (!intent) return null
  return INTENT_MAP[intent as keyof typeof INTENT_MAP]?.icon ?? null
}
</script>

<template>
  <div class="card">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-body-md font-medium text-theme-text-secondary">最近消費</h3>

      <button type="button" class="btn-text flex items-center gap-1" @click="emit('viewAll')">
        查看全部
        <ArrowRightIcon class="h-4 w-4" />
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <AppSpinner />
    </div>

    <div v-else-if="expenses.length === 0" class="py-8 text-center text-theme-text-muted">
      尚無消費記錄
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="expense in displayExpenses"
        :key="expense.id"
        class="flex items-center gap-3 border-b border-theme-border py-2 last:border-0"
      >
        <AppIcon
          :name="getCategoryIcon(expense.category)"
          class="h-5 w-5 text-theme-text-secondary"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-body-sm text-theme-text">
              {{ expense.category_label }}
            </span>
            <AppIcon
              v-if="expense.decision && getIntentIcon(expense.decision.intent)"
              :name="getIntentIcon(expense.decision.intent)!"
              class="h-4 w-4 text-theme-text-muted"
            />
          </div>
          <p class="truncate text-caption text-theme-text-muted">
            {{ formatSmartDate(expense.occurred_at) }}
            <span v-if="expense.note"> - {{ expense.note }}</span>
          </p>
        </div>

        <span class="font-number text-body-sm font-medium text-theme-text">
          {{ formatCurrency(expense.amount) }}
        </span>
      </div>
    </div>
  </div>
</template>
