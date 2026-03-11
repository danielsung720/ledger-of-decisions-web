import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatsSummaryCard from '~/components/dashboard/StatsSummaryCard.vue'

describe('StatsSummaryCard', () => {
  const global = {
    stubs: {
      AppIcon: {
        props: ['name'],
        template: '<span>{{ name }}</span>',
      },
    },
  }

  const defaultProps = {
    title: 'Monthly Spending',
    icon: 'cash',
    count: 25,
    amount: 50000,
  }

  describe('rendering', () => {
    it('renders title', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: defaultProps,
        global,
      })

      expect(wrapper.text()).toContain('Monthly Spending')
    })

    it('renders icon', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: defaultProps,
        global,
      })

      expect(wrapper.text()).toContain('cash')
    })

    it('renders count with correct format', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: defaultProps,
        global,
      })

      expect(wrapper.text()).toContain('消費 25 筆')
    })

    it('renders formatted amount', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: defaultProps,
        global,
      })

      expect(wrapper.text()).toContain('$50,000')
    })

    it('formats large amounts correctly', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: { ...defaultProps, amount: 1234567 },
        global,
      })

      expect(wrapper.text()).toContain('$1,234,567')
    })
  })

  describe('trend display', () => {
    it('does not show trend when not provided', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: defaultProps,
        global,
      })

      expect(wrapper.text()).not.toContain('↑')
      expect(wrapper.text()).not.toContain('↓')
      expect(wrapper.text()).not.toContain('→')
    })

    it('shows up trend with alert color', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: {
          ...defaultProps,
          trend: {
            value: 15,
            direction: 'up',
            label: '+15%',
          },
        },
        global,
      })

      expect(wrapper.text()).toContain('↑')
      expect(wrapper.text()).toContain('+15%')
      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })

    it('shows down trend with success color', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: {
          ...defaultProps,
          trend: {
            value: 10,
            direction: 'down',
            label: '-10%',
          },
        },
        global,
      })

      expect(wrapper.text()).toContain('↓')
      expect(wrapper.text()).toContain('-10%')
      expect(wrapper.find('.text-theme-success').exists()).toBe(true)
    })

    it('shows stable trend with gray color', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: {
          ...defaultProps,
          trend: {
            value: 0,
            direction: 'stable',
            label: '0%',
          },
        },
        global,
      })

      expect(wrapper.text()).toContain('→')
      expect(wrapper.text()).toContain('0%')
      expect(wrapper.find('.text-theme-text-muted').exists()).toBe(true)
    })
  })

  describe('styling', () => {
    it('has card class', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: defaultProps,
        global,
      })

      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('has card-hover class', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: defaultProps,
        global,
      })

      expect(wrapper.find('.card-hover').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles zero count', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: { ...defaultProps, count: 0 },
        global,
      })

      expect(wrapper.text()).toContain('消費 0 筆')
    })

    it('handles zero amount', () => {
      const wrapper = mount(StatsSummaryCard, {
        props: { ...defaultProps, amount: 0 },
        global,
      })

      expect(wrapper.text()).toContain('$0')
    })
  })
})
