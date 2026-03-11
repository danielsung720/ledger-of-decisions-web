import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ExpenseForm from '~/components/expense/ExpenseForm.vue'
import type { Expense } from '~/types'

describe('ExpenseForm', () => {
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
  const IntentSelectorStub = defineComponent({
    props: ['modelValue', 'error'],
    template: '<div />',
  })
  const ConfidenceSelectorStub = defineComponent({
    props: ['modelValue'],
    template: '<div />',
  })
  const AppButtonStub = defineComponent({
    props: ['variant', 'type', 'loading', 'disabled'],
    emits: ['click'],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  })

  it('resets form data when switching from edit expense to create mode', async () => {
    const expense: Expense = {
      id: 9,
      amount: '880',
      currency: 'TWD',
      category: 'food',
      category_label: '飲食',
      occurred_at: '2026-02-15 10:00:00',
      note: 'legacy note',
      decision: {
        id: 3,
        expense_id: 9,
        intent: 'necessity',
        intent_label: '必要',
        confidence_level: 'high',
        confidence_level_label: '很滿意',
        decision_note: 'legacy decision note',
        created_at: '2026-02-15 10:00:00',
        updated_at: '2026-02-15 10:00:00',
      },
      created_at: '2026-02-15 10:00:00',
      updated_at: '2026-02-15 10:00:00',
    }

    const wrapper = mount(ExpenseForm, {
      props: { expense },
      global: {
        stubs: {
          AppInput: AppInputStub,
          AppSelect: AppSelectStub,
          AppDatePicker: AppDatePickerStub,
          AppTextarea: AppTextareaStub,
          AppButton: AppButtonStub,
          IntentSelector: IntentSelectorStub,
          ConfidenceSelector: ConfidenceSelectorStub,
        },
      },
    })

    const vm = wrapper.vm as unknown as {
      formData: {
        amount: number | null
        category: string | null
        occurred_at: string
        note: string
        intent: string | null
        confidence_level: string | null
        decision_note: string
      }
    }

    expect(vm.formData.amount).toBe(880)
    expect(vm.formData.note).toBe('legacy note')
    expect(vm.formData.intent).toBe('necessity')
    expect(vm.formData.confidence_level).toBe('high')
    expect(vm.formData.decision_note).toBe('legacy decision note')

    await wrapper.setProps({ expense: null })

    expect(vm.formData.amount).toBe(null)
    expect(vm.formData.category).toBe(null)
    expect(vm.formData.note).toBe('')
    expect(vm.formData.intent).toBe(null)
    expect(vm.formData.confidence_level).toBe(null)
    expect(vm.formData.decision_note).toBe('')
    expect(vm.formData.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})
