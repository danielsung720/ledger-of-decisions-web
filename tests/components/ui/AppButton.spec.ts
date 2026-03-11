import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '~/components/ui/AppButton.vue'
import AppSpinner from '~/components/ui/AppSpinner.vue'

describe('AppButton', () => {
  describe('rendering', () => {
    it('renders slot content', () => {
      const wrapper = mount(AppButton, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.text()).toContain('Click me')
    })

    it('renders as button element', () => {
      const wrapper = mount(AppButton)

      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('defaults to type="button"', () => {
      const wrapper = mount(AppButton)

      expect(wrapper.attributes('type')).toBe('button')
    })

    it('accepts type prop', () => {
      const wrapper = mount(AppButton, {
        props: { type: 'submit' },
      })

      expect(wrapper.attributes('type')).toBe('submit')
    })
  })

  describe('variants', () => {
    it('applies primary variant classes by default', () => {
      const wrapper = mount(AppButton)

      expect(wrapper.classes()).toContain('bg-theme-primary')
    })

    it('applies secondary variant classes', () => {
      const wrapper = mount(AppButton, {
        props: { variant: 'secondary' },
      })

      expect(wrapper.classes()).toContain('bg-transparent')
    })

    it('applies text variant classes', () => {
      const wrapper = mount(AppButton, {
        props: { variant: 'text' },
      })

      expect(wrapper.classes()).toContain('text-theme-primary')
    })

    it('applies icon variant classes', () => {
      const wrapper = mount(AppButton, {
        props: { variant: 'icon' },
      })

      expect(wrapper.classes()).toContain('text-theme-text-muted')
    })
  })

  describe('sizes', () => {
    it('applies md size by default', () => {
      const wrapper = mount(AppButton)

      expect(wrapper.classes()).toContain('h-12')
    })

    it('applies sm size classes', () => {
      const wrapper = mount(AppButton, {
        props: { size: 'sm' },
      })

      expect(wrapper.classes()).toContain('h-9')
    })

    it('applies lg size classes', () => {
      const wrapper = mount(AppButton, {
        props: { size: 'lg' },
      })

      expect(wrapper.classes()).toContain('h-14')
    })
  })

  describe('disabled state', () => {
    it('is not disabled by default', () => {
      const wrapper = mount(AppButton)

      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('sets disabled attribute when disabled prop is true', () => {
      const wrapper = mount(AppButton, {
        props: { disabled: true },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('does not emit click when disabled', async () => {
      const wrapper = mount(AppButton, {
        props: { disabled: true },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe('loading state', () => {
    it('is not loading by default', () => {
      const wrapper = mount(AppButton, {
        global: {
          stubs: { AppSpinner },
        },
      })

      expect(wrapper.findComponent(AppSpinner).exists()).toBe(false)
    })

    it('shows spinner when loading', () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
        global: {
          stubs: { AppSpinner: true },
        },
      })

      expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(true)
    })

    it('is disabled when loading', () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
        global: {
          stubs: { AppSpinner: true },
        },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('does not emit click when loading', async () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
        global: {
          stubs: { AppSpinner: true },
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe('click events', () => {
    it('emits click event on click', async () => {
      const wrapper = mount(AppButton)

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('passes MouseEvent in click emission', async () => {
      const wrapper = mount(AppButton)

      await wrapper.trigger('click')

      const emittedEvent = wrapper.emitted('click')?.[0]?.[0]
      expect(emittedEvent).toBeInstanceOf(MouseEvent)
    })
  })
})
