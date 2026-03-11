import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import RecurringExpenseForm from '~/components/recurring/RecurringExpenseForm.vue'
import type { RecurringExpense } from '~/types/recurring-expense'

describe('RecurringExpenseForm', () => {
  const AppInputStub = defineComponent({
    props: ['modelValue', 'type', 'label', 'placeholder', 'prefix', 'suffix', 'required', 'error'],
    template: '<input />',
  })
  const AppSelectStub = defineComponent({
    props: ['modelValue', 'options', 'label', 'placeholder', 'required', 'error'],
    template: '<select />',
  })
  const AppDatePickerStub = defineComponent({
    props: ['modelValue', 'label', 'required', 'maxDate', 'error'],
    template: '<input type="date" />',
  })
  const AppTextareaStub = defineComponent({
    props: ['modelValue', 'label', 'placeholder', 'maxLength'],
    template: '<textarea />',
  })
  const AppButtonStub = defineComponent({
    props: ['variant', 'type', 'loading', 'disabled'],
    emits: ['click'],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  })

  it('resets form data when switching from edit recurring expense to create mode', async () => {
    const recurringExpense: RecurringExpense = {
      id: 9,
      name: 'Legacy Recurring',
      amount_min: '880',
      amount_max: '1200',
      amount_display: '$880 - $1200',
      currency: 'TWD',
      category: 'living',
      category_label: '生活',
      frequency_type: 'monthly',
      frequency_type_label: '每月',
      frequency_interval: 2,
      frequency_display: '每 2 個月',
      day_of_month: 15,
      month_of_year: null,
      day_of_week: null,
      start_date: '2026-02-01',
      end_date: '2026-12-31',
      next_occurrence: null,
      default_intent: 'necessity',
      default_intent_label: '必要',
      note: 'legacy note',
      is_active: true,
      has_amount_range: true,
      created_at: '2026-02-01T00:00:00',
      updated_at: '2026-02-15T00:00:00',
    }

    const wrapper = mount(RecurringExpenseForm, {
      props: { recurringExpense },
      global: {
        stubs: {
          AppInput: AppInputStub,
          AppSelect: AppSelectStub,
          AppDatePicker: AppDatePickerStub,
          AppTextarea: AppTextareaStub,
          AppButton: AppButtonStub,
        },
      },
    })

    const vm = wrapper.vm as unknown as {
      formData: {
        name: string
        amount_min: number | null
        amount_max: number | null
        category: string | null
        frequency_type: string
        frequency_interval: number
        day_of_month: number | null
        month_of_year: number | null
        day_of_week: number | null
        start_date: string
        end_date: string | null
        default_intent: string | null
        note: string
      }
      showAmountRange: boolean
    }

    expect(vm.formData.name).toBe('Legacy Recurring')
    expect(vm.formData.amount_min).toBe(880)
    expect(vm.formData.amount_max).toBe(1200)
    expect(vm.formData.note).toBe('legacy note')
    expect(vm.formData.default_intent).toBe('necessity')
    expect(vm.showAmountRange).toBe(true)

    await wrapper.setProps({ recurringExpense: null })

    expect(vm.formData.name).toBe('')
    expect(vm.formData.amount_min).toBe(null)
    expect(vm.formData.amount_max).toBe(null)
    expect(vm.formData.category).toBe(null)
    expect(vm.formData.frequency_type).toBe('monthly')
    expect(vm.formData.frequency_interval).toBe(1)
    expect(vm.formData.day_of_month).toBe(null)
    expect(vm.formData.month_of_year).toBe(null)
    expect(vm.formData.day_of_week).toBe(null)
    expect(vm.formData.end_date).toBe(null)
    expect(vm.formData.default_intent).toBe(null)
    expect(vm.formData.note).toBe('')
    expect(vm.showAmountRange).toBe(false)
    expect(vm.formData.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
