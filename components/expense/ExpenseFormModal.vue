<script setup lang="ts">
import type { Expense } from '~/types'
import type { ExpenseFormData } from '~/utils/validation'
import { toCreateEntryRequest, toUpdateEntryRequest } from '~/utils/entry-payload'
import { useExpenses } from '~/composables/useExpenses'
import { useExpenseStore } from '~/stores/expense'

interface Props {
  open: boolean
  expenseId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  expenseId: null,
})

const emit = defineEmits<{
  close: []
  saved: []
}>()

const expenseStore = useExpenseStore()
const { createExpense, updateExpense } = useExpenses()

const loading = ref(false)
const expense = ref<Expense | null>(null)

const isEditing = computed(() => !!props.expenseId)
const modalTitle = computed(() => (isEditing.value ? '編輯消費記錄' : '新增消費記錄'))

// Load expense data when editing
watch(
  () => props.expenseId,
  async (id) => {
    if (id) {
      loading.value = true
      try {
        expense.value = await expenseStore.fetchExpenseById(id)
      } catch {
        emit('close')
      } finally {
        loading.value = false
      }
    } else {
      expense.value = null
    }
  },
  { immediate: true }
)

async function handleSubmit(data: ExpenseFormData) {
  loading.value = true

  try {
    if (isEditing.value && props.expenseId) {
      await updateExpense(props.expenseId, toUpdateEntryRequest(data))
    } else {
      await createExpense(toCreateEntryRequest(data))
    }
    emit('saved')
    emit('close')
  } catch {
    // Keep modal open so users can adjust input and retry.
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
  <AppModal
    data-testid="expense-form-modal"
    :open="open"
    :title="modalTitle"
    size="lg"
    :closeable="!loading"
    @close="handleClose"
  >
    <div v-if="loading && isEditing" class="flex items-center justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <ExpenseForm
      v-else
      :expense="expense"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>
