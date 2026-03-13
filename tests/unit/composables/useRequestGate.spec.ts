import { describe, expect, it, vi } from 'vitest'
import { useRequestGate } from '~/composables/useRequestGate'

describe('useRequestGate', () => {
  it('deduplicates concurrent same-key requests', async () => {
    const gate = useRequestGate()
    const task = vi.fn().mockResolvedValue('ok')

    const [a, b] = await Promise.all([gate.run('summary:key', task), gate.run('summary:key', task)])

    expect(a).toBe('ok')
    expect(b).toBe('ok')
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('returns cached result inside stale window', async () => {
    let now = 1_000
    const gate = useRequestGate(() => now)
    const task = vi.fn().mockResolvedValue('cached-value')

    const first = await gate.run('summary:key', task, { staleWindowMs: 10_000 })

    now = 2_000
    const second = await gate.run('summary:key', task, { staleWindowMs: 10_000 })

    expect(first).toBe('cached-value')
    expect(second).toBe('cached-value')
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('bypasses cache when force is true', async () => {
    const gate = useRequestGate()
    const task = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')

    const first = await gate.run('summary:key', task, { staleWindowMs: 10_000 })
    const second = await gate.run('summary:key', task, { staleWindowMs: 10_000, force: true })

    expect(first).toBe('first')
    expect(second).toBe('second')
    expect(task).toHaveBeenCalledTimes(2)
  })
})
