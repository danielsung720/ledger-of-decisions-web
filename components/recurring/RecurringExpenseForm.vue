<script setup lang="ts">
import { format } from 'date-fns'
import type { Category, Intent } from '~/types'
import type { RecurringExpense, FrequencyType, DayOfWeek } from '~/types/recurring-expense'
import {
  CATEGORY_OPTIONS,
  FREQUENCY_TYPE_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  MONTH_OPTIONS,
  INTENT_OPTIONS,
} from '~/utils/constants'
import type { ZodSchema } from 'zod'
import { recurringExpenseFormSchema, type RecurringExpenseFormData } from '~/utils/validation'
import { useFormValidation } from '~/composables/useFormValidation'

interface Props {
  recurringExpense?: RecurringExpense | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  recurringExpense: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: RecurringExpenseFormData]
  cancel: []
}>()

function getDefaultStartDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

const formData = reactive({
  name: '',
  amount_min: null as number | null,
  amount_max: null as number | null,
  category: null as Category | null,
  frequency_type: 'monthly' as FrequencyType,
  frequency_interval: 1,
  day_of_month: null as number | null,
  month_of_year: null as number | null,
  day_of_week: null as DayOfWeek | null,
  start_date: getDefaultStartDate(),
  end_date: null as string | null,
  default_intent: null as Intent | null,
  note: '',
})

function applyRecurringExpenseToForm(recurringExpense: RecurringExpense) {
  formData.name = recurringExpense.name
  formData.amount_min = parseFloat(recurringExpense.amount_min)
  formData.amount_max = recurringExpense.amount_max ? parseFloat(recurringExpense.amount_max) : null
  formData.category = recurringExpense.category
  formData.frequency_type = recurringExpense.frequency_type
  formData.frequency_interval = recurringExpense.frequency_interval
  formData.day_of_month = recurringExpense.day_of_month
  formData.month_of_year = recurringExpense.month_of_year
  formData.day_of_week = recurringExpense.day_of_week
  formData.start_date = recurringExpense.start_date
  formData.end_date = recurringExpense.end_date
  formData.default_intent = recurringExpense.default_intent
  formData.note = recurringExpense.note ?? ''
}

function resetFormData() {
  formData.name = ''
  formData.amount_min = null
  formData.amount_max = null
  formData.category = null
  formData.frequency_type = 'monthly'
  formData.frequency_interval = 1
  formData.day_of_month = null
  formData.month_of_year = null
  formData.day_of_week = null
  formData.start_date = getDefaultStartDate()
  formData.end_date = null
  formData.default_intent = null
  formData.note = ''
}

// Validation
const { validate, getError } = useFormValidation<RecurringExpenseFormData>()

// Options for selects
const categoryOptions = CATEGORY_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
  icon: opt.icon,
}))

const frequencyTypeOptions = FREQUENCY_TYPE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}))

const dayOfWeekOptions = DAY_OF_WEEK_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}))

const monthOptions = MONTH_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}))

