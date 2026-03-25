<script setup lang="ts">
import { format } from 'date-fns'
import type { Category, ConfidenceLevel, Intent, Expense } from '~/types'
import { CATEGORY_OPTIONS } from '~/utils/constants'
import { expenseFormSchema, type ExpenseFormData } from '~/utils/validation'
import { useFormValidation } from '~/composables/useFormValidation'

interface Props {
  expense?: Expense | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  expense: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: ExpenseFormData]
  cancel: []
}>()

const formRef = ref<HTMLFormElement | null>(null)

function getDefaultOccurredAt(): string {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
}

const formData = reactive({
  amount: null as number | null,
  category: null as Category | null,
  occurred_at: getDefaultOccurredAt(),
  note: '',
  intent: null as Intent | null,
  confidence_level: null as ConfidenceLevel | null,
  decision_note: '',
})

function applyExpenseToForm(expense: Expense) {
  formData.amount = parseFloat(expense.amount)
  formData.category = expense.category
  formData.occurred_at = expense.occurred_at
  formData.note = expense.note ?? ''
  formData.intent = expense.decision?.intent ?? null
  formData.confidence_level = expense.decision?.confidence_level ?? null
  formData.decision_note = expense.decision?.decision_note ?? ''
}

function resetFormData() {
  formData.amount = null
  formData.category = null
  formData.occurred_at = getDefaultOccurredAt()
  formData.note = ''
  formData.intent = null
  formData.confidence_level = null
  formData.decision_note = ''
}

// Validation
const { validate, getError } = useFormValidation<ExpenseFormData>()
const maxOccurredDate = new Date()

// Category options for select
const categoryOptions = CATEGORY_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
  icon: opt.icon,
}))

const FOCUSABLE_SELECTOR =
  'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

async function scrollToFirstErrorField() {
  await nextTick()

  const firstErrorField = formRef.value?.querySelector<HTMLElement>(
    '[data-error-field][aria-invalid="true"]'
  )

  if (!firstErrorField) {
    return
  }

  firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const focusTarget = firstErrorField.matches(FOCUSABLE_SELECTOR)
    ? firstErrorField
    : firstErrorField.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)

  if (focusTarget) {
    focusTarget.focus()
    return
  }

  firstErrorField.focus()
}

// Handle form submission
async function handleSubmit() {
  const dataToValidate = {
    ...formData,
    amount: formData.amount ?? 0,
    category: formData.category || undefined,
    intent: formData.intent || undefined,
    note: formData.note || null,
    confidence_level: formData.confidence_level || null,
    decision_note: formData.decision_note || null,
  }

  const isValid = validate(expenseFormSchema, dataToValidate)

  if (isValid) {
    emit('submit', dataToValidate as ExpenseFormData)
    return
  }

  await scrollToFirstErrorField()
}

// Watch for expense prop changes (when editing)
watch(
  () => props.expense,
  (expense) => {
    if (expense) {
      applyExpenseToForm(expense)
      return
    }

    resetFormData()
  },
  { immediate: true }
)
</script>

<template>
  <form ref="formRef" class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Amount -->
    <div
      data-error-field="amount"
      :aria-invalid="getError('amount') ? 'true' : 'false'"
      tabindex="-1"
    >
      <AppInput
        v-model="formData.amount"
        type="number"
        label="金額"
        placeholder="0"
        prefix="$"
        suffix="TWD"
        required
        :error="getError('amount')"
      />
    </div>

    <!-- Category -->
    <div
      data-error-field="category"
      :aria-invalid="getError('category') ? 'true' : 'false'"
      tabindex="-1"
    >
      <AppSelect
        v-model="formData.category"
        :options="categoryOptions"
        label="消費分類"
        placeholder="請選擇分類"
        required
        :error="getError('category')"
      />
    </div>

    <!-- Date -->
    <div
      data-error-field="occurred_at"
      :aria-invalid="getError('occurred_at') ? 'true' : 'false'"
      tabindex="-1"
    >
      <AppDatePicker
        v-model="formData.occurred_at"
        label="消費日期"
        required
        :max-date="maxOccurredDate"
        :error="getError('occurred_at')"
      />
    </div>

    <!-- Note -->
    <div data-error-field="note" :aria-invalid="getError('note') ? 'true' : 'false'" tabindex="-1">
      <AppTextarea
        v-model="formData.note"
        label="備註（選填）"
        placeholder="記錄消費的細節..."
        :max-length="500"
      />
    </div>

    <hr class="border-theme-border" />

    <!-- Intent -->
    <div
      data-error-field="intent"
      :aria-invalid="getError('intent') ? 'true' : 'false'"
      tabindex="-1"
    >
      <IntentSelector v-model="formData.intent" :error="getError('intent')" />
    </div>

    <!-- Confidence -->
    <div
      data-error-field="confidence_level"
      :aria-invalid="getError('confidence_level') ? 'true' : 'false'"
      tabindex="-1"
    >
      <ConfidenceSelector v-model="formData.confidence_level" />
    </div>

    <!-- Decision Note -->
    <div
      data-error-field="decision_note"
      :aria-invalid="getError('decision_note') ? 'true' : 'false'"
      tabindex="-1"
    >
      <AppTextarea
        v-model="formData.decision_note"
        label="決策備註（選填）"
        placeholder="為什麼這樣分類？"
        :max-length="1000"
      />
    </div>

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
        {{ expense ? '更新' : '儲存' }}
      </AppButton>
    </div>
  </form>
</template>
