<script setup lang="ts">
import type { RecurringExpense } from '~/types/recurring-expense'
import type { RecurringExpenseFormData } from '~/utils/validation'
import {
  toCreateRecurringExpenseRequest,
  toUpdateRecurringExpenseRequest,
} from '~/utils/recurring-expense-payload'
import { useRecurringExpenses } from '~/composables/useRecurringExpenses'
import { useRecurringExpenseStore } from '~/stores/recurring-expense'

interface Props {
  open: boolean
  recurringExpenseId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  recurringExpenseId: null,
})

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useRecurringExpenseStore()
const { createRecurringExpense, updateRecurringExpense } = useRecurringExpenses()

const loading = ref(false)
const recurringExpense = ref<RecurringExpense | null>(null)

const isEditing = computed(() => !!props.recurringExpenseId)
const modalTitle = computed(() => (isEditing.value ? '編輯固定支出' : '新增固定支出'))

// Load recurring expense data when editing
watch(
  () => props.recurringExpenseId,
  async (id) => {
    if (id) {
      loading.value = true
      try {
        recurringExpense.value = await store.fetchRecurringExpenseById(id)
      } catch {
        emit('close')
      } finally {
        loading.value = false
      }
    } else {
      recurringExpense.value = null
    }
  },
  { immediate: true }
)

async function handleSubmit(data: RecurringExpenseFormData) {
  loading.value = true

  try {
    if (isEditing.value && props.recurringExpenseId) {
      await updateRecurringExpense(props.recurringExpenseId, toUpdateRecurringExpenseRequest(data))
    } else {
      await createRecurringExpense(toCreateRecurringExpenseRequest(data))
    }
    emit('saved')
    emit('close')
  } catch {
    // Keep modal open so users can adjust data and retry.
  } finally {
    loading.value = false
  }
}

function handleClose() {
  if (!loading.value) {
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" :title="modalTitle" size="lg" :closeable="!loading" @close="handleClose">
    <div v-if="loading && isEditing" class="flex items-center justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <RecurringExpenseForm
      v-else
      :recurring-expense="recurringExpense"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>
