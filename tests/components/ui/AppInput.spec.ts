import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '~/components/ui/AppInput.vue'

describe('AppInput', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('defaults to text type', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('input').attributes('type')).toBe('text')
    })

    it('accepts type prop', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', type: 'number' },
      })

      expect(wrapper.find('input').attributes('type')).toBe('number')
    })

    it('renders placeholder', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', placeholder: 'Enter text...' },
      })

      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text...')
    })
  })

  describe('label', () => {
    it('does not render label by default', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('label').exists()).toBe(false)
    })

    it('renders label when provided', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', label: 'Username' },
      })

      expect(wrapper.find('label').text()).toBe('Username')
    })

    it('adds required class when required', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', label: 'Email', required: true },
      })

      expect(wrapper.find('label').classes()).toContain('label-required')
    })
  })

  describe('v-model', () => {
    it('displays modelValue', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: 'hello' },
      })

      expect(wrapper.find('input').element.value).toBe('hello')
    })

    it('emits update:modelValue on input', async () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      await wrapper.find('input').setValue('new value')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
    })

    it('handles number values', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: 42, type: 'number' },
      })

      expect(wrapper.find('input').element.value).toBe('42')
    })

    it('handles null values', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: null },
      })

      expect(wrapper.find('input').element.value).toBe('')
    })
  })

  describe('disabled state', () => {
    it('is not disabled by default', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
    })

    it('sets disabled attribute', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', disabled: true },
      })

      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })
  })

  describe('error state', () => {
    it('does not show error by default', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(false)
    })

    it('shows error message when provided', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', error: 'This field is required' },
      })

      expect(wrapper.find('.text-theme-error').text()).toBe('This field is required')
    })

    it('applies error styles to input', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', error: 'Error' },
      })

      expect(wrapper.find('input').classes()).toContain('border-theme-error')
    })
  })

  describe('prefix and suffix', () => {
    it('does not show prefix by default', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      const spans = wrapper.findAll('.absolute')
      expect(spans.length).toBe(0)
    })

    it('shows prefix when provided', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', prefix: '$' },
      })

      expect(wrapper.find('.left-4').text()).toBe('$')
    })

    it('shows suffix when provided', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', suffix: 'TWD' },
      })

      expect(wrapper.find('.right-4').text()).toBe('TWD')
    })

    it('applies padding for prefix', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', prefix: '$' },
      })

      expect(wrapper.find('input').classes()).toContain('pl-10')
    })

    it('applies padding for suffix', () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '', suffix: 'TWD' },
      })

      expect(wrapper.find('input').classes()).toContain('pr-16')
    })
  })

  describe('events', () => {
    it('emits blur event', async () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      await wrapper.find('input').trigger('blur')

      expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    it('emits focus event', async () => {
      const wrapper = mount(AppInput, {
        props: { modelValue: '' },
      })

      await wrapper.find('input').trigger('focus')

      expect(wrapper.emitted('focus')).toHaveLength(1)
    })
  })
})
