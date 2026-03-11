import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CashFlowSummaryCards from '~/components/cashflow/CashFlowSummaryCards.vue'
import type { CashFlowSummary } from '~/types/cashflow'

describe('CashFlowSummaryCards', () => {
  const mockSummary: CashFlowSummary = {
    total_income: '80000.00',
    total_expense: '25000.00',
    net_cash_flow: '55000.00',
    savings_rate: '68.75',
  }

  describe('rendering', () => {
    it('renders total income', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: mockSummary },
      })

      expect(wrapper.text()).toContain('總收入')
      expect(wrapper.text()).toContain('$80,000/月')
    })

    it('renders total expense', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: mockSummary },
      })

      expect(wrapper.text()).toContain('總支出')
      expect(wrapper.text()).toContain('$25,000/月')
    })

    it('renders net cash flow', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: mockSummary },
      })

      expect(wrapper.text()).toContain('淨現金流')
      expect(wrapper.text()).toContain('+$55,000/月')
    })

    it('renders savings rate', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: mockSummary },
      })

      expect(wrapper.text()).toContain('儲蓄率')
      expect(wrapper.text()).toContain('68.75%')
    })
  })

  describe('loading state', () => {
    it('shows loading animation when loading', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: null, loading: true },
      })

      expect(wrapper.findAll('.animate-pulse')).toHaveLength(4)
    })
  })

  describe('null summary', () => {
    it('renders default values when summary is null', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: null },
      })

      expect(wrapper.text()).toContain('$0/月')
      expect(wrapper.text()).toContain('0%')
    })
  })

  describe('net cash flow styling', () => {
    it('applies success color for positive net cash flow', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: mockSummary },
      })

      expect(wrapper.find('.text-theme-success').exists()).toBe(true)
    })

    it('applies alert color for negative net cash flow', () => {
      const negativeSummary: CashFlowSummary = {
        ...mockSummary,
        net_cash_flow: '-10000.00',
      }

      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: negativeSummary },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })

    it('applies neutral color for zero net cash flow', () => {
      const zeroSummary: CashFlowSummary = {
        ...mockSummary,
        net_cash_flow: '0.00',
      }

      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: zeroSummary },
      })

      const netCashFlowCard = wrapper.findAll('.card')[2]
      expect(netCashFlowCard.find('.text-theme-text').exists()).toBe(true)
    })
  })

  describe('savings rate styling', () => {
    it('applies success color for high savings rate (>=20%)', () => {
      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: mockSummary },
      })

      // Savings rate is 68.75%, should be green
      const cards = wrapper.findAll('.card')
      const savingsCard = cards[3]
      expect(savingsCard.find('.text-theme-success').exists()).toBe(true)
    })

    it('applies neutral color for medium savings rate (10-20%)', () => {
      const mediumSummary: CashFlowSummary = {
        ...mockSummary,
        savings_rate: '15.00',
      }

      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: mediumSummary },
      })

      const cards = wrapper.findAll('.card')
      const savingsCard = cards[3]
      expect(savingsCard.find('.text-theme-text').exists()).toBe(true)
    })

    it('applies alert color for low savings rate (<10%)', () => {
      const lowSummary: CashFlowSummary = {
        ...mockSummary,
        savings_rate: '5.00',
      }

      const wrapper = mount(CashFlowSummaryCards, {
        props: { summary: lowSummary },
      })

      const cards = wrapper.findAll('.card')
      const savingsCard = cards[3]
      expect(savingsCard.find('.text-theme-error').exists()).toBe(true)
    })
  })
})
