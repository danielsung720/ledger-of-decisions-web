<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
} from '@heroicons/vue/24/outline'
import type { Insight } from '~/types'

interface Props {
  insights: Insight[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '洞察與建議',
})

const iconMap = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  alert: LightBulbIcon,
}

const colorMap = {
  success: {
    icon: 'text-theme-success',
    bg: 'bg-theme-success-light',
    border: 'border-theme-success/20',
  },
  warning: {
    icon: 'text-theme-warning',
    bg: 'bg-theme-warning-light',
    border: 'border-theme-warning/20',
  },
  info: {
    icon: 'text-theme-info',
    bg: 'bg-theme-info-light',
    border: 'border-theme-info/20',
  },
  alert: {
    icon: 'text-theme-error',
    bg: 'bg-theme-error-light',
    border: 'border-theme-error/20',
  },
}
</script>

<template>
  <div class="card">
    <h3 class="mb-6 text-heading-sm font-semibold text-theme-text">
      {{ title }}
    </h3>

    <div v-if="insights.length === 0" class="py-8 text-center text-theme-text-muted">暫無洞察</div>

    <div v-else class="space-y-4">
      <div
        v-for="insight in insights"
        :key="insight.id"
        :class="[
          'flex items-start gap-3 rounded-lg border p-4',
          colorMap[insight.type].bg,
          colorMap[insight.type].border,
        ]"
      >
        <component
          :is="iconMap[insight.type]"
          :class="['mt-0.5 h-5 w-5 flex-shrink-0', colorMap[insight.type].icon]"
        />

        <div class="min-w-0 flex-1">
          <p class="text-body-sm font-medium text-theme-text">
            {{ insight.title }}
          </p>
          <p class="mt-1 text-body-sm text-theme-text-secondary">
            {{ insight.description }}
          </p>
        </div>

        <span
          v-if="insight.value"
          class="font-number flex-shrink-0 text-body-sm font-semibold text-theme-text"
        >
          {{ insight.value }}
        </span>
      </div>
    </div>
  </div>
</template>
