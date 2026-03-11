import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToast } from '~/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('success', () => {
    it('adds success toast', () => {
      const { success, toasts } = useToast()

      success('Success!')

      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('success')
      expect(toasts.value[0].title).toBe('Success!')
    })

    it('adds success toast with message', () => {
      const { success, toasts } = useToast()

      success('Success!', 'Operation completed')

      expect(toasts.value[0].message).toBe('Operation completed')
    })
  })

  describe('warning', () => {
    it('adds warning toast', () => {
      const { warning, toasts } = useToast()

      warning('Warning!')

      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('warning')
      expect(toasts.value[0].title).toBe('Warning!')
    })
  })

  describe('error', () => {
    it('adds error toast', () => {
      const { error, toasts } = useToast()

      error('Error!')

      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('error')
      expect(toasts.value[0].title).toBe('Error!')
    })
  })

  describe('info', () => {
    it('adds info toast', () => {
      const { info, toasts } = useToast()

      info('Info!')

      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('info')
      expect(toasts.value[0].title).toBe('Info!')
    })
  })

  describe('remove', () => {
    it('removes toast by id', () => {
      const { success, remove, toasts } = useToast()

      success('Test', undefined)

      const toastId = toasts.value[0].id
      remove(toastId)

      expect(toasts.value).toHaveLength(0)
    })
  })

  describe('toasts', () => {
    it('is reactive computed property', () => {
      const { success, toasts } = useToast()

      expect(toasts.value).toHaveLength(0)

      success('Test 1')
      expect(toasts.value).toHaveLength(1)

      success('Test 2')
      expect(toasts.value).toHaveLength(2)
    })
  })
})
