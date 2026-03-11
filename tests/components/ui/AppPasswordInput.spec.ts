import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppPasswordInput from '~/components/ui/AppPasswordInput.vue'

describe('AppPasswordInput', () => {
  const defaultProps = {
    modelValue: '',
  }

  describe('rendering', () => {
    it('renders password input by default', () => {
      const wrapper = mount(AppPasswordInput, {
        props: defaultProps,
      })

      const input = wrapper.find('input')
      expect(input.exists()).toBe(true)
      expect(input.attributes('type')).toBe('password')
    })

    it('renders label when provided', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { ...defaultProps, label: 'Password' },
      })

      expect(wrapper.find('label').text()).toContain('Password')
    })

    it('renders required indicator when required', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { ...defaultProps, label: 'Password', required: true },
      })

      expect(wrapper.find('label').text()).toContain('*')
    })

    it('renders placeholder when provided', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { ...defaultProps, placeholder: 'Enter password' },
      })

      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter password')
    })

    it('renders hint when provided and no error', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { ...defaultProps, hint: 'At least 8 characters' },
      })

      expect(wrapper.text()).toContain('At least 8 characters')
    })

    it('renders error instead of hint when error exists', () => {
      const wrapper = mount(AppPasswordInput, {
        props: {
          ...defaultProps,
          hint: 'At least 8 characters',
          error: 'Password is required',
        },
      })

      expect(wrapper.text()).toContain('Password is required')
      expect(wrapper.text()).not.toContain('At least 8 characters')
    })
  })

  describe('visibility toggle', () => {
    it('toggles input type when button is clicked', async () => {
      const wrapper = mount(AppPasswordInput, {
        props: defaultProps,
      })

      const input = wrapper.find('input')
      const toggleButton = wrapper.find('button')

      expect(input.attributes('type')).toBe('password')

      await toggleButton.trigger('click')
      expect(input.attributes('type')).toBe('text')

      await toggleButton.trigger('click')
      expect(input.attributes('type')).toBe('password')
    })
  })

  describe('v-model', () => {
    it('displays modelValue', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { modelValue: 'secret123' },
      })

      expect(wrapper.find('input').element.value).toBe('secret123')
    })

    it('emits update:modelValue on input', async () => {
      const wrapper = mount(AppPasswordInput, {
        props: defaultProps,
      })

      const input = wrapper.find('input')
      await input.setValue('newpassword')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['newpassword'])
    })
  })

  describe('disabled state', () => {
    it('disables input when disabled prop is true', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { ...defaultProps, disabled: true },
      })

      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    it('disables toggle button when disabled', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { ...defaultProps, disabled: true },
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('error styling', () => {
    it('applies error styling when error exists', () => {
      const wrapper = mount(AppPasswordInput, {
        props: { ...defaultProps, error: 'Invalid password' },
      })

      const input = wrapper.find('input')
      expect(input.classes()).toContain('border-theme-error')
    })
  })
})
