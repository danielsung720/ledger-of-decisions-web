<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/vue/20/solid'
import type { IconKey } from '~/types/icon'

interface Option {
  value: string | number | null
  label: string
  icon?: IconKey
}

interface Props {
  modelValue: string | number | null
  options: Option[]
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '請選擇',
  label: '',
  required: false,
  disabled: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const selectedOption = computed(() =>
  props.options.find((opt) => opt.value === selectedValue.value)
)

const buttonClasses = computed(() => [
  'relative w-full h-12 pl-4 pr-10 bg-theme-surface-secondary border rounded-md text-left transition-all duration-fast',
  'hover:border-theme-border-hover',
  'focus:border-theme-primary focus:ring-0 focus:outline-none focus:shadow-focus',
  'disabled:bg-theme-surface-secondary disabled:opacity-70 disabled:cursor-not-allowed',
  props.error ? 'border-theme-error' : 'border-theme-border',
])
</script>

<template>
  <div class="w-full">
    <label v-if="label" :class="['label', { 'label-required': required }]">
      {{ label }}
    </label>

    <Listbox v-model="selectedValue" :disabled="disabled">
      <div class="relative">
        <ListboxButton :class="buttonClasses">
          <span v-if="selectedOption" class="flex items-center gap-2">
            <AppIcon
              v-if="selectedOption.icon"
              :name="selectedOption.icon"
              class="h-4 w-4 text-theme-text-secondary"
            />
            <span class="text-theme-text">{{ selectedOption.label }}</span>
          </span>
          <span v-else class="text-theme-text-placeholder">{{ placeholder }}</span>

          <span class="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon class="h-5 w-5 text-theme-text-muted" aria-hidden="true" />
          </span>
        </ListboxButton>

        <Transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-theme-border bg-theme-surface py-1 shadow-lg focus:outline-none"
          >
            <ListboxOption
              v-for="option in options"
              :key="String(option.value)"
              v-slot="{ active, selected }"
              :value="option.value"
              as="template"
            >
              <li
                :class="[
                  'relative cursor-pointer select-none py-3 pl-4 pr-10',
                  active ? 'bg-theme-surface-secondary' : 'bg-theme-surface',
                  selected ? 'bg-theme-primary-light font-medium' : '',
                ]"
              >
                <span class="flex items-center gap-2">
                  <AppIcon
                    v-if="option.icon"
                    :name="option.icon"
                    class="h-4 w-4 text-theme-text-secondary"
                  />
                  <span :class="[selected ? 'text-theme-text' : 'text-theme-text-secondary']">
                    {{ option.label }}
                  </span>
                </span>

                <span
                  v-if="selected"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-primary"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>

    <p v-if="error" class="mt-1 text-caption text-theme-error">
      {{ error }}
    </p>
  </div>
</template>
