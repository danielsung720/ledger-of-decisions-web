import { defineStore } from 'pinia'
import type {
  User,
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
} from '~/types/auth'
import { useApiClient } from '~/utils/api'

const PENDING_EMAIL_KEY = 'pending_verification_email'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

function getPendingEmailFromStorage(): string | null {
  if (import.meta.client) {
    const email = localStorage.getItem(PENDING_EMAIL_KEY)
    if (email && isValidEmail(email)) {
      return email
    }
    if (email) {
      localStorage.removeItem(PENDING_EMAIL_KEY)
    }
  }
  return null
}

function setPendingEmailToStorage(email: string): void {
  if (import.meta.client && isValidEmail(email)) {
    localStorage.setItem(PENDING_EMAIL_KEY, email)
  }
}

function removePendingEmailFromStorage(): void {
  if (import.meta.client) {
    localStorage.removeItem(PENDING_EMAIL_KEY)
  }
}

function normalizeAuthUser(payload: unknown): User | null {
  if (!payload || typeof payload !== 'object') return null
  if ('user' in payload && payload.user && typeof payload.user === 'object') {
    return payload.user as User
  }
  return payload as User
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  pendingEmail: string | null
  initialized: boolean
}

let initializePromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isLoading: false,
    error: null,
    pendingEmail: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userName: (state) => state.user?.name ?? '',
    userEmail: (state) => state.user?.email ?? '',
  },

  actions: {
    async initialize() {
      if (import.meta.client) {
        const storedPendingEmail = getPendingEmailFromStorage()
        if (storedPendingEmail) {
          this.pendingEmail = storedPendingEmail
        }
      }

      if (this.initialized) {
        return
      }

      if (this.user) {
        this.initialized = true
        return
      }

      if (initializePromise) {
        await initializePromise
        return
      }

      initializePromise = (async () => {
        try {
          await this.fetchUser()
        } catch {
          this.user = null
        }
      })()

      try {
        await initializePromise
      } finally {
        this.initialized = true
        initializePromise = null
      }
    },

    async register(data: RegisterRequest) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.register(data)
        this.setPendingEmail(data.email)
        return response
      } catch (err: unknown) {
        const errorMessage = this.extractErrorMessage(err)
        this.error = errorMessage
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async verifyEmail(data: VerifyEmailRequest) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.verifyEmail(data)
        this.user = normalizeAuthUser(response.data)
        this.clearPendingEmail()
        this.initialized = true

        return response
      } catch (err: unknown) {
        const errorMessage = this.extractErrorMessage(err)
        this.error = errorMessage
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async resendVerification(data: ResendVerificationRequest) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApiClient()
        return await api.resendVerification(data)
      } catch (err: unknown) {
        const errorMessage = this.extractErrorMessage(err)
        this.error = errorMessage
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async login(data: LoginRequest) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.login(data)
        this.user = response.data.user
        this.initialized = true

        return response
      } catch (err: unknown) {
        const errorMessage = this.extractErrorMessage(err)
        this.error = errorMessage
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (this.user) {
          const api = useApiClient()
          await api.logout()
        }
      } catch {
        // Ignore logout errors
      } finally {
        this.user = null
        this.clearPendingEmail()
      }
    },

    async fetchUser() {
      this.isLoading = true

      try {
        const api = useApiClient()
        const response = await api.getUser()
        this.user = response.data
        return response.data
      } catch (err: unknown) {
        this.user = null
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async forgotPassword(data: ForgotPasswordRequest) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.forgotPassword(data)
        this.setPendingEmail(data.email)
        return response
      } catch (err: unknown) {
        const errorMessage = this.extractErrorMessage(err)
        this.error = errorMessage
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async resetPassword(data: ResetPasswordRequest) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApiClient()
        const response = await api.resetPassword(data)
        this.clearPendingEmail()
        return response
      } catch (err: unknown) {
        const errorMessage = this.extractErrorMessage(err)
        this.error = errorMessage
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updatePassword(data: UpdatePasswordRequest) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApiClient()
        return await api.updatePassword(data)
      } catch (err: unknown) {
        const errorMessage = this.extractErrorMessage(err)
        this.error = errorMessage
        throw err
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },

    setPendingEmail(email: string) {
      this.pendingEmail = email
      setPendingEmailToStorage(email)
    },

    clearPendingEmail() {
      this.pendingEmail = null
      removePendingEmailFromStorage()
    },

    extractErrorMessage(err: unknown): string {
      if (err && typeof err === 'object') {
        // Handle FetchError with data.error or data.message from API
        if ('data' in err) {
          const data = (err as { data: { error?: string; message?: string } }).data
          if (data?.error) return data.error
          if (data?.message) return data.message
        }

        // Handle HTTP status codes
        if ('statusCode' in err || 'status' in err) {
          const status =
            (err as { statusCode?: number; status?: number }).statusCode ||
            (err as { statusCode?: number; status?: number }).status
          return this.getHttpErrorMessage(status)
        }

        // Handle Error object - but filter out technical messages
        if ('message' in err) {
          const message = (err as Error).message
          // If message looks technical (contains HTTP method, status code, etc.), return generic message
          if (message.includes('[') || message.includes('status') || message.includes('fetch')) {
            return '發生錯誤，請稍後再試'
          }
          return message
        }
      }
      return '發生錯誤，請稍後再試'
    },

    getHttpErrorMessage(status?: number): string {
      switch (status) {
        case 400:
          return '請求格式錯誤，請檢查輸入內容'
        case 401:
          return '登入已過期，請重新登入'
        case 403:
          return '您沒有權限執行此操作'
        case 404:
          return '找不到請求的資源'
        case 419:
          return '連線逾時，請重新整理頁面後再試'
        case 422:
          return '輸入資料有誤，請檢查後重試'
        case 429:
          return '請求過於頻繁，請稍後再試'
        case 500:
        case 502:
        case 503:
          return '伺服器暫時無法處理請求，請稍後再試'
        default:
          return '發生錯誤，請稍後再試'
      }
    },
  },
})
