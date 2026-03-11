<script setup lang="ts">
import { useThemeStore, type ThemeId } from '~/stores/theme'
import { THEME_OPTIONS } from '~/utils/theme-config'
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const themeStore = useThemeStore()
const { current: currentTheme } = storeToRefs(themeStore)

onBeforeMount(() => {
  themeStore.initializeFromLocalStorage()
})

async function handleThemeSelect(themeId: ThemeId) {
  await themeStore.setTheme(themeId)
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-16" data-testid="settings-page">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-heading-lg font-bold text-theme-text">設置</h1>
    </div>

    <!-- Theme Section -->
    <section
      class="rounded-xl border border-theme-border bg-theme-surface p-6 shadow-theme-sm"
      data-testid="theme-section"
    >
      <div class="mb-6">
        <h2 class="mb-2 text-heading-md font-semibold text-theme-text">外觀主題</h2>
        <p class="text-body-md text-theme-text-muted">選擇你喜歡的視覺風格</p>
      </div>

      <!-- Theme Cards Grid -->
      <ClientOnly>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ThemeCard
            v-for="theme in THEME_OPTIONS"
            :key="theme.id"
            :theme-id="theme.id"
            :theme-name="theme.name"
            :theme-description="theme.description"
            :selected="currentTheme === theme.id"
            @select="handleThemeSelect"
          />
        </div>
        <template #fallback>
          <div class="grid min-h-[200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" />
        </template>
      </ClientOnly>
    </section>

    <!-- Other Settings Section (Placeholder) -->
    <section
      class="mt-8 rounded-xl border border-theme-border bg-theme-surface p-6 shadow-theme-sm"
    >
      <div class="mb-4">
        <h2 class="mb-2 text-heading-md font-semibold text-theme-text">其他設置</h2>
        <p class="text-body-md text-theme-text-muted">更多設置將在未來更新中提供</p>
      </div>
    </section>

    <!-- Back Link -->
    <div class="mt-8 text-center">
      <NuxtLink
        to="/"
        class="text-body-md text-theme-text-muted transition-colors hover:text-theme-primary"
      >
        返回首頁
      </NuxtLink>
    </div>
  </div>
</template>
