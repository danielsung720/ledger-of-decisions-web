import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppCountdownButton from '~/components/ui/AppCountdownButton.vue'

describe('AppCountdownButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders button with default text', () => {
      const wrapper = mount(AppCountdownButton)

      expect(wrapper.text()).toContain('重新發送')
    })

    it('renders button with custom text', () => {
      const wrapper = mount(AppCountdownButton, {
        props: { text: 'Resend Code' },
      })

      expect(wrapper.text()).toContain('Resend Code')
    })

    it('is enabled by default', () => {
      const wrapper = mount(AppCountdownButton)

      expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    })

    it('is disabled when disabled prop is true', () => {
      const wrapper = mount(AppCountdownButton, {
        props: { disabled: true },
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('click behavior', () => {
    it('emits click event when clicked', async () => {
      const wrapper = mount(AppCountdownButton)

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('starts countdown after click', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { cooldownSeconds: 60 },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('(60秒)')
    })

    it('does not emit click when disabled', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { disabled: true },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('does not emit click while cooling down', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { cooldownSeconds: 60 },
      })

      // First click starts countdown
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)

      // Second click should be ignored
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })
  })

  describe('countdown timer', () => {
    it('decrements countdown every second', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { cooldownSeconds: 5 },
      })

      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).toContain('(5秒)')

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('(4秒)')

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('(3秒)')
    })

    it('re-enables button when countdown completes', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { cooldownSeconds: 3 },
      })

      await wrapper.find('button').trigger('click')
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()

      // Fast forward past countdown
      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
      expect(wrapper.text()).not.toContain('秒')
    })

    it('uses custom cooldown seconds', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { cooldownSeconds: 30 },
      })

      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).toContain('(30秒)')
    })
  })

  describe('accessibility', () => {
    it('has aria-disabled attribute when disabled', () => {
      const wrapper = mount(AppCountdownButton, {
        props: { disabled: true },
      })

      expect(wrapper.find('button').attributes('aria-disabled')).toBe('true')
    })

    it('has descriptive aria-label during countdown', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { text: '重新發送', cooldownSeconds: 60 },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.find('button').attributes('aria-label')).toContain('請等待')
      expect(wrapper.find('button').attributes('aria-label')).toContain('60')
    })

    it('has text as aria-label when not cooling down', () => {
      const wrapper = mount(AppCountdownButton, {
        props: { text: '重新發送' },
      })

      expect(wrapper.find('button').attributes('aria-label')).toBe('重新發送')
    })
  })

  describe('exposed methods', () => {
    it('exposes startCountdown method', () => {
      const wrapper = mount(AppCountdownButton)

      expect(wrapper.vm.startCountdown).toBeDefined()
      expect(typeof wrapper.vm.startCountdown).toBe('function')
    })

    it('startCountdown can be called externally', async () => {
      const wrapper = mount(AppCountdownButton, {
        props: { cooldownSeconds: 30 },
      })

      wrapper.vm.startCountdown()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('(30秒)')
    })
  })

  describe('styling', () => {
    it('has primary styling when enabled', () => {
      const wrapper = mount(AppCountdownButton)

      expect(wrapper.find('button').classes()).toContain('text-theme-primary')
    })

    it('has disabled styling when disabled', () => {
      const wrapper = mount(AppCountdownButton, {
        props: { disabled: true },
      })

      expect(wrapper.find('button').classes()).toContain('text-theme-text-placeholder')
      expect(wrapper.find('button').classes()).toContain('cursor-not-allowed')
    })

    it('has disabled styling during countdown', async () => {
      const wrapper = mount(AppCountdownButton)

      await wrapper.find('button').trigger('click')

      expect(wrapper.find('button').classes()).toContain('text-theme-text-placeholder')
    })
  })
})
