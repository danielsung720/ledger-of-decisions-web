<script setup lang="ts">
import { FunnelIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { Category, Intent, DateRangePreset } from '~/types'
import { CATEGORY_OPTIONS, INTENT_OPTIONS, DATE_RANGE_PRESETS } from '~/utils/constants'

interface Filters {
  preset: DateRangePreset
  categories: Category[]
  intents: Intent[]
  startDate?: string
  endDate?: string
}

interface Props {
  modelValue: Filters
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Filters]
  search: []
}>()

const showFilters = ref(false)

const localFilters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.categories.length > 0 ||
    localFilters.value.intents.length > 0 ||
    localFilters.value.preset !== 'this_month'
  )
})

function toggleCategory(category: Category) {
  const current = [...localFilters.value.categories]
  const index = current.indexOf(category)

  if (index === -1) {
    current.push(category)
  } else {
    current.splice(index, 1)
  }

  emit('update:modelValue', { ...localFilters.value, categories: current })
}

function toggleIntent(intent: Intent) {
  const current = [...localFilters.value.intents]
  const index = current.indexOf(intent)

  if (index === -1) {
    current.push(intent)
  } else {
    current.splice(index, 1)
  }

  emit('update:modelValue', { ...localFilters.value, intents: current })
}

function setPreset(preset: DateRangePreset) {
  emit('update:modelValue', { ...localFilters.value, preset })
}

function setStartDate(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', { ...localFilters.value, startDate: value })
}

function setEndDate(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', { ...localFilters.value, endDate: value })
}

function clearFilters() {
  emit('update:modelValue', {
    preset: 'this_month',
    categories: [],
    intents: [],
    startDate: undefined,
    endDate: undefined,
  })
}

function handleSearch() {
  emit('search')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Main Bar -->
    <div class="flex items-center gap-4">
      <!-- Date Range Presets -->
      <div class="flex gap-2">
        <button
          v-for="preset in DATE_RANGE_PRESETS"
          :key="preset.value"
          type="button"
          :class="[
            'rounded-full px-4 py-2 text-body-sm font-medium transition-all duration-fast',
            localFilters.preset === preset.value
              ? 'bg-theme-primary text-white'
              : 'bg-theme-surface-secondary text-theme-text-secondary hover:bg-theme-border',
          ]"
          @click="setPreset(preset.value)"
        >
          {{ preset.label }}
        </button>
      </div>

      <!-- Custom Date Range -->
      <div v-if="localFilters.preset === 'custom'" class="flex items-center gap-2">
        <input
          type="date"
          :value="localFilters.startDate ?? ''"
          class="rounded-lg border border-theme-border bg-theme-surface px-3 py-1.5 text-body-sm text-theme-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-theme-primary"
          @input="setStartDate"
        />
        <span class="text-theme-text-muted">至</span>
        <input
          type="date"
          :value="localFilters.endDate ?? ''"
          class="rounded-lg border border-theme-border bg-theme-surface px-3 py-1.5 text-body-sm text-theme-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-theme-primary"
          @input="setEndDate"
        />
      </div>

      <div class="flex-1" />

      <!-- Filter Toggle -->
      <button
        type="button"
        :class="[
          'btn-secondary flex items-center gap-2',
          hasActiveFilters ? 'border-theme-primary text-theme-primary' : '',
        ]"
        @click="showFilters = !showFilters"
      >
        <FunnelIcon class="h-5 w-5" />
        <span>篩選</span>
        <span
          v-if="hasActiveFilters"
          class="flex h-5 w-5 items-center justify-center rounded-full bg-theme-primary text-caption text-white"
        >
          {{ localFilters.categories.length + localFilters.intents.length }}
        </span>
      </button>
    </div>

    <!-- Expanded Filters -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showFilters"
        class="space-y-4 rounded-lg border border-theme-border bg-theme-bg p-4"
      >
        <!-- Categories -->
        <div>
          <label class="mb-2 block text-body-sm font-medium text-theme-text-secondary">
            消費分類
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in CATEGORY_OPTIONS"
              :key="category.value"
              type="button"
              :class="[
                'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-body-sm transition-all duration-fast',
                localFilters.categories.includes(category.value)
                  ? 'bg-theme-primary text-white'
                  : 'border border-theme-border bg-theme-surface text-theme-text-secondary hover:border-theme-border-hover',
              ]"
              @click="toggleCategory(category.value)"
            >
              <AppIcon :name="category.icon" class="h-4 w-4" />
              <span>{{ category.label }}</span>
            </button>
          </div>
        </div>

        <!-- Intents -->
        <div>
          <label class="mb-2 block text-body-sm font-medium text-theme-text-secondary">
            決策意圖
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="intent in INTENT_OPTIONS"
              :key="intent.value"
              type="button"
              :class="[
                'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-body-sm transition-all duration-fast',
                localFilters.intents.includes(intent.value)
                  ? 'bg-theme-primary text-white'
                  : 'border border-theme-border bg-theme-surface text-theme-text-secondary hover:border-theme-border-hover',
              ]"
              @click="toggleIntent(intent.value)"
            >
              <AppIcon :name="intent.icon" class="h-4 w-4" />
              <span>{{ intent.label }}</span>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between border-t border-theme-border pt-2">
          <button
            v-if="hasActiveFilters"
            type="button"
            class="btn-text flex items-center gap-1 text-theme-text-secondary"
            @click="clearFilters"
          >
            <XMarkIcon class="h-4 w-4" />
            清除篩選
          </button>
          <span v-else />

          <AppButton variant="primary" size="sm" @click="handleSearch"> 套用篩選 </AppButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
