<script setup lang="ts">
import type { DateRangePreset } from '~/types'
import { DATE_RANGE_PRESETS } from '~/utils/constants'

interface Props {
  preset: DateRangePreset
  startDate?: string
  endDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  startDate: '',
  endDate: '',
})

const emit = defineEmits<{
  'update:preset': [value: DateRangePreset]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  change: []
}>()

const showCustomRange = computed(() => props.preset === 'custom')
const localStartDate = ref(props.startDate)
const localEndDate = ref(props.endDate)

watch(
  () => props.startDate,
  (value) => {
    localStartDate.value = value
  }
)

watch(
  () => props.endDate,
  (value) => {
    localEndDate.value = value
  }
)

function selectPreset(preset: DateRangePreset) {
  emit('update:preset', preset)
  if (preset !== 'custom') {
    emit('change')
  }
}

function handleCustomDateInput(field: 'start' | 'end', value: string) {
  if (field === 'start') {
    localStartDate.value = value
    emit('update:startDate', value)
  } else {
    localEndDate.value = value
    emit('update:endDate', value)
  }

  if (localStartDate.value && localEndDate.value) {
    emit('change')
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Preset Buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in DATE_RANGE_PRESETS"
        :key="option.value"
        type="button"
        :data-testid="`review-preset-${option.value}`"
        :class="[
          'rounded-full px-4 py-2 text-body-sm font-medium transition-all duration-fast',
          preset === option.value
            ? 'bg-theme-primary text-white'
            : 'bg-theme-surface-secondary text-theme-text-secondary hover:bg-theme-border',
        ]"
        @click="selectPreset(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Custom Date Range -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showCustomRange" class="flex items-center gap-4">
        <div class="flex-1">
          <label class="mb-1 block text-body-sm text-theme-text-secondary">開始日期</label>
          <input
            type="date"
            :value="startDate"
            class="input"
            @input="handleCustomDateInput('start', ($event.target as HTMLInputElement).value)"
            @change="handleCustomDateInput('start', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="flex-1">
          <label class="mb-1 block text-body-sm text-theme-text-secondary">結束日期</label>
          <input
            type="date"
            :value="endDate"
            class="input"
            @input="handleCustomDateInput('end', ($event.target as HTMLInputElement).value)"
            @change="handleCustomDateInput('end', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
