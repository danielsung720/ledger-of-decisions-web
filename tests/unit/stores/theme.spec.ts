import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '~/stores/theme'

// Mock the API client
const mockGetUserPreferences = vi.fn()
const mockUpdateUserPreferences = vi.fn()
const authState = {
  isAuthenticated: false,
}

vi.mock('~/utils/api', () => ({
  useApiClient: () => ({
    getUserPreferences: mockGetUserPreferences,
    updateUserPreferences: mockUpdateUserPreferences,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => authState,
}))

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(vi.fn())
    mockGetUserPreferences.mockReset()
    mockUpdateUserPreferences.mockReset()
    authState.isAuthenticated = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('initial state', () => {
    it('has default theme as initial state', () => {
      const store = useThemeStore()

      expect(store.current).toBe('default')
      expect(store.currentTheme).toBe('default')
      expect(store.isLoading).toBe(false)
      expect(store.isSynced).toBe(false)
    })
  })

  describe('getters', () => {
    it('isDefaultTheme returns true for default theme', () => {
      const store = useThemeStore()

      expect(store.isDefaultTheme).toBe(true)
      expect(store.isCodeTheme).toBe(false)
      expect(store.isOceanTheme).toBe(false)
    })

    it('isCodeTheme returns true for code theme', async () => {
      const store = useThemeStore()
      await store.setTheme('code')

      expect(store.isDefaultTheme).toBe(false)
      expect(store.isCodeTheme).toBe(true)
      expect(store.isOceanTheme).toBe(false)
    })

    it('isOceanTheme returns true for ocean theme', async () => {
      const store = useThemeStore()
      await store.setTheme('ocean')

      expect(store.isDefaultTheme).toBe(false)
      expect(store.isCodeTheme).toBe(false)
      expect(store.isOceanTheme).toBe(true)
    })
  })

  describe('setTheme (unauthenticated)', () => {
    it('updates current theme state', async () => {
      const store = useThemeStore()

      await store.setTheme('code')

      expect(store.current).toBe('code')
      expect(store.currentTheme).toBe('code')
    })

    it('persists theme to localStorage when not authenticated', async () => {
      const store = useThemeStore()

      await store.setTheme('ocean')

      expect(localStorage.getItem('ui-theme')).toBe('ocean')
    })

    it('applies theme to DOM', async () => {
      const store = useThemeStore()

      await store.setTheme('code')

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'code')
    })

    it('does nothing if same theme is already set', async () => {
      const store = useThemeStore()
      await store.setTheme('code')

      vi.clearAllMocks()
      await store.setTheme('code')

      expect(document.documentElement.setAttribute).not.toHaveBeenCalled()
    })
  })

  describe('setTheme (authenticated)', () => {
    beforeEach(() => {
      authState.isAuthenticated = true
    })

    it('calls API to save theme when authenticated', async () => {
      mockUpdateUserPreferences.mockResolvedValue({ success: true })
      const store = useThemeStore()

      await store.setTheme('code')

      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ ui_theme: 'code' })
      expect(store.isSynced).toBe(true)
      expect(localStorage.getItem('ui-theme')).toBe('code')
    })

    it('falls back to localStorage on API error', async () => {
      mockUpdateUserPreferences.mockRejectedValue(new Error('API error'))
      const store = useThemeStore()

      await store.setTheme('ocean')

      expect(localStorage.getItem('ui-theme')).toBe('ocean')
      expect(store.current).toBe('ocean') // UI should still update
    })
  })

  describe('initializeFromLocalStorage', () => {
    it('reads theme from localStorage', () => {
      localStorage.setItem('ui-theme', 'ocean')
      const store = useThemeStore()

      store.initializeFromLocalStorage()

      expect(store.current).toBe('ocean')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'ocean')
    })

    it('uses default theme when localStorage is empty', () => {
      const store = useThemeStore()

      store.initializeFromLocalStorage()

      expect(store.current).toBe('default')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'default')
    })

    it('uses default theme when localStorage has invalid value', () => {
      localStorage.setItem('ui-theme', 'invalid-theme')
      const store = useThemeStore()

      store.initializeFromLocalStorage()

      expect(store.current).toBe('default')
    })
  })

  describe('initializeTheme (with API)', () => {
    beforeEach(() => {
      authState.isAuthenticated = true
    })

    it('fetches theme from API when authenticated', async () => {
      mockGetUserPreferences.mockResolvedValue({
        success: true,
        data: { ui_theme: 'code' },
      })
      const store = useThemeStore()

      await store.initializeTheme()

      expect(mockGetUserPreferences).toHaveBeenCalled()
      expect(store.current).toBe('code')
      expect(store.isSynced).toBe(true)
    })

    it('falls back to localStorage on API error', async () => {
      mockGetUserPreferences.mockRejectedValue(new Error('API error'))
      localStorage.setItem('ui-theme', 'ocean')
      const store = useThemeStore()

      await store.initializeTheme()

      expect(store.current).toBe('ocean')
    })

    it('updates localStorage after fetching from API', async () => {
      mockGetUserPreferences.mockResolvedValue({
        success: true,
        data: { ui_theme: 'code' },
      })
      const store = useThemeStore()

      await store.initializeTheme()

      expect(localStorage.getItem('ui-theme')).toBe('code')
    })
  })

  describe('syncAfterLogin', () => {
    beforeEach(() => {
      authState.isAuthenticated = true
    })

    it('fetches and applies theme from API', async () => {
      mockGetUserPreferences.mockResolvedValue({
        success: true,
        data: { ui_theme: 'ocean' },
      })
      const store = useThemeStore()

      await store.syncAfterLogin()

      expect(store.current).toBe('ocean')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'ocean')
    })

    it('saves current theme to API if no API preference exists', async () => {
      mockGetUserPreferences.mockResolvedValue({
        success: true,
        data: { ui_theme: 'default' },
      })
      mockUpdateUserPreferences.mockResolvedValue({ success: true })
      const store = useThemeStore()
      store.current = 'code'

      // Simulate no API theme by returning null
      mockGetUserPreferences.mockResolvedValue({
        success: false,
        data: null,
      })

      await store.syncAfterLogin()

      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ ui_theme: 'code' })
    })
  })

  describe('isValidTheme', () => {
    it('returns true for valid themes', () => {
      const store = useThemeStore()

      expect(store.isValidTheme('default')).toBe(true)
      expect(store.isValidTheme('code')).toBe(true)
      expect(store.isValidTheme('ocean')).toBe(true)
    })

    it('returns false for invalid themes', () => {
      const store = useThemeStore()

      expect(store.isValidTheme('invalid')).toBe(false)
      expect(store.isValidTheme(null)).toBe(false)
      expect(store.isValidTheme('')).toBe(false)
    })
  })

  describe('applyTheme', () => {
    it('sets data-theme attribute on document', () => {
      const store = useThemeStore()

      store.applyTheme('code')

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'code')
    })
  })

  describe('persistTheme', () => {
    it('saves theme to localStorage', () => {
      const store = useThemeStore()

      store.persistTheme('ocean')

      expect(localStorage.getItem('ui-theme')).toBe('ocean')
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when user is not authenticated', () => {
      authState.isAuthenticated = false
      const store = useThemeStore()

      expect(store.isAuthenticated()).toBe(false)
    })

    it('returns true when user is authenticated', () => {
      authState.isAuthenticated = true
      const store = useThemeStore()

      expect(store.isAuthenticated()).toBe(true)
    })
  })
})
