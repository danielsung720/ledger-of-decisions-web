import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RecurringExpenseRow from '~/components/recurring/RecurringExpenseRow.vue'
import type { RecurringExpense } from '~/types/recurring-expense'

describe('RecurringExpenseRow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 2, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockRecurringExpense: RecurringExpense = {
    id: 1,
    name: 'Monthly Rent',
    amount: 15000,
    amount_display: '$15,000',
    currency: 'TWD',
    category: 'living',
    frequency_type: 'monthly',
    frequency_day: 1,
    frequency_display: '每月 1 號',
    default_intent: 'necessity',
    default_confidence_level: null,
    is_active: true,
    next_occurrence: '2024-04-01',
    expenses_count: 12,
    start_date: '2023-01-01',
    end_date: null,
    created_at: '2023-01-01T00:00:00',
    updated_at: '2024-03-15T00:00:00',
  }

  const defaultStubs = {
    PencilIcon: true,
    TrashIcon: true,
    PlayIcon: true,
    PauseIcon: true,
    ClockIcon: true,
    DocumentDuplicateIcon: true,
    AppIcon: {
      props: ['name'],
      template: '<span>{{ name }}</span>',
    },
  }

  describe('rendering', () => {
    it('renders expense name', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Monthly Rent')
    })

    it('renders category icon', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('home')
    })

    it('renders amount display', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('$15,000')
    })

    it('renders currency', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('TWD')
    })

    it('renders frequency display', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('每月 1 號')
    })

    it('renders expenses count', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('12 筆記錄')
    })
  })

  describe('intent tag', () => {
    it('renders intent tag when default intent set', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('必要')
    })

    it('does not render intent tag when no default intent', () => {
      const expenseWithoutIntent = { ...mockRecurringExpense, default_intent: null }
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: expenseWithoutIntent },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).not.toContain('必要')
      expect(wrapper.text()).not.toContain('享樂')
      expect(wrapper.text()).not.toContain('衝動')
    })
  })

  describe('active status', () => {
    it('does not show inactive tag when active', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).not.toContain('已停用')
    })

    it('shows inactive tag when not active', () => {
      const inactiveExpense = { ...mockRecurringExpense, is_active: false }
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: inactiveExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('已停用')
    })

    it('applies opacity class when inactive', () => {
      const inactiveExpense = { ...mockRecurringExpense, is_active: false }
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: inactiveExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.opacity-75').exists()).toBe(true)
    })
  })

  describe('next occurrence', () => {
    it('renders next occurrence date when active', () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      // Should show April 1
      expect(wrapper.text()).toMatch(/4月.*1日/)
    })

    it('shows ended text when no next occurrence', () => {
      const endedExpense = { ...mockRecurringExpense, next_occurrence: null }
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: endedExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('已結束')
    })

    it('applies alert color when expiring soon', () => {
      const soonExpense = {
        ...mockRecurringExpense,
        next_occurrence: '2024-03-17', // 2 days from now
      }
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: soonExpense },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits edit when edit button clicked', async () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      const editButton = wrapper.find('button[title="編輯"]')
      await editButton.trigger('click')

      expect(wrapper.emitted('edit')).toHaveLength(1)
      expect(wrapper.emitted('edit')?.[0]).toEqual([mockRecurringExpense])
    })

    it('emits delete when delete button clicked', async () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      const deleteButton = wrapper.find('button[title="刪除"]')
      await deleteButton.trigger('click')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockRecurringExpense])
    })

    it('emits toggleActive when toggle button clicked', async () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      const toggleButton = wrapper.find('button[title="停用"]')
      await toggleButton.trigger('click')

      expect(wrapper.emitted('toggleActive')).toHaveLength(1)
      expect(wrapper.emitted('toggleActive')?.[0]).toEqual([mockRecurringExpense])
    })

    it('emits generate when generate button clicked', async () => {
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: mockRecurringExpense },
        global: { stubs: defaultStubs },
      })

      const generateButton = wrapper.find('button[title="手動生成"]')
      await generateButton.trigger('click')

      expect(wrapper.emitted('generate')).toHaveLength(1)
      expect(wrapper.emitted('generate')?.[0]).toEqual([mockRecurringExpense])
    })
  })

  describe('inactive state actions', () => {
    it('shows play icon instead of pause when inactive', () => {
      const inactiveExpense = { ...mockRecurringExpense, is_active: false }
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: inactiveExpense },
        global: { stubs: defaultStubs },
      })

      const enableButton = wrapper.find('button[title="啟用"]')
      expect(enableButton.exists()).toBe(true)
    })

    it('does not show generate button when inactive', () => {
      const inactiveExpense = { ...mockRecurringExpense, is_active: false }
      const wrapper = mount(RecurringExpenseRow, {
        props: { recurringExpense: inactiveExpense },
        global: { stubs: defaultStubs },
      })

      const generateButton = wrapper.find('button[title="手動生成"]')
      expect(generateButton.exists()).toBe(false)
    })
  })
})
