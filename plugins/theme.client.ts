import { useThemeStore } from '~/stores/theme'

export default defineNuxtPlugin(() => {
  // Add preload class to prevent transition flash
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('preload')
  }

  const themeStore = useThemeStore()

  // Keep cookie in sync with store so SSR always renders the correct data-theme on next request
  const themeCookie = useCookie<string>('ui-theme', {
    maxAge: 60 * 60 * 24 * 365,
  })
  watch(
    () => themeStore.current,
    (newTheme) => {
      themeCookie.value = newTheme
    }
  )

  // Step 1: Immediately apply theme from localStorage (prevents flash)
  themeStore.initializeFromLocalStorage()

  // Step 2: Async sync with API if authenticated
  // This runs after initial render, so won't cause flash
  if (themeStore.isAuthenticated()) {
    themeStore.initializeTheme().catch(() => {
      // Silently fail - localStorage theme is already applied
    })
  }

  // Remove preload class after DOM is ready
  if (typeof window !== 'undefined') {
    // Use requestAnimationFrame to ensure styles are applied before removing preload
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.classList.remove('preload')
      })
    })
  }
})
