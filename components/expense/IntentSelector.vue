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

function getButtonClasses(intent: (typeof INTENT_OPTIONS)[number]) {
  const selected = isSelected(intent.value)

  return [
    'flex flex-col items-center justify-center w-[88px] h-20 rounded-lg border transition-all duration-fast cursor-pointer',
    selected
      ? `border-2 border-${intent.color} bg-${intent.lightColor}`
      : 'border border-theme-border bg-theme-surface hover:border-theme-border-hover hover:shadow-sm',
  ]
}
</script>

<template>
  <div class="w-full">
    <label class="label label-required"> 這筆消費的決策意圖是？ </label>

    <div class="flex flex-wrap gap-3">
      <button
        v-for="intent in INTENT_OPTIONS"
        :key="intent.value"
        type="button"
        :class="getButtonClasses(intent)"
        @click="selectIntent(intent.value)"
      >
        <AppIcon :name="intent.icon" class="mb-1 h-5 w-5 text-theme-text-secondary" />
        <span class="text-body-sm font-medium text-theme-text">{{ intent.label }}</span>
        <span class="text-caption text-theme-text-muted">{{ intent.subLabel }}</span>
      </button>
    </div>

    <p v-if="error" class="mt-2 text-caption text-theme-error">
      {{ error }}
    </p>
  </div>
</template>
