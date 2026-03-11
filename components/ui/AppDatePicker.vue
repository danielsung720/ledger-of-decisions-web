<script setup lang="ts">
import { format, parseISO } from 'date-fns'

interface Props {
  modelValue: string
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  maxDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  disabled: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => `datepicker-${Math.random().toString(36).slice(2, 11)}`)

const dateValue = computed({
  get: () => {
    if (!props.modelValue) return ''
    try {
      const date = parseISO(props.modelValue)
      return format(date, 'yyyy-MM-dd')
    } catch {
      return ''
    }
  },
  set: (value: string) => {
    if (value) {
      emit('update:modelValue', `${value} 00:00:00`)
    } else {
      emit('update:modelValue', '')
    }
  },
})

const maxDateStr = computed(() => (props.maxDate ? format(props.maxDate, 'yyyy-MM-dd') : undefined))

const inputClasses = computed(() => [
  'w-full h-12 px-4 bg-theme-surface-secondary border rounded-md text-theme-text transition-all duration-fast',
  'hover:border-theme-border-hover',
  'focus:border-theme-primary focus:ring-0 focus:outline-none',
  'disabled:bg-theme-surface-secondary disabled:opacity-70 disabled:cursor-not-allowed',
  props.error
    ? 'border-theme-error focus:shadow-error-focus'
    : 'border-theme-border focus:shadow-focus',
])
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" :class="['label', { 'label-required': required }]">
      {{ label }}
    </label>

    <div class="relative">
      <input
        :id="inputId"
        v-model="dateValue"
        type="date"
        :max="maxDateStr"
        :disabled="disabled"
        :class="inputClasses"
      />
    </div>

    <p v-if="error" class="mt-1 text-caption text-theme-error">
      {{ error }}
    </p>
  </div>
</template>
