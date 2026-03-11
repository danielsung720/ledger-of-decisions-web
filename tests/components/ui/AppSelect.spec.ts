import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSelect from '~/components/ui/AppSelect.vue'

describe('AppSelect', () => {
  const mockOptions = [
    { value: 'food', label: '飲食', icon: 'utensils' },
    { value: 'transport', label: '交通', icon: 'car' },
    { value: 'living', label: '生活', icon: 'home' },
  ]

  const defaultStubs = {
    Listbox: {
      template: '<div><slot /></div>',
      props: ['modelValue', 'disabled'],
    },
    ListboxButton: {
      template: '<button :class="$attrs.class"><slot /></button>',
    },
    ListboxOptions: {
      template: '<ul><slot /></ul>',
    },
    ListboxOption: {
      template: '<li @click="$emit(\'click\')"><slot :active="false" :selected="false" /></li>',
      emits: ['click'],
    },
    Transition: {
      template: '<div><slot /></div>',
    },
    AppIcon: {
      props: ['name'],
      template: '<span>{{ name }}</span>',
    },
  }

  describe('rendering', () => {
    it('renders placeholder when no value selected', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('請選擇')
    })

    it('renders custom placeholder', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
          placeholder: 'Select an option',
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Select an option')
    })

    it('renders selected option label', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: 'food',
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('飲食')
    })

    it('renders selected option icon', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: 'food',
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('utensils')
    })
  })

  describe('label', () => {
    it('does not render label by default', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('label').exists()).toBe(false)
    })

    it('renders label when provided', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
          label: 'Category',
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('label').text()).toBe('Category')
    })

    it('adds required class when required', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
          label: 'Category',
          required: true,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('label').classes()).toContain('label-required')
    })
  })

  describe('error state', () => {
    it('does not show error by default', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(false)
    })

    it('shows error message when provided', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
          error: 'Please select an option',
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-error').text()).toBe('Please select an option')
    })

    it('applies error styles to button', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
          error: 'Error',
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('button').classes()).toContain('border-theme-error')
    })
  })

  describe('options rendering', () => {
    it('renders all options', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      const options = wrapper.findAll('li')
      // The component renders options in both the button and dropdown
      expect(options.length).toBeGreaterThanOrEqual(3)
    })

    it('renders option labels', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('飲食')
      expect(wrapper.text()).toContain('交通')
      expect(wrapper.text()).toContain('生活')
    })

    it('renders option icons', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('utensils')
      expect(wrapper.text()).toContain('car')
      expect(wrapper.text()).toContain('home')
    })
  })

  describe('selection', () => {
    it('finds selected option correctly', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: 'transport',
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('交通')
      expect(wrapper.text()).toContain('car')
    })

    it('handles null value', () => {
      const wrapper = mount(AppSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('請選擇')
    })
  })

  describe('options without icons', () => {
    it('renders options without icons correctly', () => {
      const optionsWithoutIcons = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ]

      const wrapper = mount(AppSelect, {
        props: {
          modelValue: 'a',
          options: optionsWithoutIcons,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Option A')
    })
  })
})
