<script setup lang="ts">
import type { Expense } from '~/types'

interface Props {
  expenses: Expense[]
  loading?: boolean
  selectedIds?: Set<number>
  isAllSelected?: boolean
  isIndeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectedIds: () => new Set<number>(),
  isAllSelected: false,
  isIndeterminate: false,
})

const emit = defineEmits<{
  edit: [expense: Expense]
  delete: [expense: Expense]
  toggleSelect: [expense: Expense]
  toggleSelectAll: []
}>()

const hasExpenses = computed(() => props.expenses.length > 0)

function isSelected(expense: Expense): boolean {
  return props.selectedIds.has(expense.id)
}
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!hasExpenses"
      title="尚無消費記錄"
      description="開始記錄你的第一筆消費，追蹤你的決策品質"
      icon="notes"
    />

    <!-- List -->
    <div v-else class="space-y-3">
      <!-- Header with Select All -->
      <div class="flex items-center gap-3 px-4 py-2 text-caption text-theme-text-muted">
        <AppCheckbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          data-testid="header-checkbox"
          @update:model-value="emit('toggleSelectAll')"
        />
        <span>全選</span>
      </div>

      <ExpenseRecordRow
        v-for="expense in expenses"
        :key="expense.id"
        :expense="expense"
        :selected="isSelected(expense)"
        @edit="emit('edit', expense)"
        @delete="emit('delete', expense)"
        @toggle-select="emit('toggleSelect', expense)"
      />
    </div>
  </div>
</template>
