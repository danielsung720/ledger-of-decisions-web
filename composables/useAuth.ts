import type {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
} from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { isEmailNotVerifiedError, extractEmailFromError } from '~/utils/auth-errors'

export function useAuth() {
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)
  const pendingEmail = computed(() => authStore.pendingEmail)
  const initialized = computed(() => authStore.initialized)
  const userName = computed(() => authStore.userName)
  const userEmail = computed(() => authStore.userEmail)

  async function initialize() {
    if (!authStore.initialized) {
      await authStore.initialize()
    }
  }

  async function register(data: RegisterRequest) {
    try {
      await authStore.register(data)
      router.push('/verify-email')
    } catch {
      // Error is already set in store
    }
  }

  async function verifyEmail(data: VerifyEmailRequest) {
    try {
      await authStore.verifyEmail(data)
      uiStore.success('驗證成功', '歡迎使用決策記帳本！')
      router.push('/')
      return true
    } catch {
      // Error is already set in store
      return false
    }
  }

  async function resendVerification() {
    const email = authStore.pendingEmail
    if (!email) return

    try {
      await authStore.resendVerification({ email })
      uiStore.success('已重新發送', '驗證碼已發送至您的信箱')
    } catch {
      // Error is already set in store
    }
  }

  async function login(data: LoginRequest) {
    try {
      await authStore.login(data)
      uiStore.success('登入成功', '歡迎回來！')
      router.push('/')
    } catch (err: unknown) {
      // Check if this is an unverified email error (403 + email_not_verified)
      if (isEmailNotVerifiedError(err)) {
        const email = extractEmailFromError(err)
        if (email) {
          authStore.setPendingEmail(email)
          authStore.clearError()
          router.push('/verify-email')
          return
        }
      }
      // Other errors are already set in store
    }
  }

  async function logout() {
    await authStore.logout()
    uiStore.success('已登出', '期待您再次使用')
    router.push('/login')
  }

  async function forgotPassword(data: ForgotPasswordRequest) {
    try {
      await authStore.forgotPassword(data)
      // Stay on same page, show verification code input
      return true
    } catch {
      return false
    }
  }

  async function resetPassword(data: ResetPasswordRequest) {
    try {
      await authStore.resetPassword(data)
      uiStore.success('密碼重設成功', '請使用新密碼登入')
      router.push('/login')
    } catch {
      // Error is already set in store
    }
  }

  async function updatePassword(data: UpdatePasswordRequest) {
    try {
      await authStore.updatePassword(data)
      uiStore.success('密碼已更新', '密碼修改成功')
      return true
    } catch {
      return false
    }
  }

  function clearError() {
    authStore.clearError()
  }

  function setPendingEmail(email: string) {
    authStore.setPendingEmail(email)
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    pendingEmail,
    initialized,
    userName,
    userEmail,

    // Actions
    initialize,
    register,
    verifyEmail,
    resendVerification,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    clearError,
    setPendingEmail,
  }
}
