interface RequestGateOptions {
  staleWindowMs?: number
  force?: boolean
}

interface RequestCacheEntry {
  completedAt: number
  value: unknown
}

/**
 * Deduplicate same-key requests and suppress burst reloads within stale window.
 */
export function useRequestGate(nowProvider: () => number = () => Date.now()) {
  const inFlight = new Map<string, Promise<unknown>>()
  const cache = new Map<string, RequestCacheEntry>()

  async function run<T>(
    key: string,
    task: () => Promise<T>,
    options: RequestGateOptions = {}
  ): Promise<T> {
    const staleWindowMs = options.staleWindowMs ?? 0

    if (!options.force) {
      const currentInFlight = inFlight.get(key)
      if (currentInFlight) {
        return currentInFlight as Promise<T>
      }

      if (staleWindowMs > 0) {
        const entry = cache.get(key)
        if (entry && nowProvider() - entry.completedAt < staleWindowMs) {
          return entry.value as T
        }
      }
    }

    const promise = task()
      .then((result) => {
        cache.set(key, {
          completedAt: nowProvider(),
          value: result,
        })
        return result
      })
      .finally(() => {
        inFlight.delete(key)
      })

    inFlight.set(key, promise as Promise<unknown>)

    return promise
  }

  function clear(key?: string) {
    if (key) {
      inFlight.delete(key)
      cache.delete(key)
      return
    }

    inFlight.clear()
    cache.clear()
  }

  return {
    run,
    clear,
  }
}
