<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  type?: 'text' | 'number' | 'email' | 'password'
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  prefix?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  label: '',
  required: false,
  disabled: false,
  error: '',
  prefix: '',
  suffix: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inputId = computed(() => `input-${Math.random().toString(36).slice(2, 11)}`)

const inputClasses = computed(() => [
  'w-full h-12 bg-theme-surface-secondary border rounded-md text-theme-text transition-all duration-fast',
  'placeholder:text-theme-text-placeholder',
  'hover:border-theme-border-hover',
  'focus:border-theme-primary focus:ring-0 focus:outline-none',
  'disabled:bg-theme-surface-secondary disabled:opacity-70 disabled:cursor-not-allowed',
  props.error
    ? 'border-theme-error focus:shadow-error-focus'
    : 'border-theme-border focus:shadow-focus',
  props.prefix ? 'pl-10' : 'pl-4',
  props.suffix ? 'pr-16' : 'pr-4',
])
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" :class="['label', { 'label-required': required }]">
      {{ label }}
    </label>

    <div class="relative">
      <span v-if="prefix" class="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted">
        {{ prefix }}
      </span>

      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <span v-if="suffix" class="absolute right-4 top-1/2 -translate-y-1/2 text-theme-text-muted">
        {{ suffix }}
      </span>
    </div>

    <p v-if="error" class="mt-1 text-caption text-theme-error">
      {{ error }}
    </p>
  </div>
</template>
