<script setup lang="ts">
import type { ConfidenceLevel, Intent } from '~/types'
import type { IconKey } from '~/types/icon'
import { CONFIDENCE_MAP, INTENT_MAP } from '~/utils/constants'

type TagVariant = 'intent' | 'confidence' | 'category' | 'custom'

interface Props {
  variant?: TagVariant
  intentValue?: Intent
  confidenceValue?: ConfidenceLevel
  label?: string
  color?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'custom',
  label: '',
  color: 'text-theme-text-secondary',
  bgColor: 'bg-theme-surface-secondary',
})

const intentConfig = computed(() => {
  if (props.variant === 'intent' && props.intentValue) {
    return INTENT_MAP[props.intentValue]
  }
  return null
})

const confidenceConfig = computed(() => {
  if (props.variant === 'confidence' && props.confidenceValue) {
    return CONFIDENCE_MAP[props.confidenceValue]
  }
  return null
})

const tagClasses = computed(() => {
  if (props.variant === 'intent' && intentConfig.value) {
    return [
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium',
      `bg-${intentConfig.value.lightColor}`,
      `text-${intentConfig.value.color}`,
    ]
  }

  if (props.variant === 'confidence' && confidenceConfig.value) {
    return [
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium',
      confidenceConfig.value.bgColor,
      confidenceConfig.value.color,
    ]
  }

  return [
    'inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium',
    props.bgColor,
    props.color,
  ]
})

const displayLabel = computed(() => {
  if (intentConfig.value) {
    return intentConfig.value.label
  }
  if (confidenceConfig.value) {
    return confidenceConfig.value.label
  }
  return props.label
})

const displayIcon = computed<IconKey | null>(() => {
  if (intentConfig.value) {
    return intentConfig.value.icon
  }
  if (confidenceConfig.value) {
    return confidenceConfig.value.icon
  }
  return null
})
</script>

<template>
  <span :class="tagClasses">
    <AppIcon v-if="displayIcon" :name="displayIcon" class="h-3.5 w-3.5" />
    <span>{{ displayLabel }}</span>
  </span>
</template>
