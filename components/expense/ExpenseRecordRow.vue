<script setup lang="ts">
import { PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import type { Expense } from '~/types'
import { CATEGORY_MAP, INTENT_MAP, CONFIDENCE_MAP } from '~/utils/constants'
import { formatCurrency, formatSmartDate } from '~/utils/formatters'

interface Props {
  expense: Expense
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
})

const emit = defineEmits<{
  edit: [expense: Expense]
  delete: [expense: Expense]
  toggleSelect: [expense: Expense]
}>()

const categoryInfo = computed(() => CATEGORY_MAP[props.expense.category])
const intentInfo = computed(() =>
  props.expense.decision ? INTENT_MAP[props.expense.decision.intent] : null
)
const confidenceInfo = computed(() =>
  props.expense.decision?.confidence_level
    ? CONFIDENCE_MAP[props.expense.decision.confidence_level]
    : null
)
const isFromRecurring = computed(() => props.expense.is_from_recurring)
const recurringExpenseName = computed(() => props.expense.recurring_expense?.name)
</script>

<template>
  <div
    class="group flex items-center gap-4 rounded-lg border bg-theme-surface p-4 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-md"
    :data-selected="selected ? 'true' : 'false'"
    :class="[
      selected
        ? 'border-l-4 border-b-theme-border border-l-theme-primary border-r-theme-border border-t-theme-border bg-theme-primary-light'
        : 'border-theme-border',
    ]"
  >
    <AppCheckbox
      :model-value="selected"
      data-testid="row-checkbox"
      @update:model-value="emit('toggleSelect', expense)"
    />

    <div
      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-theme-surface-secondary text-theme-text-secondary"
    >
      <AppIcon :name="categoryInfo?.icon ?? 'package'" class="h-5 w-5" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="text-body-sm font-medium text-theme-text">
          {{ categoryInfo?.label }}
        </span>

        <span
          v-if="intentInfo"
          :class="[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium',
            `bg-${intentInfo.lightColor} text-${intentInfo.color}`,
          ]"
          :style="{
            backgroundColor: `var(--color-${intentInfo.lightColor}, #f5f5f5)`,
            color: `var(--color-${intentInfo.color}, #666)`,
          }"
        >
          <AppIcon :name="intentInfo.icon" class="h-3.5 w-3.5" />
          <span>{{ intentInfo.label }}</span>
        </span>

        <AppIcon
          v-if="confidenceInfo"
          :name="confidenceInfo.icon"
          class="h-4 w-4 text-theme-text-muted"
        />

        <span
          v-if="isFromRecurring"
          class="inline-flex items-center gap-1 rounded-full bg-theme-surface-secondary px-2 py-0.5 text-caption font-medium text-theme-text-secondary"
          :title="recurringExpenseName ? `來自固定支出：${recurringExpenseName}` : '來自固定支出'"
        >
          <ArrowPathIcon class="h-3 w-3" />
          <span>固定</span>
        </span>
      </div>

      <div class="mt-1 flex items-center gap-2">
        <span class="text-caption text-theme-text-muted">
          {{ formatSmartDate(expense.occurred_at) }}
        </span>
        <span v-if="expense.note" class="truncate text-caption text-theme-text-muted">
          - {{ expense.note }}
        </span>
      </div>
    </div>

    <div class="flex-shrink-0 text-right">
      <span class="font-number text-body-md font-semibold text-theme-text">
        {{ formatCurrency(expense.amount) }}
      </span>
    </div>

    <div
      class="flex flex-shrink-0 gap-1 opacity-0 transition-opacity duration-fast group-hover:opacity-100"
    >
      <button type="button" class="btn-icon" title="編輯" @click="emit('edit', expense)">
        <PencilIcon class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="btn-icon text-theme-error hover:bg-theme-error-light hover:text-theme-error"
        title="刪除"
        @click="emit('delete', expense)"
      >
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
