import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CashFlowItemForm from '~/components/cashflow/CashFlowItemForm.vue'

const AppInputStub = {
  props: [
    'modelValue',
    'label',
    'error',
    'type',
    'placeholder',
    'prefix',
    'suffix',
    'required',
    'disabled',
    'min',
    'max',
  ],
  emits: ['update:modelValue'],
  template: `
    <div>
      <input
        :data-label="label"
        :type="type || 'text'"
        :value="modelValue ?? ''"
        @input="$emit('update:modelValue', $event.target.value)"
      >
      <p v-if="error">{{ error }}</p>
    </div>
  `,
}

const AppSelectStub = {
  props: ['modelValue', 'label', 'options', 'error', 'placeholder', 'required'],
  emits: ['update:modelValue'],
  template: `
    <div>
      <select :data-label="label" :value="modelValue ?? ''" @change="$emit('update:modelValue', $event.target.value || null)">
        <option value="">請選擇</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <p v-if="error">{{ error }}</p>
    </div>
  `,
}

const AppDatePickerStub = {
  props: ['modelValue', 'label', 'error'],
  emits: ['update:modelValue'],
  template: `
    <div>
      <input
        :data-label="label"
        type="date"
        :value="modelValue ?? ''"
        @input="$emit('update:modelValue', $event.target.value)"
      >
      <p v-if="error">{{ error }}</p>
    </div>
  `,
}

const AppTextareaStub = {
  props: ['modelValue', 'label'],
  emits: ['update:modelValue'],
  template: `
    <textarea :data-label="label" :value="modelValue ?? ''" @input="$emit('update:modelValue', $event.target.value)" />
  `,
}

const AppButtonStub = {
  template: '<button type="button"><slot /></button>',
}

function mountForm() {
  return mount(CashFlowItemForm, {
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
}

describe('CashFlowItemForm', () => {
  it('validates required category before submit', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[data-label="名稱"]').setValue('房租')
    await wrapper.get('input[data-label="金額"]').setValue('25000')
    await wrapper.get('input[data-label="開始日期"]').setValue('2026-02-01')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeFalsy()
    expect(wrapper.text()).toContain('請選擇消費分類')
  })

  it('validates end_date should be after start_date', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[data-label="名稱"]').setValue('房租')
    await wrapper.get('input[data-label="金額"]').setValue('25000')
    await wrapper.get('select[data-label="消費分類"]').setValue('living')
    await wrapper.get('input[data-label="開始日期"]').setValue('2026-02-10')
    await wrapper.get('input[data-label="結束日期（選填）"]').setValue('2026-02-01')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeFalsy()
    expect(wrapper.text()).toContain('結束日期必須在開始日期之後')
  })

  it('normalizes frequency_interval to 1 for one_time frequency', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[data-label="名稱"]').setValue('一次性家電')
    await wrapper.get('input[data-label="金額"]').setValue('8000')
    await wrapper.get('select[data-label="消費分類"]').setValue('living')
    await wrapper.get('select[data-label="週期類型"]').setValue('monthly')
    await wrapper.get('input[data-label="間隔"]').setValue('5')
    await wrapper.get('select[data-label="週期類型"]').setValue('one_time')
    await wrapper.get('input[data-label="開始日期"]').setValue('2026-02-01')
    await wrapper.get('form').trigger('submit.prevent')

    const payload = wrapper.emitted('submit')?.[0]?.[0] as
      | { frequency_interval: number }
      | undefined
    expect(payload).toBeTruthy()
    expect(payload?.frequency_interval).toBe(1)
  })

  it('validates frequency_interval must be at least 1 for recurring types', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[data-label="名稱"]').setValue('生活費')
    await wrapper.get('input[data-label="金額"]').setValue('3000')
    await wrapper.get('select[data-label="消費分類"]').setValue('living')
    await wrapper.get('select[data-label="週期類型"]').setValue('monthly')
    await wrapper.get('input[data-label="間隔"]').setValue('0')
    await wrapper.get('input[data-label="開始日期"]').setValue('2026-02-01')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeFalsy()
    expect(wrapper.text()).toContain('間隔必須至少為 1')
  })

  it('validates amount upper bound', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[data-label="名稱"]').setValue('超額費用')
    await wrapper.get('input[data-label="金額"]').setValue('1000000000')
    await wrapper.get('select[data-label="消費分類"]').setValue('living')
    await wrapper.get('input[data-label="開始日期"]').setValue('2026-02-01')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeFalsy()
    expect(wrapper.text()).toContain('金額不可超過 999,999,999')
  })

  it('validates name max length and trims name/note before submit', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[data-label="名稱"]').setValue('a'.repeat(101))
    await wrapper.get('input[data-label="金額"]').setValue('3000')
    await wrapper.get('select[data-label="消費分類"]').setValue('living')
    await wrapper.get('input[data-label="開始日期"]').setValue('2026-02-01')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeFalsy()
    expect(wrapper.text()).toContain('名稱不可超過 100 個字')

    await wrapper.get('input[data-label="名稱"]').setValue('  房租  ')
    await wrapper.get('textarea[data-label="備註（選填）"]').setValue('   ')
    await wrapper.get('form').trigger('submit.prevent')

    const payload = wrapper.emitted('submit')?.[0]?.[0] as
      | { name: string; note: string | null }
      | undefined
    expect(payload).toBeTruthy()
    expect(payload?.name).toBe('房租')
    expect(payload?.note).toBeNull()
  })
})
