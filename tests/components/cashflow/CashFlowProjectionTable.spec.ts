import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CashFlowProjectionTable from '~/components/cashflow/CashFlowProjectionTable.vue'
import type { CashFlowProjection } from '~/types/cashflow'

describe('CashFlowProjectionTable', () => {
  const mockProjections: CashFlowProjection[] = [
    {
      month: '2026/02',
      income: '80000.00',
      expense: '25000.00',
      net: '55000.00',
      cumulative_balance: '55000.00',
    },
    {
      month: '2026/03',
      income: '80000.00',
      expense: '25000.00',
      net: '55000.00',
      cumulative_balance: '110000.00',
    },
    {
      month: '2026/04',
      income: '80000.00',
      expense: '25000.00',
      net: '55000.00',
      cumulative_balance: '165000.00',
    },
  ]

  const defaultStubs = {
    AppSpinner: true,
  }

  describe('rendering', () => {
    it('renders table header with selected months', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('多月預測 (3 個月)')
    })

    it('renders all projections', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('2026/02')
      expect(wrapper.text()).toContain('2026/03')
      expect(wrapper.text()).toContain('2026/04')
    })

    it('renders income values', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('$80,000')
    })

    it('renders expense values', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('$25,000')
    })

    it('renders net values with plus sign for positive', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('+$55,000')
    })

    it('renders cumulative balance', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('$55,000')
      expect(wrapper.text()).toContain('$110,000')
      expect(wrapper.text()).toContain('$165,000')
    })
  })

  describe('empty state', () => {
    it('shows empty message when no projections', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: [], selectedMonths: 1 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('無預測資料')
    })
  })

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: [], selectedMonths: 1, loading: true },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(true)
    })
  })

  describe('net value styling', () => {
    it('applies success color for positive net', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-success').exists()).toBe(true)
    })

    it('applies alert color for negative net', () => {
      const negativeProjection: CashFlowProjection[] = [
        {
          month: '2026/02',
          income: '25000.00',
          expense: '80000.00',
          net: '-55000.00',
          cumulative_balance: '-55000.00',
        },
      ]

      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: negativeProjection, selectedMonths: 1 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })
  })

  describe('cumulative balance styling', () => {
    it('applies success color for positive balance', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 3 },
        global: { stubs: defaultStubs },
      })

      const successElements = wrapper.findAll('.text-theme-success')
      expect(successElements.length).toBeGreaterThan(0)
    })

    it('applies alert color for negative balance', () => {
      const negativeProjection: CashFlowProjection[] = [
        {
          month: '2026/02',
          income: '25000.00',
          expense: '80000.00',
          net: '-55000.00',
          cumulative_balance: '-55000.00',
        },
      ]

      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: negativeProjection, selectedMonths: 1 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })
  })

  describe('different month selections', () => {
    it('displays correct header for 1 month', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: {
          projections: [mockProjections[0]],
          selectedMonths: 1,
        },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('多月預測 (1 個月)')
    })

    it('displays correct header for 6 months', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 6 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('多月預測 (6 個月)')
    })

    it('displays correct header for 12 months', () => {
      const wrapper = mount(CashFlowProjectionTable, {
        props: { projections: mockProjections, selectedMonths: 12 },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('多月預測 (12 個月)')
    })
  })
})
