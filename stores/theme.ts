import { defineStore } from 'pinia'
import { useApiClient } from '~/utils/api'
import { useAuthStore } from '~/stores/auth'
import type { ThemeId } from '~/types/preferences'

export type { ThemeId }

interface ThemeState {
  current: ThemeId
  isLoading: boolean
  isSynced: boolean
}

const STORAGE_KEY = 'ui-theme'
const DEFAULT_THEME: ThemeId = 'default'

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    current: DEFAULT_THEME,
    isLoading: false,
    isSynced: false,
  }),

  getters: {
    currentTheme: (state): ThemeId => state.current,
    isDefaultTheme: (state): boolean => state.current === 'default',
    isCodeTheme: (state): boolean => state.current === 'code',
    isOceanTheme: (state): boolean => state.current === 'ocean',
  },

  actions: {
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
      const authStore = useAuthStore()
      return authStore.isAuthenticated
    },

    /**
     * Set theme - updates UI immediately and persists to API/localStorage
     */
    async setTheme(theme: ThemeId): Promise<void> {
      if (this.current === theme) return

      // Optimistically update UI
      this.current = theme
      this.applyTheme(theme)

      // Persist based on auth state
      if (this.isAuthenticated()) {
        await this.saveToApi(theme)
      } else {
        this.persistTheme(theme)
      }
    },

    /**
     * Apply theme to DOM
     */
    applyTheme(theme: ThemeId): void {
      if (typeof document === 'undefined') return

      document.documentElement.setAttribute('data-theme', theme)
    },

    /**
     * Persist theme to localStorage (fallback for unauthenticated users)
     */
    persistTheme(theme: ThemeId): void {
      if (typeof localStorage === 'undefined') return

      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        // localStorage may be unavailable in some contexts
      }
    },

    /**
     * Save theme to API
     */
    async saveToApi(theme: ThemeId): Promise<void> {
      try {
        const api = useApiClient()
        await api.updateUserPreferences({ ui_theme: theme })
        this.isSynced = true
        // Keep local cache aligned to avoid default-theme flash on next app entry.
        this.persistTheme(theme)
      } catch {
        // Silently fail - theme is already applied to UI
        // Also persist to localStorage as backup
        this.persistTheme(theme)
      }
    },

    /**
     * Fetch theme from API
     */
    async fetchFromApi(): Promise<ThemeId | null> {
      try {
        this.isLoading = true
        const api = useApiClient()
        const response = await api.getUserPreferences()

        if (response.success && response.data?.ui_theme) {
          const theme = response.data.ui_theme
          if (this.isValidTheme(theme)) {
            this.isSynced = true
            return theme
          }
        }
        return null
      } catch {
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Initialize theme from API (if authenticated) or localStorage
     */
    async initializeTheme(): Promise<void> {
      // Try API first if authenticated
      if (this.isAuthenticated()) {
        const apiTheme = await this.fetchFromApi()
        if (apiTheme) {
          this.current = apiTheme
          this.applyTheme(apiTheme)
          // Also update localStorage for faster initial load next time
          this.persistTheme(apiTheme)
          return
        }
      }

      // Fallback to localStorage
      this.initializeFromLocalStorage()
    },

    /**
     * Initialize theme from localStorage only (for immediate load)
     */
    initializeFromLocalStorage(): void {
      if (typeof localStorage === 'undefined') {
        this.applyTheme(DEFAULT_THEME)
        return
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const theme = this.isValidTheme(stored) ? stored : DEFAULT_THEME
        this.current = theme
        this.applyTheme(theme)
      } catch {
        this.applyTheme(DEFAULT_THEME)
      }
    },

    /**
     * Sync theme with API after login
     */
    async syncAfterLogin(): Promise<void> {
      const apiTheme = await this.fetchFromApi()
      if (apiTheme) {
        this.current = apiTheme
        this.applyTheme(apiTheme)
        this.persistTheme(apiTheme)
      } else {
        // If no API preference, save current theme to API
        await this.saveToApi(this.current)
      }
    },

    /**
     * Validate theme ID
     */
    isValidTheme(theme: string | null): theme is ThemeId {
      return theme === 'default' || theme === 'code' || theme === 'ocean'
    },
  },
})
