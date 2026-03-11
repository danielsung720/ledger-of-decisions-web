import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppToast from '~/components/ui/AppToast.vue'

describe('AppToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    show: true,
    title: 'Success Message',
  }

  const defaultStubs = {
    Transition: {
      template: '<div v-if="$attrs.show !== false"><slot /></div>',
    },
    CheckCircleIcon: true,
    ExclamationTriangleIcon: true,
    InformationCircleIcon: true,
    XCircleIcon: true,
    XMarkIcon: true,
  }

  describe('rendering', () => {
    it('renders when show is true', () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Success Message')
    })

    it('does not render when show is false', () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, show: false },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).not.toContain('Success Message')
    })

    it('renders title', () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Success Message')
    })

    it('renders message when provided', () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, message: 'Additional details here' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Additional details here')
    })

    it('does not render message when not provided', () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBe(1)
    })
  })

  describe('toast types', () => {
    it('applies success styles for success type', () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, type: 'success' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.bg-theme-success-light').exists()).toBe(true)
    })

    it('applies warning styles for warning type', () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, type: 'warning' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.bg-theme-warning-light').exists()).toBe(true)
    })

    it('applies error styles for error type', () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, type: 'error' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.bg-theme-error-light').exists()).toBe(true)
    })

    it('applies info styles for info type (default)', () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.bg-theme-info-light').exists()).toBe(true)
    })
  })

  describe('close button', () => {
    it('renders close button by default', () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('does not render close button when closeable is false', () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, closeable: false },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('emits close when close button clicked', async () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('close')).toHaveLength(1)
    })
  })

  describe('auto-dismiss', () => {
    it('emits close after duration', async () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, duration: 3000 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.emitted('close')).toBeUndefined()

      vi.advanceTimersByTime(3000)

      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('uses default duration of 5000ms', async () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      vi.advanceTimersByTime(4999)
      expect(wrapper.emitted('close')).toBeUndefined()

      vi.advanceTimersByTime(1)
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('does not auto-dismiss when duration is 0', async () => {
      const wrapper = mount(AppToast, {
        props: { ...defaultProps, duration: 0 },
        global: { stubs: defaultStubs },
      })

      vi.advanceTimersByTime(10000)

      expect(wrapper.emitted('close')).toBeUndefined()
    })
  })

  describe('button types', () => {
    it('close button has type="button"', () => {
      const wrapper = mount(AppToast, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('button').attributes('type')).toBe('button')
    })
  })
})
