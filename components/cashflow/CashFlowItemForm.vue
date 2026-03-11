<script setup lang="ts">
import { format, isBefore, isValid, parseISO } from 'date-fns'
import { z } from 'zod'
import type { Category } from '~/types'
import type { CashFlowItem, CashFlowFrequencyType } from '~/types/cashflow'
import { CATEGORY_OPTIONS, CASH_FLOW_FREQUENCY_TYPE_OPTIONS } from '~/utils/constants'

interface Props {
  item?: CashFlowItem | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  loading: false,
})

interface CashFlowItemFormData {
  name: string
  amount: number
  category: Category
  frequency_type: CashFlowFrequencyType
  frequency_interval: number
  start_date: string
  end_date: string | null
  note: string | null
}

const MAX_AMOUNT = 999999999
const MAX_NAME_LENGTH = 100

const baseValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '請輸入項目名稱')
    .max(MAX_NAME_LENGTH, `名稱不可超過 ${MAX_NAME_LENGTH} 個字`),
  amount: z.preprocess(
    (value) => Number(value),
    z
      .number()
      .positive('請輸入有效金額')
      .max(MAX_AMOUNT, `金額不可超過 ${MAX_AMOUNT.toLocaleString()}`)
  ),
  category: z.custom<Category | null>((value) => !!value, {
    message: '請選擇消費分類',
  }),
  start_date: z.string().trim().min(1, '請選擇開始日期'),
})

const emit = defineEmits<{
  submit: [data: CashFlowItemFormData]
  cancel: []
}>()

// Form data
const formData = reactive({
  name: props.item?.name ?? '',
  amount: props.item ? parseFloat(props.item.amount) : (null as number | null),
  category: (props.item?.category ?? null) as Category | null,
  frequency_type: (props.item?.frequency_type ?? 'monthly') as CashFlowFrequencyType,
  frequency_interval: props.item?.frequency_interval ?? 1,
  start_date: props.item?.start_date ?? format(new Date(), 'yyyy-MM-dd'),
  end_date: props.item?.end_date ?? (null as string | null),
  note: props.item?.note ?? '',
})

// Validation errors
const errors = ref<Record<string, string>>({})

// Options for selects
const categoryOptions = CATEGORY_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
  icon: opt.icon,
}))

const frequencyTypeOptions = CASH_FLOW_FREQUENCY_TYPE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}))

// Show frequency interval only for monthly/yearly
const showFrequencyInterval = computed(() => formData.frequency_type !== 'one_time')

// Validate form
function validate(): boolean {
  errors.value = {}

  const result = baseValidationSchema.safeParse({
    name: formData.name,
    amount: formData.amount,
    category: formData.category,
    start_date: formData.start_date,
  })

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !errors.value[field]) {
        errors.value[field] = issue.message
      }
    }
  }

  if (showFrequencyInterval.value) {
    const interval = Number(formData.frequency_interval)
    if (!Number.isInteger(interval) || interval < 1) {
      errors.value.frequency_interval = '間隔必須至少為 1'
    }
  }

  if (formData.end_date) {
    const startDate = parseISO(formData.start_date)
    const endDate = parseISO(formData.end_date)
    if (!isValid(startDate) || !isValid(endDate) || isBefore(endDate, startDate)) {
      errors.value.end_date = '結束日期必須在開始日期之後'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Handle form submission
function handleSubmit() {
  if (!validate()) return
  if (!formData.category) return

  const normalizedName = formData.name.trim()
  const normalizedNote = formData.note?.trim() ?? ''

  emit('submit', {
    name: normalizedName,
    amount: Number(formData.amount) || 0,
    category: formData.category,
    frequency_type: formData.frequency_type,
    frequency_interval: showFrequencyInterval.value ? Number(formData.frequency_interval) || 1 : 1,
    start_date: formData.start_date,
    end_date: formData.end_date || null,
    note: normalizedNote || null,
  })
}

// Watch for item prop changes (when editing)
watch(
  () => props.item,
  (item) => {
    if (item) {
      formData.name = item.name
      formData.amount = parseFloat(item.amount)
      formData.category = item.category
      formData.frequency_type = item.frequency_type
      formData.frequency_interval = item.frequency_interval
      formData.start_date = item.start_date
      formData.end_date = item.end_date
      formData.note = item.note ?? ''
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
      placeholder="例如：房租、電費"
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

    <!-- Category -->
    <AppSelect
      v-model="formData.category"
      :options="categoryOptions"
      label="消費分類"
      placeholder="請選擇分類"
      required
      :error="errors.category ?? ''"
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
      :error="errors.frequency_interval ?? ''"
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
      placeholder="記錄這筆支出的細節..."
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
        {{ item ? '更新' : '儲存' }}
      </AppButton>
    </div>
  </form>
</template>
