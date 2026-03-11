<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  error: '',
  hint: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const inputType = computed(() => (showPassword.value ? 'text' : 'password'))

function toggleVisibility() {
  showPassword.value = !showPassword.value
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-body-sm font-medium text-theme-text-secondary">
      {{ label }}
      <span v-if="required" class="text-theme-primary">*</span>
    </label>

    <div class="relative">
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'h-12 w-full rounded-lg border px-4 pr-12 text-body-md text-theme-text placeholder:text-theme-text-placeholder',
          'transition-all duration-fast',
          'focus:ring-theme-primary/30 focus:outline-none focus:ring-2',
          error
            ? 'border-theme-error bg-theme-error-light focus:border-theme-error'
            : 'border-theme-border bg-theme-surface hover:border-theme-border-hover focus:border-theme-primary',
          disabled && 'cursor-not-allowed bg-theme-surface-secondary opacity-60',
        ]"
        @input="handleInput"
      />

      <button
        type="button"
        class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-theme-text-placeholder transition-colors hover:text-theme-text-secondary"
        :disabled="disabled"
        @click="toggleVisibility"
      >
        <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
        <EyeIcon v-else class="h-5 w-5" />
      </button>
    </div>

    <p v-if="error" class="flex items-center gap-1 text-caption text-theme-error">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-caption text-theme-text-muted">
      {{ hint }}
    </p>
  </div>
</template>