const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} 日`,
}))

const intentOptions = [
  { value: null, label: '無預設' },
  ...INTENT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    icon: opt.icon,
  })),
]

// Show variable amount input
const showAmountRange = ref(false)

// Show additional schedule options based on frequency type
const showDayOfWeek = computed(() => formData.frequency_type === 'weekly')
const showDayOfMonth = computed(
  () => formData.frequency_type === 'monthly' || formData.frequency_type === 'yearly'
)
const showMonthOfYear = computed(() => formData.frequency_type === 'yearly')

// Handle form submission
function handleSubmit() {
  const dataToValidate = {
    name: formData.name,
    amount_min: formData.amount_min ?? 0,
    amount_max: showAmountRange.value ? formData.amount_max : null,
    category: formData.category || undefined,
    frequency_type: formData.frequency_type,
    frequency_interval: formData.frequency_interval,
    day_of_month: showDayOfMonth.value ? formData.day_of_month : null,
    month_of_year: showMonthOfYear.value ? formData.month_of_year : null,
    day_of_week: showDayOfWeek.value ? formData.day_of_week : null,
    start_date: formData.start_date,
    end_date: formData.end_date || null,
    default_intent: formData.default_intent || null,
    note: formData.note || null,
  }

  const isValid = validate(
    recurringExpenseFormSchema as ZodSchema<RecurringExpenseFormData>,
    dataToValidate
  )

  if (isValid) {
    emit('submit', dataToValidate as RecurringExpenseFormData)
  }
}

// Watch for recurringExpense prop changes (when editing)
watch(
  () => props.recurringExpense,
  (recurringExpense) => {
    if (recurringExpense) {
      applyRecurringExpenseToForm(recurringExpense)
      showAmountRange.value = !!recurringExpense.amount_max
      return
    }

    resetFormData()
    showAmountRange.value = false
  },
  { immediate: true }
)
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Name -->
    <AppInput
      v-model="formData.name"
      type="text"
      label="名稱"
      placeholder="例如：車貸、Netflix 訂閱"
      required
      :error="getError('name')"
    />

    <!-- Amount -->
    <div class="space-y-3">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <AppInput
            v-model="formData.amount_min"
            type="number"
            :label="showAmountRange ? '最小金額' : '金額'"
            placeholder="0"
            prefix="$"
            suffix="TWD"
            required
            :error="getError('amount_min')"
          />
        </div>
        <div v-if="showAmountRange" class="flex-1">
          <AppInput
            v-model="formData.amount_max"
            type="number"
            label="最大金額"
            placeholder="0"
            prefix="$"
            suffix="TWD"
            :error="getError('amount_max')"
          />
        </div>
      </div>

      <label class="flex cursor-pointer items-center gap-2 text-body-sm text-theme-text-secondary">
        <input
          v-model="showAmountRange"
          type="checkbox"
          class="rounded border-theme-border text-theme-primary focus:ring-theme-primary"
        />
        <span>使用金額區間（例如電費帳單）</span>
      </label>
    </div>

    <!-- Category -->
    <AppSelect
      v-model="formData.category"
      :options="categoryOptions"
      label="消費分類"
      placeholder="請選擇分類"
      required
      :error="getError('category')"
    />

    <hr class="border-theme-border" />

    <!-- Frequency Type -->
    <AppSelect
      v-model="formData.frequency_type"
      :options="frequencyTypeOptions"
      label="週期類型"
      required
      :error="getError('frequency_type')"
    />

    <!-- Frequency Interval -->
    <AppInput
      v-model="formData.frequency_interval"
      type="number"
      label="間隔"
      :placeholder="
        formData.frequency_type === 'daily'
          ? '每 N 天'
          : formData.frequency_type === 'weekly'
            ? '每 N 週'
            : formData.frequency_type === 'monthly'
              ? '每 N 月'
              : '每 N 年'
      "
      :min="1"
      :max="100"
      :error="getError('frequency_interval')"
    />

    <!-- Day of Week (for weekly) -->
    <AppSelect
      v-if="showDayOfWeek"
      v-model="formData.day_of_week"
      :options="dayOfWeekOptions"
      label="每週幾"
      placeholder="請選擇"
      :error="getError('day_of_week')"
    />

    <!-- Month of Year (for yearly) -->
    <AppSelect
      v-if="showMonthOfYear"
      v-model="formData.month_of_year"
      :options="monthOptions"
      label="每年幾月"
      placeholder="請選擇"
      :error="getError('month_of_year')"
    />

    <!-- Day of Month (for monthly and yearly) -->
    <AppSelect
      v-if="showDayOfMonth"
      v-model="formData.day_of_month"
      :options="dayOfMonthOptions"
      label="每月幾日"
      placeholder="請選擇"
      :error="getError('day_of_month')"
    />

    <hr class="border-theme-border" />

    <!-- Start Date -->
    <AppDatePicker
      v-model="formData.start_date"
      label="開始日期"
      required
      :error="getError('start_date')"
    />

    <!-- End Date -->
    <AppDatePicker
      v-model="formData.end_date as string"
      label="結束日期（選填）"
      :error="getError('end_date')"
    />

    <hr class="border-theme-border" />

    <!-- Default Intent -->
    <AppSelect
      v-model="formData.default_intent"
      :options="intentOptions"
      label="預設決策意圖（選填）"
      placeholder="無預設"
      :error="getError('default_intent')"
    />

    <!-- Note -->
    <AppTextarea
      v-model="formData.note"
      label="備註（選填）"
      placeholder="記錄這筆固定支出的細節..."
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
        {{ recurringExpense ? '更新' : '儲存' }}
      </AppButton>
    </div>
  </form>
</template>
