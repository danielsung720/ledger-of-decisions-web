import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '~/components/dashboard/HeroSection.vue'

describe('HeroSection', () => {
  const defaultProps = {
    totalAmount: 25000,
    totalCount: 42,
    impulseRatio: 18,
    todayAmount: 1200,
    todayCount: 3,
    weekAmount: 8500,
    weekCount: 15,
    impulseCount: 5,
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

    it('renders monthly label', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('本月支出')
    })

    it('renders impulse ratio percentage', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('衝動佔比')
      expect(wrapper.text()).toContain('18%')
    })

    it('renders today stats', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('今日消費')
      expect(wrapper.text()).toContain('$1,200')
      expect(wrapper.text()).toContain('3 筆記錄')
    })

    it('renders week stats', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('本週消費')
      expect(wrapper.text()).toContain('$8,500')
      expect(wrapper.text()).toContain('15 筆記錄')
    })

    it('renders impulse count', () => {
      const wrapper = mount(HeroSection, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('5 筆衝動消費')
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
