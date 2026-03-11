import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CashFlowItemTable from '~/components/cashflow/CashFlowItemTable.vue'
import type { CashFlowItem } from '~/types/cashflow'

describe('CashFlowItemTable', () => {
  const mockCashFlowItem: CashFlowItem = {
    id: 1,
    name: '房租',
    amount: '25000.00',
    amount_display: 'NT$25,000',
    currency: 'TWD',
    category: 'living',
    category_label: '生活',
    frequency_type: 'monthly',
    frequency_type_label: '每月',
    frequency_interval: 1,
    frequency_display: '每月',
    start_date: '2026-01-01',
    end_date: null,
    note: '台北租屋',
    is_active: true,
    monthly_amount: '25000.00',
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
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('支出項目')
    })

    it('renders item name', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('房租')
    })

    it('renders amount display', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('NT$25,000')
    })

    it('renders category label', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('生活')
    })

    it('renders monthly amount', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('$25,000')
    })

    it('renders note when present', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('台北租屋')
    })

    it('renders total row', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('小計')
    })
  })

  describe('empty state', () => {
    it('shows empty message when no items', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('尚無支出項目')
    })
  })

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [], loading: true },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(true)
    })
  })

  describe('inactive status', () => {
    it('applies opacity class when inactive', () => {
      const inactiveItem = { ...mockCashFlowItem, is_active: false }
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [inactiveItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.opacity-50').exists()).toBe(true)
    })

    it('excludes inactive from total calculation', () => {
      const activeItem = { ...mockCashFlowItem, monthly_amount: '25000.00' }
      const inactiveItem = {
        ...mockCashFlowItem,
        id: 2,
        is_active: false,
        monthly_amount: '15000.00',
      }

      const wrapper = mount(CashFlowItemTable, {
        props: { items: [activeItem, inactiveItem] },
        global: { stubs: defaultStubs },
      })

      // Total should only include active item (25000)
      const rows = wrapper.findAll('tr')
      const totalRow = rows[rows.length - 1]
      expect(totalRow.text()).toContain('$25,000')
    })
  })

  describe('events', () => {
    it('emits edit when edit button clicked', async () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      const editButton = wrapper.find('button[title="編輯"]')
      await editButton.trigger('click')

      expect(wrapper.emitted('edit')).toHaveLength(1)
      expect(wrapper.emitted('edit')?.[0]).toEqual([mockCashFlowItem])
    })

    it('emits delete when delete button clicked', async () => {
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem] },
        global: { stubs: defaultStubs },
      })

      const deleteButton = wrapper.find('button[title="刪除"]')
      await deleteButton.trigger('click')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockCashFlowItem])
    })
  })

  describe('multiple items', () => {
    it('renders all items', () => {
      const item2 = { ...mockCashFlowItem, id: 2, name: '伙食費' }
      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem, item2] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('房租')
      expect(wrapper.text()).toContain('伙食費')
    })

    it('calculates correct total', () => {
      const item2 = {
        ...mockCashFlowItem,
        id: 2,
        name: '伙食費',
        monthly_amount: '15000.00',
      }

      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem, item2] },
        global: { stubs: defaultStubs },
      })

      // Total should be 40,000
      const rows = wrapper.findAll('tr')
      const totalRow = rows[rows.length - 1]
      expect(totalRow.text()).toContain('$40,000')
    })
  })

  describe('different categories', () => {
    it('displays category labels correctly', () => {
      const foodItem: CashFlowItem = {
        ...mockCashFlowItem,
        id: 2,
        name: '伙食費',
        category: 'food',
        category_label: '飲食',
      }

      const wrapper = mount(CashFlowItemTable, {
        props: { items: [mockCashFlowItem, foodItem] },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('生活')
      expect(wrapper.text()).toContain('飲食')
    })
  })
})
