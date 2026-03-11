<script setup lang="ts">
import type { ThemeId } from '~/stores/theme'
import { getThemeOption } from '~/utils/theme-config'

interface Props {
  themeId: ThemeId
}

const props = defineProps<Props>()

const themeOption = computed(() => getThemeOption(props.themeId))
const colors = computed(() => themeOption.value?.previewColors)
</script>

<template>
  <div
    v-if="colors"
    class="h-[120px] w-full overflow-hidden rounded-t-lg"
    :style="{ backgroundColor: colors.bg }"
    :data-testid="`theme-preview-${themeId}`"
  >
    <div class="flex h-full flex-col gap-2 p-3">
      <!-- Mini card preview -->
      <div
        class="flex-1 rounded p-2"
        :style="{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        }"
      >
        <div class="mb-1.5 flex items-center justify-between">
          <div class="truncate text-[10px] font-medium" :style="{ color: colors.text }">今日</div>
          <div class="text-[10px]" :style="{ color: colors.textMuted }">$1,280</div>
        </div>
        <div class="flex gap-1.5">
          <!-- Mini tags -->
          <div
            class="rounded px-1.5 py-0.5 text-[8px]"
            :style="{
              backgroundColor: colors.primaryLight,
              color: colors.primary,
            }"
          >
            標籤
          </div>
          <div
            class="rounded px-1.5 py-0.5 text-[8px]"
            :style="{
              backgroundColor: colors.primaryLight,
              color: colors.primary,
            }"
          >
            標籤
          </div>
        </div>
      </div>

      <!-- Mini button -->
      <div class="flex justify-end">
        <div
          class="rounded px-2 py-1 text-[9px] font-medium text-white"
          :style="{ backgroundColor: colors.primary }"
        >
          按鈕
        </div>
      </div>
    </div>
  </div>
</template>
