import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock Nuxt auto-imports
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:8080/api',
    },
  }),
  useNuxtApp: () => ({
    $pinia: null,
  }),
  navigateTo: vi.fn(),
  useFetch: vi.fn(),
}))

// Mock $fetch globally
globalThis.$fetch = vi.fn()

// Configure Vue Test Utils
config.global.stubs = {
  NuxtLink: true,
  ClientOnly: true,
}

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
