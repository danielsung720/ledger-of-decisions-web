<script setup lang="ts">
import type { IconKey } from '~/types/icon'

interface Props {
  title: string
  description?: string
  icon?: IconKey
  actionLabel?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  icon: 'inbox',
  actionLabel: '',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-12 text-center">
    <div class="mb-4 text-theme-text-muted">
      <AppIcon :name="icon" class="h-12 w-12" />
    </div>

    <h3 class="mb-2 text-heading-sm font-semibold text-theme-text">
      {{ title }}
    </h3>

    <p v-if="description" class="max-w-sm text-body-sm text-theme-text-secondary">
      {{ description }}
    </p>

    <AppButton v-if="actionLabel" variant="primary" class="mt-6" @click="emit('action')">
      {{ actionLabel }}
    </AppButton>

    <slot />
  </div>
</template>
