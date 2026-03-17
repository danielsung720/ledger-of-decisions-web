import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initialize()
  }

  // If already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
