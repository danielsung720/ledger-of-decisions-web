import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types/auth'

const mockApi = {
  register: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getUser: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
}

vi.mock('~/utils/api', () => ({
  useApiClient: () => mockApi,
}))

describe('useAuthStore', () => {
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    email_verified_at: '2024-03-15T12:00:00',
    created_at: '2024-03-15T12:00:00',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('initial state', () => {
    it('has correct initial state', () => {
      const store = useAuthStore()

      expect(store.user).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.pendingEmail).toBe(null)
      expect(store.initialized).toBe(false)
    })
  })

  describe('getters', () => {
    it('isAuthenticated returns false when no user', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('isAuthenticated returns true when user exists', () => {
      const store = useAuthStore()
      store.user = mockUser
      expect(store.isAuthenticated).toBe(true)
    })

    it('userName returns empty string when no user', () => {
      const store = useAuthStore()
      expect(store.userName).toBe('')
    })

    it('userName returns user name', () => {
      const store = useAuthStore()
      store.user = mockUser
      expect(store.userName).toBe('Test User')
    })

    it('userEmail returns empty string when no user', () => {
      const store = useAuthStore()
      expect(store.userEmail).toBe('')
    })

    it('userEmail returns user email', () => {
      const store = useAuthStore()
      store.user = mockUser
      expect(store.userEmail).toBe('test@example.com')
    })
  })

  describe('initialize', () => {
    it('initializes as guest when session is missing', async () => {
      const store = useAuthStore()
      mockApi.getUser.mockRejectedValueOnce({ statusCode: 401 })

      await store.initialize()

      expect(store.user).toBe(null)
      expect(store.initialized).toBe(true)
      expect(mockApi.getUser).toHaveBeenCalledTimes(1)
    })

    it('fetches user when session exists', async () => {
      const store = useAuthStore()
      mockApi.getUser.mockResolvedValueOnce({ data: mockUser })

      await store.initialize()

      expect(store.user).toEqual(mockUser)
      expect(store.initialized).toBe(true)
    })

    it('is idempotent after first initialization', async () => {
      const store = useAuthStore()
      mockApi.getUser.mockResolvedValueOnce({ data: mockUser })

      await store.initialize()
      await store.initialize()

      expect(mockApi.getUser).toHaveBeenCalledTimes(1)
    })

    it('deduplicates concurrent initialize calls', async () => {
      const store = useAuthStore()
      mockApi.getUser.mockResolvedValue({ data: mockUser })

      await Promise.all([store.initialize(), store.initialize(), store.initialize()])

      expect(mockApi.getUser).toHaveBeenCalledTimes(1)
      expect(store.user).toEqual(mockUser)
      expect(store.initialized).toBe(true)
    })

    it('restores pendingEmail from localStorage', async () => {
      localStorage.setItem('pending_verification_email', 'stored@example.com')
      const store = useAuthStore()
      mockApi.getUser.mockRejectedValueOnce({ statusCode: 401 })

      await store.initialize()

      expect(store.pendingEmail).toBe('stored@example.com')
    })

    it('clears invalid pendingEmail format from localStorage', async () => {
      localStorage.setItem('pending_verification_email', 'invalid-email')
      const store = useAuthStore()
      mockApi.getUser.mockRejectedValueOnce({ statusCode: 401 })

      await store.initialize()

      expect(store.pendingEmail).toBe(null)
      expect(localStorage.getItem('pending_verification_email')).toBe(null)
    })
  })

  describe('register', () => {
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    }

    it('registers successfully and stores pending email from request', async () => {
      const store = useAuthStore()
      mockApi.register.mockResolvedValueOnce({
        success: true,
        data: mockUser,
      })

      const result = await store.register(registerData)

      expect(result.success).toBe(true)
      expect(store.pendingEmail).toBe('test@example.com')
      expect(localStorage.getItem('pending_verification_email')).toBe('test@example.com')
      expect(store.error).toBe(null)
    })

    it('handles registration error', async () => {
      const store = useAuthStore()
      mockApi.register.mockRejectedValueOnce({
        data: { error: 'Email already exists' },
      })

      await expect(store.register(registerData)).rejects.toBeDefined()
      expect(store.error).toBe('Email already exists')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('verifyEmail', () => {
    const verifyData = {
      email: 'test@example.com',
      code: '123456',
    }

    it('accepts verifyEmail response with direct user payload', async () => {
      const store = useAuthStore()
      store.pendingEmail = 'test@example.com'
      mockApi.verifyEmail.mockResolvedValueOnce({
        success: true,
        data: mockUser,
      })

      await store.verifyEmail(verifyData)

      expect(store.user).toEqual(mockUser)
      expect(store.pendingEmail).toBe(null)
      expect(store.initialized).toBe(true)
    })

    it('accepts verifyEmail response with nested user payload', async () => {
      const store = useAuthStore()
      mockApi.verifyEmail.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser },
      })

      await store.verifyEmail(verifyData)
      expect(store.user).toEqual(mockUser)
    })

    it('handles verification error', async () => {
      const store = useAuthStore()
      mockApi.verifyEmail.mockRejectedValueOnce({
        data: { error: 'Invalid code' },
      })

      await expect(store.verifyEmail(verifyData)).rejects.toBeDefined()
      expect(store.error).toBe('Invalid code')
    })
  })

  describe('resendVerification', () => {
    it('resends verification successfully', async () => {
      const store = useAuthStore()
      mockApi.resendVerification.mockResolvedValueOnce({
        success: true,
        message: 'Verification code sent',
      })

      const result = await store.resendVerification({ email: 'test@example.com' })

      expect(result.success).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('handles resend error', async () => {
      const store = useAuthStore()
      mockApi.resendVerification.mockRejectedValueOnce({
        data: { error: 'Too many requests' },
      })

      await expect(store.resendVerification({ email: 'test@example.com' })).rejects.toBeDefined()
      expect(store.error).toBe('Too many requests')
    })
  })

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('logs in successfully with session response contract', async () => {
      const store = useAuthStore()
      mockApi.login.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser },
      })

      await store.login(loginData)

      expect(store.user).toEqual(mockUser)
      expect(store.initialized).toBe(true)
    })

    it('handles login error', async () => {
      const store = useAuthStore()
      mockApi.login.mockRejectedValueOnce({
        data: { error: 'Invalid credentials' },
      })

      await expect(store.login(loginData)).rejects.toBeDefined()
      expect(store.error).toBe('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('logs out and clears state', async () => {
      const store = useAuthStore()
      store.user = mockUser
      store.pendingEmail = 'test@example.com'

      mockApi.logout.mockResolvedValueOnce({ success: true })

      await store.logout()

      expect(mockApi.logout).toHaveBeenCalledTimes(1)
      expect(store.user).toBe(null)
      expect(store.pendingEmail).toBe(null)
    })

    it('clears state even if API logout fails', async () => {
      const store = useAuthStore()
      store.user = mockUser
      mockApi.logout.mockRejectedValueOnce(new Error('Network error'))

      await store.logout()

      expect(store.user).toBe(null)
      expect(store.pendingEmail).toBe(null)
    })
  })

  describe('fetchUser', () => {
    it('fetches user successfully', async () => {
      const store = useAuthStore()
      mockApi.getUser.mockResolvedValueOnce({ data: mockUser })

      const result = await store.fetchUser()

      expect(result).toEqual(mockUser)
      expect(store.user).toEqual(mockUser)
    })

    it('clears user on error', async () => {
      const store = useAuthStore()
      store.user = mockUser
      mockApi.getUser.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(store.fetchUser()).rejects.toThrow()
      expect(store.user).toBe(null)
    })
  })

  describe('forgotPassword', () => {
    it('sends forgot password request successfully', async () => {
      const store = useAuthStore()
      mockApi.forgotPassword.mockResolvedValueOnce({
        success: true,
        message: 'Reset code sent',
      })

      await store.forgotPassword({ email: 'test@example.com' })

      expect(store.pendingEmail).toBe('test@example.com')
      expect(store.error).toBe(null)
    })

    it('handles forgot password error', async () => {
      const store = useAuthStore()
      mockApi.forgotPassword.mockRejectedValueOnce({
        data: { error: 'Email not found' },
      })

      await expect(store.forgotPassword({ email: 'test@example.com' })).rejects.toBeDefined()
      expect(store.error).toBe('Email not found')
    })
  })

  describe('resetPassword', () => {
    const resetData = {
      email: 'test@example.com',
      code: '123456',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    }

    it('resets password successfully', async () => {
      const store = useAuthStore()
      store.pendingEmail = 'test@example.com'
      mockApi.resetPassword.mockResolvedValueOnce({
        success: true,
        message: 'Password reset',
      })

      await store.resetPassword(resetData)

      expect(store.pendingEmail).toBe(null)
      expect(store.error).toBe(null)
    })

    it('handles reset password error', async () => {
      const store = useAuthStore()
      mockApi.resetPassword.mockRejectedValueOnce({
        data: { error: 'Invalid code' },
      })

      await expect(store.resetPassword(resetData)).rejects.toBeDefined()
      expect(store.error).toBe('Invalid code')
    })
  })

  describe('updatePassword', () => {
    const updateData = {
      current_password: 'oldpassword',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    }

    it('updates password successfully', async () => {
      const store = useAuthStore()
      mockApi.updatePassword.mockResolvedValueOnce({
        success: true,
        message: 'Password updated',
      })

      const result = await store.updatePassword(updateData)

      expect(result.success).toBe(true)
      expect(store.error).toBe(null)
    })

    it('handles update password error', async () => {
      const store = useAuthStore()
      mockApi.updatePassword.mockRejectedValueOnce({
        data: { error: 'Current password is incorrect' },
      })

      await expect(store.updatePassword(updateData)).rejects.toBeDefined()
      expect(store.error).toBe('Current password is incorrect')
    })
  })

  describe('clearError', () => {
    it('clears error', () => {
      const store = useAuthStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBe(null)
    })
  })

  describe('setPendingEmail', () => {
    it('sets pending email', () => {
      const store = useAuthStore()

      store.setPendingEmail('new@example.com')

      expect(store.pendingEmail).toBe('new@example.com')
    })

    it('stores valid email to localStorage', () => {
      const store = useAuthStore()

      store.setPendingEmail('valid@example.com')

      expect(localStorage.getItem('pending_verification_email')).toBe('valid@example.com')
    })

    it('does not store invalid email to localStorage', () => {
      const store = useAuthStore()
      localStorage.clear()

      store.setPendingEmail('invalid-email')

      expect(localStorage.getItem('pending_verification_email')).toBe(null)
    })
  })

  describe('clearPendingEmail', () => {
    it('clears pending email from state', () => {
      const store = useAuthStore()
      store.pendingEmail = 'test@example.com'

      store.clearPendingEmail()

      expect(store.pendingEmail).toBe(null)
    })

    it('removes email from localStorage', () => {
      const store = useAuthStore()
      localStorage.setItem('pending_verification_email', 'test@example.com')

      store.clearPendingEmail()

      expect(localStorage.getItem('pending_verification_email')).toBe(null)
    })
  })

  describe('extractErrorMessage', () => {
    it('extracts error from data.error', () => {
      const store = useAuthStore()
      const result = store.extractErrorMessage({ data: { error: 'Custom error' } })
      expect(result).toBe('Custom error')
    })

    it('extracts message from data.message', () => {
      const store = useAuthStore()
      const result = store.extractErrorMessage({ data: { message: 'Custom message' } })
      expect(result).toBe('Custom message')
    })

    it('extracts user-friendly message from statusCode', () => {
      const store = useAuthStore()
      const result = store.extractErrorMessage({ statusCode: 419 })
      expect(result).toBe('連線逾時，請重新整理頁面後再試')
    })

    it('extracts user-friendly message from status', () => {
      const store = useAuthStore()
      const result = store.extractErrorMessage({ status: 500 })
      expect(result).toBe('伺服器暫時無法處理請求，請稍後再試')
    })

    it('returns generic message for technical error messages', () => {
      const store = useAuthStore()
      const result = store.extractErrorMessage(
        new Error('[POST] "/api/register": 419 unknown status')
      )
      expect(result).toBe('發生錯誤，請稍後再試')
    })

    it('returns Error message if not technical', () => {
      const store = useAuthStore()
      const result = store.extractErrorMessage(new Error('自訂錯誤訊息'))
      expect(result).toBe('自訂錯誤訊息')
    })

    it('returns default message for unknown error', () => {
      const store = useAuthStore()
      const result = store.extractErrorMessage('string error')
      expect(result).toBe('發生錯誤，請稍後再試')
    })
  })

  describe('getHttpErrorMessage', () => {
    it('returns correct message for 400', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(400)).toBe('請求格式錯誤，請檢查輸入內容')
    })

    it('returns correct message for 401', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(401)).toBe('登入已過期，請重新登入')
    })

    it('returns correct message for 403', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(403)).toBe('您沒有權限執行此操作')
    })

    it('returns correct message for 404', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(404)).toBe('找不到請求的資源')
    })

    it('returns correct message for 419', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(419)).toBe('連線逾時，請重新整理頁面後再試')
    })

    it('returns correct message for 422', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(422)).toBe('輸入資料有誤，請檢查後重試')
    })

    it('returns correct message for 429', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(429)).toBe('請求過於頻繁，請稍後再試')
    })

    it('returns correct message for 500', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(500)).toBe('伺服器暫時無法處理請求，請稍後再試')
    })

    it('returns correct message for 502', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(502)).toBe('伺服器暫時無法處理請求，請稍後再試')
    })

    it('returns correct message for 503', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(503)).toBe('伺服器暫時無法處理請求，請稍後再試')
    })

    it('returns default message for unknown status', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(999)).toBe('發生錯誤，請稍後再試')
    })

    it('returns default message for undefined status', () => {
      const store = useAuthStore()
      expect(store.getHttpErrorMessage(undefined)).toBe('發生錯誤，請稍後再試')
    })
  })
})
