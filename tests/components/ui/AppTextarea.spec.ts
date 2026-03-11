import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppTextarea from '~/components/ui/AppTextarea.vue'

describe('AppTextarea', () => {
  describe('rendering', () => {
    it('renders textarea element', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('renders placeholder', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', placeholder: 'Enter text...' },
      })

      expect(wrapper.find('textarea').attributes('placeholder')).toBe('Enter text...')
    })

    it('has default rows of 3', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('textarea').attributes('rows')).toBe('3')
    })

    it('accepts custom rows', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', rows: 5 },
      })

      expect(wrapper.find('textarea').attributes('rows')).toBe('5')
    })
  })

  describe('label', () => {
    it('does not render label by default', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('label').exists()).toBe(false)
    })

    it('renders label when provided', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', label: 'Description' },
      })

      expect(wrapper.find('label').text()).toBe('Description')
    })

    it('adds required class when required', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', label: 'Note', required: true },
      })

      expect(wrapper.find('label').classes()).toContain('label-required')
    })
  })

  describe('v-model', () => {
    it('displays modelValue', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: 'Hello World' },
      })

      expect(wrapper.find('textarea').element.value).toBe('Hello World')
    })

    it('emits update:modelValue on input', async () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      await wrapper.find('textarea').setValue('New text')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['New text'])
    })
  })

  describe('character count', () => {
    it('displays character count', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: 'Hello' },
      })

      expect(wrapper.text()).toContain('5 / 500')
    })

    it('uses custom maxLength', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: 'Hi', maxLength: 100 },
      })

      expect(wrapper.text()).toContain('2 / 100')
    })

    it('sets maxlength attribute on textarea', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', maxLength: 200 },
      })

      expect(wrapper.find('textarea').attributes('maxlength')).toBe('200')
    })
  })

  describe('disabled state', () => {
    it('is not disabled by default', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('textarea').attributes('disabled')).toBeUndefined()
    })

    it('sets disabled attribute', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', disabled: true },
      })

      expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    })
  })

  describe('error state', () => {
    it('does not show error by default', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(false)
    })

    it('shows error message when provided', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', error: 'This field is required' },
      })

      expect(wrapper.find('.text-theme-error').text()).toBe('This field is required')
    })

    it('applies error styles to textarea', () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '', error: 'Error' },
      })

      expect(wrapper.find('textarea').classes()).toContain('border-theme-error')
    })
  })

  describe('events', () => {
    it('emits blur event', async () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      await wrapper.find('textarea').trigger('blur')

      expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    it('emits focus event', async () => {
      const wrapper = mount(AppTextarea, {
        props: { modelValue: '' },
      })

      await wrapper.find('textarea').trigger('focus')

      expect(wrapper.emitted('focus')).toHaveLength(1)
    })
  })
})
