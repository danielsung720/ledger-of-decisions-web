<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  maxLength?: number
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  label: '',
  required: false,
  disabled: false,
  error: '',
  maxLength: 500,
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const textareaValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const textareaId = computed(() => `textarea-${Math.random().toString(36).slice(2, 11)}`)

const characterCount = computed(() => props.modelValue.length)

const textareaClasses = computed(() => [
  'w-full px-4 py-3 bg-theme-surface-secondary border rounded-md text-theme-text transition-all duration-fast resize-y',
  'placeholder:text-theme-text-placeholder',
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
    <label v-if="label" :for="textareaId" :class="['label', { 'label-required': required }]">
      {{ label }}
    </label>

    <textarea
      :id="textareaId"
      v-model="textareaValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxLength"
      :class="textareaClasses"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />

    <div class="mt-1 flex items-center justify-between">
      <p v-if="error" class="text-caption text-theme-error">
        {{ error }}
      </p>
      <span v-else />

      <span class="text-caption text-theme-text-muted">
        {{ characterCount }} / {{ maxLength }}
      </span>
    </div>
  </div>
</template>
