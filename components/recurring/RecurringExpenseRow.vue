<script setup lang="ts">
import {
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  DocumentDuplicateIcon,
} from '@heroicons/vue/24/outline'
import type { RecurringExpense } from '~/types/recurring-expense'
import { CATEGORY_MAP, FREQUENCY_TYPE_MAP, INTENT_MAP } from '~/utils/constants'

interface Props {
  recurringExpense: RecurringExpense
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [recurringExpense: RecurringExpense]
  delete: [recurringExpense: RecurringExpense]
  toggleActive: [recurringExpense: RecurringExpense]
  generate: [recurringExpense: RecurringExpense]
  viewHistory: [recurringExpense: RecurringExpense]
}>()

const categoryInfo = computed(() => CATEGORY_MAP[props.recurringExpense.category])
const frequencyInfo = computed(() => FREQUENCY_TYPE_MAP[props.recurringExpense.frequency_type])
const intentInfo = computed(() =>
  props.recurringExpense.default_intent ? INTENT_MAP[props.recurringExpense.default_intent] : null
)

const nextOccurrenceDisplay = computed(() => {
  if (!props.recurringExpense.next_occurrence) {
    return '已結束'
  }
  const date = new Date(props.recurringExpense.next_occurrence)
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
})

const isExpiringSoon = computed(() => {
  if (!props.recurringExpense.next_occurrence || !props.recurringExpense.is_active) {
    return false
  }
  const nextDate = new Date(props.recurringExpense.next_occurrence)
  const today = new Date()
  const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 3 && diffDays >= 0
})
</script>

<template>
  <div
    :class="[
      'group flex items-center gap-4 rounded-lg border bg-theme-surface p-4 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-md',
      recurringExpense.is_active
        ? 'border-theme-border'
        : 'border-theme-border bg-theme-bg opacity-75',
    ]"
  >
    <div
      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-theme-surface-secondary text-theme-text-secondary"
    >
      <AppIcon :name="categoryInfo?.icon ?? 'package'" class="h-5 w-5" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="text-body-sm font-medium text-theme-text">
          {{ recurringExpense.name }}
        </span>

        <span
          v-if="!recurringExpense.is_active"
          class="inline-flex items-center rounded-full bg-theme-surface-secondary px-2 py-0.5 text-caption font-medium text-theme-text-secondary"
        >
          已停用
        </span>

        <span
          v-if="intentInfo"
          :class="[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium',
          ]"
          :style="{
            backgroundColor: `var(--color-${intentInfo.lightColor}, #f5f5f5)`,
            color: `var(--color-${intentInfo.color}, #666)`,
          }"
        >
          <AppIcon :name="intentInfo.icon" class="h-3.5 w-3.5" />
          <span>{{ intentInfo.label }}</span>
        </span>
      </div>

      <div class="mt-1 flex items-center gap-3">
        <span class="flex items-center gap-1 text-caption text-theme-text-muted">
          <AppIcon :name="frequencyInfo?.icon ?? 'calendar'" class="h-3.5 w-3.5" />
          <span>{{ recurringExpense.frequency_display }}</span>
        </span>

        <span
          v-if="recurringExpense.is_active"
          :class="[
            'flex items-center gap-1 text-caption',
            isExpiringSoon ? 'font-medium text-theme-error' : 'text-theme-text-muted',
          ]"
        >
          <ClockIcon class="h-3.5 w-3.5" />
          <span>{{ nextOccurrenceDisplay }}</span>
        </span>

        <span
          v-if="recurringExpense.expenses_count !== undefined"
          class="text-caption text-theme-text-muted"
        >
          {{ recurringExpense.expenses_count }} 筆記錄
        </span>
      </div>
    </div>

    <div class="flex-shrink-0 text-right">
      <span class="font-number text-body-md font-semibold text-theme-text">
        {{ recurringExpense.amount_display }}
      </span>
      <span class="ml-1 text-caption text-theme-text-muted">
        {{ recurringExpense.currency }}
      </span>
    </div>

    <div
      class="flex flex-shrink-0 gap-1 opacity-0 transition-opacity duration-fast group-hover:opacity-100"
    >
      <button
        v-if="recurringExpense.is_active"
        type="button"
        class="btn-icon text-theme-primary hover:bg-theme-primary-light hover:text-theme-primary"
        title="手動生成"
        @click="emit('generate', recurringExpense)"
      >
        <DocumentDuplicateIcon class="h-4 w-4" />
      </button>

      <button
        type="button"
        :class="[
          'btn-icon',
          recurringExpense.is_active
            ? 'text-theme-text-muted hover:bg-theme-surface-secondary hover:text-theme-text-secondary'
            : 'text-theme-success hover:bg-theme-success-light hover:text-theme-success',
        ]"
        :title="recurringExpense.is_active ? '停用' : '啟用'"
        @click="emit('toggleActive', recurringExpense)"
      >
        <PauseIcon v-if="recurringExpense.is_active" class="h-4 w-4" />
        <PlayIcon v-else class="h-4 w-4" />
      </button>

      <button type="button" class="btn-icon" title="編輯" @click="emit('edit', recurringExpense)">
        <PencilIcon class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="btn-icon text-theme-error hover:bg-theme-error-light hover:text-theme-error"
        title="刪除"
        @click="emit('delete', recurringExpense)"
      >
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
