<script setup lang="ts">
import { format } from 'date-fns'
import type { Income, CashFlowFrequencyType } from '~/types/cashflow'
import { CASH_FLOW_FREQUENCY_TYPE_OPTIONS } from '~/utils/constants'

interface Props {
  income?: Income | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  income: null,
  loading: false,
})

interface IncomeFormData {
  name: string
  amount: number
  frequency_type: CashFlowFrequencyType
  frequency_interval: number
  start_date: string
  end_date: string | null
  note: string | null
}

const emit = defineEmits<{
  submit: [data: IncomeFormData]
  cancel: []
}>()

// Form data
const formData = reactive({
  name: props.income?.name ?? '',
  amount: props.income ? parseFloat(props.income.amount) : (null as number | null),
  frequency_type: (props.income?.frequency_type ?? 'monthly') as CashFlowFrequencyType,
  frequency_interval: props.income?.frequency_interval ?? 1,
  start_date: props.income?.start_date ?? format(new Date(), 'yyyy-MM-dd'),
  end_date: props.income?.end_date ?? (null as string | null),
  note: props.income?.note ?? '',
})

// Validation errors
const errors = ref<Record<string, string>>({})

// Options for selects
const frequencyTypeOptions = CASH_FLOW_FREQUENCY_TYPE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}))

// Show frequency interval only for monthly/yearly
const showFrequencyInterval = computed(() => formData.frequency_type !== 'one_time')

// Validate form
function validate(): boolean {
  errors.value = {}

  if (!formData.name.trim()) {
    errors.value.name = '請輸入收入名稱'
  }

  if (!formData.amount || formData.amount <= 0) {
    errors.value.amount = '請輸入有效金額'
  }

  if (!formData.start_date) {
    errors.value.start_date = '請選擇開始日期'
  }

  if (formData.end_date && formData.end_date < formData.start_date) {
    errors.value.end_date = '結束日期必須在開始日期之後'
  }

  return Object.keys(errors.value).length === 0
}

// Handle form submission
function handleSubmit() {
  if (!validate()) return

  emit('submit', {
    name: formData.name,
    amount: formData.amount ?? 0,
    frequency_type: formData.frequency_type,
    frequency_interval: showFrequencyInterval.value ? formData.frequency_interval : 1,
    start_date: formData.start_date,
    end_date: formData.end_date || null,
    note: formData.note || null,
  })
}

// Watch for income prop changes (when editing)
watch(
  () => props.income,
  (income) => {
    if (income) {
      formData.name = income.name
      formData.amount = parseFloat(income.amount)
      formData.frequency_type = income.frequency_type
      formData.frequency_interval = income.frequency_interval
      formData.start_date = income.start_date
      formData.end_date = income.end_date
      formData.note = income.note ?? ''
    }
  }
)
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Name -->
    <AppInput
      v-model="formData.name"
      type="text"
      label="名稱"
      placeholder="例如：薪資、年終獎金"
      required
      :error="errors.name ?? ''"
    />

    <!-- Amount -->
    <AppInput
      v-model="formData.amount"
      type="number"
      label="金額"
      placeholder="0"
      prefix="$"
      suffix="TWD"
      required
      :error="errors.amount ?? ''"
    />

    <hr class="border-theme-border" />

    <!-- Frequency Type -->
    <AppSelect
      v-model="formData.frequency_type"
      :options="frequencyTypeOptions"
      label="週期類型"
      required
    />

    <!-- Frequency Interval -->
    <AppInput
      v-if="showFrequencyInterval"
      v-model="formData.frequency_interval"
      type="number"
      label="間隔"
      :placeholder="formData.frequency_type === 'monthly' ? '每 N 月' : '每 N 年'"
      :min="1"
      :max="100"
    />

    <hr class="border-theme-border" />

    <!-- Start Date -->
    <AppDatePicker
      v-model="formData.start_date"
      label="開始日期"
      required
      :error="errors.start_date ?? ''"
    />

    <!-- End Date -->
    <AppDatePicker
      :model-value="formData.end_date ?? ''"
      label="結束日期（選填）"
      :error="errors.end_date ?? ''"
      @update:model-value="formData.end_date = $event || null"
    />

    <!-- Note -->
    <AppTextarea
      v-model="formData.note"
      label="備註（選填）"
      placeholder="記錄這筆收入的細節..."
      :max-length="500"
    />

    <!-- Actions -->
    <div class="flex gap-3 pt-4">
      <AppButton
        variant="secondary"
        type="button"
        class="flex-1"
        :disabled="loading"
        @click="emit('cancel')"
      >
        取消
      </AppButton>
      <AppButton variant="primary" type="submit" class="flex-1" :loading="loading">
        {{ income ? '更新' : '儲存' }}
      </AppButton>
    </div>
  </form>
</template>
