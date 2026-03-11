<script setup lang="ts">
import { CheckIcon, MinusIcon } from '@heroicons/vue/24/solid'

interface Props {
  modelValue: boolean
  indeterminate?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  indeterminate: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function handleClick() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="indeterminate ? 'mixed' : modelValue"
    :disabled="disabled"
    class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
    :class="[
      disabled
        ? 'cursor-not-allowed border-theme-border bg-theme-surface-secondary opacity-50'
        : modelValue || indeterminate
          ? 'border-theme-primary bg-theme-primary hover:border-theme-primary-hover hover:bg-theme-primary-hover'
          : 'border-theme-border bg-theme-surface hover:border-theme-primary',
    ]"
    @click="handleClick"
  >
    <CheckIcon v-if="modelValue && !indeterminate" class="h-3.5 w-3.5 text-white" />
    <MinusIcon v-else-if="indeterminate" class="h-3.5 w-3.5 text-white" />
  </button>
</template>
