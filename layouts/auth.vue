<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

const uiStore = useUiStore()
const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.initialized) {
    await authStore.initialize()
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-theme-bg p-6">
    <!-- Auth Card -->
    <div
      class="animate-fade-in-up w-full max-w-[420px] rounded-3xl border border-theme-border bg-theme-surface p-10 shadow-xl md:p-12"
    >
      <slot />
    </div>

    <!-- Toast -->
    <AppToast
      v-if="uiStore.toasts.length > 0"
      :show="true"
      :type="uiStore.toasts[0].type"
      :title="uiStore.toasts[0].title"
      :message="uiStore.toasts[0].message"
      :duration="0"
      @close="uiStore.removeToast(uiStore.toasts[0].id)"
    />
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 400ms ease-out;
}
</style>
