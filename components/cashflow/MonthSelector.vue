<script setup lang="ts">
import { PROJECTION_MONTH_OPTIONS } from '~/utils/constants'

const modelValue = defineModel<number>({ required: true })

function handleSelect(months: number) {
  modelValue.value = months
}
</script>

<template>
  <div class="flex gap-2">
    <button
      v-for="option in PROJECTION_MONTH_OPTIONS"
      :key="option.value"
      type="button"
      :data-testid="`cashflow-month-${option.value}`"
      :class="[
        'rounded-lg px-4 py-2 text-body-sm font-medium transition-colors',
        modelValue === option.value
          ? 'bg-theme-primary text-white'
          : 'bg-theme-surface-secondary text-theme-text-secondary hover:bg-theme-border',
      ]"
      @click="handleSelect(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
