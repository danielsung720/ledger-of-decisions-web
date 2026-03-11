import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IncomeTable from '~/components/cashflow/IncomeTable.vue'
import type { Income } from '~/types/cashflow'

describe('IncomeTable', () => {
  const mockIncome: Income = {
    id: 1,
    name: '薪資',
    amount: '80000.00',
    amount_display: 'NT$80,000',
    currency: 'TWD',
    frequency_type: 'monthly',
    frequency_type_label: '每月',
    frequency_interval: 1,
    frequency_display: '每月',
    start_date: '2026-01-01',
    end_date: null,
    note: '本薪',
    is_active: true,
    monthly_amount: '80000.00',
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-01-01T00:00:00',
  }

  const defaultStubs = {
    PencilIcon: true,
    TrashIcon: true,
    AppSpinner: true,
  }

  describe('rendering', () => {
    it('renders table header', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('收入項目')
    })

    it('renders income name', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('薪資')
    })

    it('renders amount display', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('NT$80,000')
    })

    it('renders frequency display', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('每月')
    })

    it('renders monthly amount', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('$80,000')
    })

    it('renders note when present', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('本薪')
    })

    it('renders total row', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('小計')
    })
  })

  describe('empty state', () => {
    it('shows empty message when no incomes', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('尚無收入項目')
    })
  })

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [], loading: true },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(true)
    })
  })

  describe('inactive status', () => {
    it('applies opacity class when inactive', () => {
      const inactiveIncome = { ...mockIncome, is_active: false }
      const wrapper = mount(IncomeTable, {
        props: { incomes: [inactiveIncome] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.opacity-50').exists()).toBe(true)
    })

    it('excludes inactive from total calculation', () => {
      const activeIncome = { ...mockIncome, monthly_amount: '80000.00' }
      const inactiveIncome = {
        ...mockIncome,
        id: 2,
        is_active: false,
        monthly_amount: '20000.00',
      }

      const wrapper = mount(IncomeTable, {
        props: { incomes: [activeIncome, inactiveIncome] },
        global: { stubs: defaultStubs },
      })

      // Total should only include active income (80000)
      const rows = wrapper.findAll('tr')
      const totalRow = rows[rows.length - 1]
      expect(totalRow.text()).toContain('$80,000')
    })
  })

  describe('events', () => {
    it('emits edit when edit button clicked', async () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      const editButton = wrapper.find('button[title="編輯"]')
      await editButton.trigger('click')

      expect(wrapper.emitted('edit')).toHaveLength(1)
      expect(wrapper.emitted('edit')?.[0]).toEqual([mockIncome])
    })

    it('emits delete when delete button clicked', async () => {
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome] },
        global: { stubs: defaultStubs },
      })

      const deleteButton = wrapper.find('button[title="刪除"]')
      await deleteButton.trigger('click')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockIncome])
    })
  })

  describe('multiple incomes', () => {
    it('renders all incomes', () => {
      const income2 = { ...mockIncome, id: 2, name: '年終獎金' }
      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome, income2] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('薪資')
      expect(wrapper.text()).toContain('年終獎金')
    })

    it('calculates correct total', () => {
      const income2 = {
        ...mockIncome,
        id: 2,
        name: '年終獎金',
        monthly_amount: '20000.00',
      }

      const wrapper = mount(IncomeTable, {
        props: { incomes: [mockIncome, income2] },
        global: { stubs: defaultStubs },
      })

      // Total should be 100,000
      const rows = wrapper.findAll('tr')
      const totalRow = rows[rows.length - 1]
      expect(totalRow.text()).toContain('$100,000')
    })
  })
})
