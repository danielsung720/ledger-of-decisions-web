import { beforeEach, describe, expect, it, vi } from 'vitest'

const pushMock = vi.fn()
const successMock = vi.fn()
const authStoreMock = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  pendingEmail: 'test@example.com',
  initialized: true,
  userName: '',
  userEmail: '',
  initialize: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  clearError: vi.fn(),
  setPendingEmail: vi.fn(),
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('~/stores/ui', () => ({
  useUiStore: () => ({
    success: successMock,
  }),
}))

vi.mock('#imports', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...vue,
    useRouter: () => ({
      push: pushMock,
    }),
  }
})

vi.mock('#app/composables/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true and redirects on verifyEmail success', async () => {
    authStoreMock.verifyEmail.mockResolvedValueOnce(undefined)
    const { useAuth } = await import('~/composables/useAuth')
    const { verifyEmail } = useAuth()

    const result = await verifyEmail({ email: 'test@example.com', code: '123456' })

    expect(result).toBe(true)
    expect(authStoreMock.verifyEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
      code: '123456',
    })
    expect(successMock).toHaveBeenCalledWith('驗證成功', '歡迎使用決策記帳本！')
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('returns false without redirect on verifyEmail failure', async () => {
    authStoreMock.verifyEmail.mockRejectedValueOnce(new Error('invalid-code'))
    const { useAuth } = await import('~/composables/useAuth')
    const { verifyEmail } = useAuth()

    const result = await verifyEmail({ email: 'test@example.com', code: '000000' })

    expect(result).toBe(false)
    expect(successMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })
})
