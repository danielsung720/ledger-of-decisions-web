<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { IconKey } from '~/types/icon'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { isAuthenticated } = useAuth()

const navigation: { name: string; href: string; icon: IconKey; testId: string }[] = [
  { name: '首頁', href: '/', icon: 'home', testId: 'nav-link-home' },
  { name: '消費記錄', href: '/records', icon: 'clipboard-list', testId: 'nav-link-records' },
  { name: '固定支出', href: '/recurring', icon: 'repeat', testId: 'nav-link-recurring' },
  { name: '現金流估算', href: '/cashflow', icon: 'cash', testId: 'nav-link-cashflow' },
  { name: '回顧', href: '/review', icon: 'chart-bar', testId: 'nav-link-review' },
]

const isActive = (href: string) => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}

const emit = defineEmits<{
  openExpenseModal: []
}>()
</script>

<template>
  <header
    class="bg-theme-surface/80 sticky top-0 z-header border-b border-theme-border backdrop-blur-md"
  >
    <div class="mx-auto max-w-content px-6 lg:px-16">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <AppIcon name="notebook" class="h-6 w-6 text-theme-text-secondary" />
          <span class="text-heading-sm font-semibold text-theme-text"> Ledger of Decisions </span>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="item in navigation"
            :key="item.href"
            :to="item.href"
            :data-testid="item.testId"
            :class="[
              'flex items-center gap-2 rounded-lg px-4 py-2 text-body-sm font-medium transition-all duration-fast',
              isActive(item.href)
                ? 'bg-theme-primary-light text-theme-primary'
                : 'text-theme-text-secondary hover:bg-theme-surface-secondary hover:text-theme-text',
            ]"
          >
            <AppIcon :name="item.icon" class="h-4 w-4" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center gap-3">
          <!-- CTA Button (only when authenticated) -->
          <AppButton
            v-if="isAuthenticated"
            variant="primary"
            size="sm"
            class="hidden sm:flex"
            @click="emit('openExpenseModal')"
          >
            <PlusIcon class="mr-1 h-5 w-5" />
            記一筆
          </AppButton>

          <!-- User Menu (when authenticated) -->
          <UserMenu v-if="isAuthenticated" class="hidden md:block" />

          <!-- Login/Register buttons (when not authenticated) -->
          <template v-else>
            <NuxtLink to="/login">
              <AppButton variant="secondary" size="sm" class="hidden sm:flex"> 登入 </AppButton>
            </NuxtLink>
            <NuxtLink to="/register">
              <AppButton variant="primary" size="sm" class="hidden sm:flex"> 註冊 </AppButton>
            </NuxtLink>
          </template>

          <!-- Mobile menu button -->
          <button
            v-if="isAuthenticated"
            type="button"
            data-testid="mobile-add-expense-button"
            class="btn-icon md:hidden"
            @click="emit('openExpenseModal')"
          >
            <PlusIcon class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <nav class="border-t border-theme-border bg-theme-surface md:hidden">
      <div class="flex">
        <NuxtLink
          v-for="item in navigation"
          :key="item.href"
          :to="item.href"
          :data-testid="`mobile-${item.testId}`"
          :class="[
            'flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-3 text-caption font-medium transition-all duration-fast',
            isActive(item.href)
              ? 'bg-theme-primary-light text-theme-primary'
              : 'text-theme-text-secondary',
          ]"
        >
          <AppIcon :name="item.icon" class="h-5 w-5" />
          <span class="w-full truncate text-center">{{ item.name }}</span>
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
