<script setup lang="ts">
import type { RecurringExpense } from '~/types/recurring-expense'

interface Props {
  recurringExpenses: RecurringExpense[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  edit: [recurringExpense: RecurringExpense]
  delete: [recurringExpense: RecurringExpense]
  toggleActive: [recurringExpense: RecurringExpense]
  generate: [recurringExpense: RecurringExpense]
  viewHistory: [recurringExpense: RecurringExpense]
}>()

const hasRecurringExpenses = computed(() => props.recurringExpenses.length > 0)
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!hasRecurringExpenses"
      title="尚無固定支出"
      description="新增你的固定支出，系統會自動在到期日產生消費記錄"
      icon="repeat"
    />

    <!-- List -->
    <div v-else class="space-y-3">
      <RecurringExpenseRow
        v-for="recurringExpense in recurringExpenses"
        :key="recurringExpense.id"
        :recurring-expense="recurringExpense"
        @edit="emit('edit', recurringExpense)"
        @delete="emit('delete', recurringExpense)"
        @toggle-active="emit('toggleActive', recurringExpense)"
        @generate="emit('generate', recurringExpense)"
        @view-history="emit('viewHistory', recurringExpense)"
      />
    </div>
  </div>
</template>
