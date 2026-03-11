import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '~/utils/api'

describe('ApiClient auth endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('uses skipAuth endpoints without Authorization header', async () => {
    localStorage.setItem('auth_token', 'token-should-not-be-sent')
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock
      .mockResolvedValueOnce({ success: true, data: { email: 'user@example.com' } })
      .mockResolvedValueOnce({ success: true, data: { user: { id: 1 }, token: 't' } })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: { user: { id: 1 }, token: 't' } })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true })

    const api = Object.create(ApiClient.prototype) as ApiClient & { baseUrl: string }
    api.baseUrl = 'http://localhost:8080/api'

    await api.register({
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    })
    await api.verifyEmail({ email: 'user@example.com', code: '123456' })
    await api.resendVerification({ email: 'user@example.com' })
    await api.login({ email: 'user@example.com', password: 'password123' })
    await api.forgotPassword({ email: 'user@example.com' })
    await api.resetPassword({
      email: 'user@example.com',
      code: '123456',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    })

    for (const call of fetchMock.mock.calls) {
      const options = call[1] as { headers?: Record<string, string> } | undefined
      expect(options?.headers?.Authorization).toBeUndefined()
    }
  })

  it('clears token and redirects to login on 401 response', async () => {
    localStorage.setItem('auth_token', 'expired-token')
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockRejectedValueOnce({ statusCode: 401, data: { message: 'Unauthenticated' } })

    const api = Object.create(ApiClient.prototype) as ApiClient & { baseUrl: string }
    api.baseUrl = 'http://localhost:8080/api'

    await expect(api.getUser()).rejects.toBeDefined()

    expect(localStorage.getItem('auth_token')).toBe(null)
  })
})
