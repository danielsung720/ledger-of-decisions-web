import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initialize()
  }

  // Public pages that don't require authentication
  const publicPages = [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ]

  const isPublicPage = publicPages.some((page) => to.path.startsWith(page))

  // If not authenticated and trying to access protected page
  if (!authStore.isAuthenticated && !isPublicPage) {
    return navigateTo('/login')
  }

  // If authenticated and trying to access auth pages (except verify-email with pending)
  if (authStore.isAuthenticated && isPublicPage && to.path !== '/verify-email') {
    return navigateTo('/')
  }
})
