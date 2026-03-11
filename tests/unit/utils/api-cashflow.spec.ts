import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '~/utils/api'

describe('ApiClient cashflow projection query serialization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('omits months query when months is undefined', async () => {
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockResolvedValueOnce({ data: [] })

    const api = Object.create(ApiClient.prototype) as ApiClient & { baseUrl: string }
    api.baseUrl = 'http://localhost:8080/api'

    await api.getCashFlowProjection()

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string
    const url = new URL(calledUrl)
    expect(url.pathname).toBe('/api/cash-flow/projection')
    expect(url.search).toBe('')
  })

  it('normalizes months query into valid range', async () => {
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })

    const api = Object.create(ApiClient.prototype) as ApiClient & { baseUrl: string }
    api.baseUrl = 'http://localhost:8080/api'

    await api.getCashFlowProjection(0)
    await api.getCashFlowProjection(99)
    await api.getCashFlowProjection(3.8)

    const first = new URL(fetchMock.mock.calls[0]?.[0] as string)
    const second = new URL(fetchMock.mock.calls[1]?.[0] as string)
    const third = new URL(fetchMock.mock.calls[2]?.[0] as string)

    expect(first.searchParams.get('months')).toBe('1')
    expect(second.searchParams.get('months')).toBe('12')
    expect(third.searchParams.get('months')).toBe('3')
  })
})
