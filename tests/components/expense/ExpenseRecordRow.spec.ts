import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExpenseRecordRow from '~/components/expense/ExpenseRecordRow.vue'
import type { Expense } from '~/types'

describe('ExpenseRecordRow', () => {
  const global = {
    stubs: {
      AppIcon: {
        props: ['name'],
        template: '<span>{{ name }}</span>',
      },
    },
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 2, 15, 14, 30, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockExpense: Expense = {
    id: 1,
    amount: '500',
    currency: 'TWD',
    category: 'food',
    category_label: '飲食',
    occurred_at: '2024-03-15T12:00:00',
    note: 'Lunch at restaurant',
    decision: {
      id: 1,
      expense_id: 1,
      intent: 'necessity',
      intent_label: '必要',
      confidence_level: 'high',
      confidence_level_label: '很滿意',
      decision_note: null,
      created_at: '2024-03-15T12:00:00',
      updated_at: '2024-03-15T12:00:00',
    },
    created_at: '2024-03-15T12:00:00',
    updated_at: '2024-03-15T12:00:00',
  }

  describe('rendering', () => {
    it('renders category icon', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      expect(wrapper.text()).toContain('utensils')
    })

    it('renders category label', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      expect(wrapper.text()).toContain('飲食')
    })

    it('renders formatted amount', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      expect(wrapper.text()).toContain('$500')
    })

    it('renders formatted date', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      // formatSmartDate should show "今日 12:00" for today's date
      expect(wrapper.text()).toContain('今日')
    })

    it('renders note when present', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      expect(wrapper.text()).toContain('Lunch at restaurant')
    })

    it('does not render note when empty', () => {
      const expenseWithoutNote = { ...mockExpense, note: null }
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: expenseWithoutNote },
        global,
      })

      expect(wrapper.text()).not.toContain('Lunch at restaurant')
    })
  })

  describe('intent display', () => {
    it('renders intent tag when decision exists', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      expect(wrapper.text()).toContain('必要')
      expect(wrapper.text()).toContain('circle-check')
    })

    it('does not render intent tag when no decision', () => {
      const expenseWithoutDecision = { ...mockExpense, decision: null }
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: expenseWithoutDecision },
        global,
      })

      expect(wrapper.text()).not.toContain('必要')
    })
  })

  describe('confidence display', () => {
    it('renders confidence icon when present', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      expect(wrapper.text()).toContain('mood-smile')
    })

    it('does not render confidence when null', () => {
      const expenseWithoutConfidence = {
        ...mockExpense,
        decision: {
          ...mockExpense.decision!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          confidence_level: null as any,
        },
      }
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: expenseWithoutConfidence },
        global,
      })

      expect(wrapper.text()).not.toContain('mood-smile')
      expect(wrapper.text()).not.toContain('mood-neutral')
      expect(wrapper.text()).not.toContain('mood-sad')
    })
  })

  describe('recurring expense indicator', () => {
    it('shows recurring tag when from recurring expense', () => {
      const recurringExpense = {
        ...mockExpense,
        is_from_recurring: true,
        recurring_expense: { id: 1, name: 'Monthly Rent' },
      }
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: recurringExpense },
        global,
      })

      expect(wrapper.text()).toContain('固定')
    })

    it('does not show recurring tag when not from recurring', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      expect(wrapper.text()).not.toContain('固定')
    })
  })

  describe('action buttons', () => {
    it('renders edit button', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      // 3 buttons: checkbox, edit, delete
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(3)
    })

    it('renders delete button', () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      const deleteButton = wrapper.find('button.text-theme-error')
      expect(deleteButton.exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits edit event when edit button clicked', async () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      // buttons[0] is checkbox, buttons[1] is edit, buttons[2] is delete
      const editButton = wrapper.find('button[title="編輯"]')
      await editButton.trigger('click')

      expect(wrapper.emitted('edit')).toHaveLength(1)
      expect(wrapper.emitted('edit')?.[0]).toEqual([mockExpense])
    })

    it('emits delete event when delete button clicked', async () => {
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: mockExpense },
        global,
      })

      const deleteButton = wrapper.find('button.text-theme-error')
      await deleteButton.trigger('click')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockExpense])
    })
  })

  describe('different categories', () => {
    it('renders transport category correctly', () => {
      const transportExpense = { ...mockExpense, category: 'transport' as const }
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: transportExpense },
        global,
      })

      expect(wrapper.text()).toContain('car')
      expect(wrapper.text()).toContain('交通')
    })

    it('renders living category correctly', () => {
      const livingExpense = { ...mockExpense, category: 'living' as const }
      const wrapper = mount(ExpenseRecordRow, {
        props: { expense: livingExpense },
        global,
      })

      expect(wrapper.text()).toContain('home')
      expect(wrapper.text()).toContain('生活')
    })
  })
})
