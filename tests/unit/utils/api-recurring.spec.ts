import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '~/utils/api'

describe('ApiClient recurring query serialization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('serializes array filters into recurring list query string', async () => {
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockResolvedValueOnce({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    })

    const api = Object.create(ApiClient.prototype) as ApiClient & { baseUrl: string }
    api.baseUrl = 'http://localhost:8080/api'

    await api.getRecurringExpenses({
      page: 2,
      per_page: 20,
      category: ['food', 'transport'],
      frequency_type: ['monthly', 'yearly'],
      is_active: true,
    })

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string
    const url = new URL(calledUrl)

    expect(url.pathname).toBe('/api/recurring-expenses')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('per_page')).toBe('20')
    expect(url.searchParams.get('category')).toBe('food,transport')
    expect(url.searchParams.get('frequency_type')).toBe('monthly,yearly')
    expect(url.searchParams.get('is_active')).toBe('true')
  })
})
