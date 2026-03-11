<script setup lang="ts">
import type { ConfidenceLevel } from '~/types'
import { CONFIDENCE_OPTIONS } from '~/utils/constants'

interface Props {
  modelValue: ConfidenceLevel | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: ConfidenceLevel | null]
}>()

function selectConfidence(value: ConfidenceLevel) {
  if (props.modelValue === value) {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', value)
  }
}

function isSelected(value: ConfidenceLevel): boolean {
  return props.modelValue === value
}

function getButtonClasses(confidence: (typeof CONFIDENCE_OPTIONS)[number]) {
  const selected = isSelected(confidence.value)

  if (selected) {
    return [
      'inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-fast cursor-pointer',
      confidence.bgColor,
      confidence.borderColor,
      confidence.color,
    ]
  }

  return [
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-fast cursor-pointer',
    'border-theme-border bg-theme-surface text-theme-text-secondary',
    'hover:border-theme-border-hover',
  ]
}
</script>

<template>
  <div class="w-full">
    <label class="label"> 這筆消費滿意嗎？（選填） </label>

    <div class="flex flex-wrap gap-3">
      <button
        v-for="confidence in CONFIDENCE_OPTIONS"
        :key="confidence.value"
        type="button"
        :class="getButtonClasses(confidence)"
        @click="selectConfidence(confidence.value)"
      >
        <AppIcon :name="confidence.icon" class="h-4 w-4" />
        <span class="text-body-sm font-medium">{{ confidence.label }}</span>
      </button>
    </div>
  </div>
</template>
