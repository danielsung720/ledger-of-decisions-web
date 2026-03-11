import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OverviewCard from '~/components/review/OverviewCard.vue'

describe('OverviewCard', () => {
  const defaultProps = {
    totalAmount: 15000,
    totalCount: 25,
    impulseRatio: 15,
  }

  describe('total amount display', () => {
    it('renders total amount formatted as currency', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('$15,000')
    })

    it('renders total count', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('共 25 筆')
    })

    it('renders total consumption label', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('總消費')
    })
  })

  describe('impulse ratio display', () => {
    it('renders impulse ratio as percentage', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('15%')
    })

    it('applies success color when ratio <= 20%', () => {
      const wrapper = mount(OverviewCard, {
        props: { ...defaultProps, impulseRatio: 15 },
      })

      expect(wrapper.find('.text-theme-success').exists()).toBe(true)
    })

    it('shows positive message when ratio <= 20%', () => {
      const wrapper = mount(OverviewCard, {
        props: { ...defaultProps, impulseRatio: 15 },
      })

      expect(wrapper.text()).toContain('控制得很好')
    })

    it('applies alert color when ratio > 20%', () => {
      const wrapper = mount(OverviewCard, {
        props: { ...defaultProps, impulseRatio: 25 },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })

    it('shows warning message when ratio > 20%', () => {
      const wrapper = mount(OverviewCard, {
        props: { ...defaultProps, impulseRatio: 25 },
      })

      expect(wrapper.text()).toContain('建議控制在 20% 以下')
    })

    it('renders impulse ratio label', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('衝動消費佔比')
    })
  })

  describe('impulse trend display', () => {
    it('shows dash when no trend data', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('-')
    })

    it('renders trend label', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('衝動消費趨勢')
      expect(wrapper.text()).toContain('相較上週')
    })

    it('renders up trend with alert color', () => {
      const wrapper = mount(OverviewCard, {
        props: {
          ...defaultProps,
          impulseTrend: {
            thisWeek: 30,
            lastWeek: 20,
            changePercentage: 50,
            trend: 'up' as const,
          },
        },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
      expect(wrapper.text()).toContain('+50.0%')
    })

    it('renders down trend with success color', () => {
      const wrapper = mount(OverviewCard, {
        props: {
          ...defaultProps,
          impulseTrend: {
            thisWeek: 10,
            lastWeek: 20,
            changePercentage: -50,
            trend: 'down' as const,
          },
        },
      })

      expect(wrapper.find('.text-theme-success').exists()).toBe(true)
      expect(wrapper.text()).toContain('-50.0%')
    })

    it('renders stable trend with neutral color', () => {
      const wrapper = mount(OverviewCard, {
        props: {
          ...defaultProps,
          impulseTrend: {
            thisWeek: 20,
            lastWeek: 20,
            changePercentage: 0,
            trend: 'stable' as const,
          },
        },
      })

      expect(wrapper.find('.text-theme-text-muted').exists()).toBe(true)
    })
  })

  describe('layout', () => {
    it('renders three cards in grid', () => {
      const wrapper = mount(OverviewCard, {
        props: defaultProps,
      })

      const cards = wrapper.findAll('.card')
      expect(cards.length).toBe(3)
    })
  })
})
