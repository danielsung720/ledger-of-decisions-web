<script setup lang="ts">
import {
  UserIcon,
  ChevronDownIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import { useAuth } from '~/composables/useAuth'

const { userName, userEmail, logout } = useAuth()

const isOpen = ref(false)
const menuRef = ref<HTMLDivElement | null>(null)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

async function handleLogout() {
  closeMenu()
  await logout()
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

const displayName = computed(() => {
  const name = userName.value
  if (name.length > 10) {
    return name.slice(0, 10) + '...'
  }
  return name
})
</script>

<template>
  <div ref="menuRef" class="relative">
    <!-- Trigger Button -->
    <button
      type="button"
      data-testid="user-menu-button"
      class="flex h-10 items-center gap-2 rounded-full border border-theme-border bg-transparent px-4 text-body-md font-medium text-theme-text-secondary transition-colors hover:border-theme-border-hover hover:bg-theme-surface-secondary"
      @click="toggleMenu"
    >
      <UserIcon class="h-4 w-4" />
      <span>{{ displayName }}</span>
      <ChevronDownIcon
        :class="['h-4 w-4 transition-transform duration-fast', isOpen && 'rotate-180']"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition-all duration-fast ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-fast ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="z-dropdown absolute right-0 top-full mt-2 w-[200px] rounded-xl border border-theme-border bg-theme-surface py-2 shadow-lg"
      >
        <!-- Email Display -->
        <div class="border-b border-theme-border px-4 py-3">
          <p class="truncate text-caption text-theme-text-muted">
            {{ userEmail }}
          </p>
        </div>

        <!-- Menu Items -->
        <div class="py-1">
          <NuxtLink
            to="/settings"
            data-testid="user-menu-settings"
            class="flex items-center gap-3 px-4 py-2.5 text-body-md text-theme-text-secondary transition-colors hover:bg-theme-surface-secondary"
            @click="closeMenu"
          >
            <Cog6ToothIcon class="h-4 w-4" />
            設置
          </NuxtLink>
          <NuxtLink
            to="/settings/password"
            class="flex items-center gap-3 px-4 py-2.5 text-body-md text-theme-text-secondary transition-colors hover:bg-theme-surface-secondary"
            @click="closeMenu"
          >
            <KeyIcon class="h-4 w-4" />
            修改密碼
          </NuxtLink>
        </div>

        <div class="border-t border-theme-border py-1">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-body-md text-theme-error transition-colors hover:bg-theme-error-light"
            @click="handleLogout"
          >
            <ArrowRightOnRectangleIcon class="h-4 w-4" />
            登出
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
