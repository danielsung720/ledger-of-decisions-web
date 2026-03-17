import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '~/utils/api'

describe('ApiClient auth endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = ''
  })

  it('bootstraps csrf cookie for unsafe auth requests', async () => {
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockResolvedValue({ success: true } as never)

    const api = Object.create(ApiClient.prototype) as ApiClient & { baseUrl: string }
    api.baseUrl = 'http://localhost:8080/api'

    await api.login({ email: 'user@example.com', password: 'password123' })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:8080/sanctum/csrf-cookie')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' })
    expect(fetchMock.mock.calls[1]?.[0]).toBe('http://localhost:8080/api/login')
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
    })
  })

  it('sends xsrf header and never uses Authorization header', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token-value'
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockResolvedValue({ success: true } as never)

    const api = Object.create(ApiClient.prototype) as ApiClient & { baseUrl: string }
    api.baseUrl = 'http://localhost:8080/api'

    await api.logout()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const options = fetchMock.mock.calls[0]?.[1] as { headers?: Record<string, string> } | undefined
    expect(options?.headers?.Authorization).toBeUndefined()
    expect(options?.headers?.['X-XSRF-TOKEN']).toBe('csrf-token-value')
  })
})
