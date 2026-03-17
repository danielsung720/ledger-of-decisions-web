<script setup lang="ts">
import type { Intent } from '~/types'
import { INTENT_OPTIONS } from '~/utils/constants'

interface Props {
  modelValue: Intent | null | ''
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: Intent]
}>()

function selectIntent(value: Intent) {
  emit('update:modelValue', value)
}

function isSelected(value: Intent): boolean {
  return props.modelValue === value
}

const SELECTED_INTENT_CLASSES: Record<Intent, string> = {
  necessity:
    'border-2 border-theme-intent-necessity bg-theme-intent-necessity-light ring-2 ring-theme-primary/20 shadow-sm',
  efficiency:
    'border-2 border-theme-intent-efficiency bg-theme-intent-efficiency-light ring-2 ring-theme-primary/20 shadow-sm',
  enjoyment:
    'border-2 border-theme-intent-enjoyment bg-theme-intent-enjoyment-light ring-2 ring-theme-primary/20 shadow-sm',
  recovery:
    'border-2 border-theme-intent-recovery bg-theme-intent-recovery-light ring-2 ring-theme-primary/20 shadow-sm',
  impulse:
    'border-2 border-theme-intent-impulse bg-theme-intent-impulse-light ring-2 ring-theme-primary/20 shadow-sm',
}

function getButtonClasses(intent: (typeof INTENT_OPTIONS)[number]) {
  const selected = isSelected(intent.value)

  return [
    'flex flex-col items-center justify-center w-[88px] h-20 rounded-lg border transition-all duration-fast cursor-pointer',
    selected
      ? SELECTED_INTENT_CLASSES[intent.value]
      : 'border border-theme-border bg-theme-surface hover:border-theme-border-hover hover:shadow-sm',
  ]
}

function getIconClasses(value: Intent) {
  return ['mb-1 h-5 w-5', isSelected(value) ? 'text-theme-text' : 'text-theme-text-secondary']
}

function getSubLabelClasses(value: Intent) {
  return ['text-caption', isSelected(value) ? 'text-theme-text-secondary' : 'text-theme-text-muted']
}
</script>

<template>
  <div class="w-full">
    <label class="label label-required"> 這筆消費的決策意圖是？ </label>

    <div class="flex flex-wrap justify-center gap-3">
      <button
        v-for="intent in INTENT_OPTIONS"
        :key="intent.value"
        type="button"
        :class="getButtonClasses(intent)"
        @click="selectIntent(intent.value)"
      >
        <AppIcon :name="intent.icon" :class="getIconClasses(intent.value)" />
        <span class="text-body-sm font-medium text-theme-text">{{ intent.label }}</span>
        <span :class="getSubLabelClasses(intent.value)">{{ intent.subLabel }}</span>
      </button>
    </div>

    <p v-if="error" class="mt-2 text-caption text-theme-error">
      {{ error }}
    </p>
  </div>
</template>
