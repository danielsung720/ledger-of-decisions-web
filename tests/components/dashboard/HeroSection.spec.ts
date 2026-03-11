import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '~/components/dashboard/HeroSection.vue'

describe('HeroSection', () => {
  const defaultProps = {
    totalAmount: 25000,
    totalCount: 42,
    impulseRatio: 18,
  }

  const defaultStubs = {
    AppButton: {
      template: '<button @click="$emit(\'click\')"><slot /></button>',
      emits: ['click'],
    },
    PlusIcon: true,
  }

  describe('rendering', () => {
    it('renders main heading', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('決策驅動的記帳')
    })

    it('renders description text', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('每一筆消費都是一個決策')
    })

    it('renders add expense button', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('記一筆消費')
    })
  })

  describe('stats display', () => {
    it('renders total amount formatted as currency', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('$25,000')
    })

    it('renders total count', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('共 42 筆')
    })

    it('renders monthly label', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('本月消費')
    })

    it('renders impulse ratio as percentage', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('18%')
    })

    it('renders impulse ratio label', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('衝動消費佔比')
    })
  })

  describe('impulse ratio styling', () => {
    it('applies success color when ratio <= 20%', () => {
      const wrapper = mount(HeroSection, {
        props: { ...defaultProps, impulseRatio: 15 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-success').exists()).toBe(true)
    })

    it('shows positive message when ratio <= 20%', () => {
      const wrapper = mount(HeroSection, {
        props: { ...defaultProps, impulseRatio: 15 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('控制得不錯')
    })

    it('applies alert color when ratio > 20%', () => {
      const wrapper = mount(HeroSection, {
        props: { ...defaultProps, impulseRatio: 25 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })

    it('shows improvement message when ratio > 20%', () => {
      const wrapper = mount(HeroSection, {
        props: { ...defaultProps, impulseRatio: 25 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('可以再改善')
    })
  })

  describe('events', () => {
    it('emits addExpense when button clicked', async () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('addExpense')).toHaveLength(1)
    })
  })
})
