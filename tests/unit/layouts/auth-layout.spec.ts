import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const initializeMock = vi.fn().mockResolvedValue(undefined)
let initializedState = false

vi.mock('~/stores/ui', () => ({
  useUiStore: () => ({
    toasts: [],
    removeToast: vi.fn(),
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get initialized() {
      return initializedState
    },
    initialize: initializeMock,
  }),
}))

describe('auth layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    initializedState = false
  })

  it('initializes auth store on mount when not initialized', async () => {
    const AuthLayout = (await import('~/layouts/auth.vue')).default
    mount(AuthLayout, {
      slots: {
        default: '<div>auth content</div>',
      },
      global: {
        stubs: {
          AppToast: true,
        },
      },
    })

    await flushPromises()

    expect(initializeMock).toHaveBeenCalledTimes(1)
  })

  it('does not initialize again when auth store is already initialized', async () => {
    initializedState = true
    const AuthLayout = (await import('~/layouts/auth.vue')).default
    mount(AuthLayout, {
      slots: {
        default: '<div>auth content</div>',
      },
      global: {
        stubs: {
          AppToast: true,
        },
      },
    })

    await flushPromises()

    expect(initializeMock).not.toHaveBeenCalled()
  })
})
