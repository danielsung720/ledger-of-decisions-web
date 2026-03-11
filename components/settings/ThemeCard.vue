<script setup lang="ts">
import type { ThemeId } from '~/stores/theme'

interface Props {
  themeId: ThemeId
  themeName: string
  themeDescription: string
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [themeId: ThemeId]
}>()

function handleClick() {
  emit('select', props.themeId)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('select', props.themeId)
  }
}
</script>

<template>
  <div
    role="radio"
    :aria-checked="selected"
    :tabindex="0"
    class="theme-card cursor-pointer overflow-hidden rounded-xl border bg-theme-surface transition-all duration-200"
    :class="[
      selected
        ? 'border-2 border-theme-primary bg-theme-primary-light shadow-theme-md'
        : 'border border-theme-border shadow-theme-sm hover:border-theme-primary hover:shadow-theme-md',
    ]"
    :data-testid="`theme-card-${themeId}`"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Theme Preview Area -->
    <ThemePreview :theme-id="themeId" />

    <!-- Theme Info -->
    <div class="flex items-start gap-3 p-4">
      <!-- Radio indicator -->
      <div class="mt-0.5 flex-shrink-0">
        <div
          class="flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors"
          :class="[
            selected
              ? 'border-theme-primary bg-theme-primary'
              : 'border-theme-border bg-transparent',
          ]"
        >
          <div v-if="selected" class="h-2 w-2 rounded-full bg-white" />
        </div>
      </div>

      <!-- Text content -->
      <div class="min-w-0 flex-1">
        <h3 class="text-body-md font-medium text-theme-text">
          {{ themeName }}
        </h3>
        <p class="mt-0.5 text-body-sm text-theme-text-muted">
          {{ themeDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
