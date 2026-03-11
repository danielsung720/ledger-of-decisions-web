<script setup lang="ts">
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '~/types/cashflow'
import { useCashFlow } from '~/composables/useCashFlow'
import { useCashFlowStore } from '~/stores/cashflow'

interface Props {
  open: boolean
  incomeId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  incomeId: null,
})

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useCashFlowStore()
const { createIncome, updateIncome } = useCashFlow()

const loading = ref(false)
const income = ref<Income | null>(null)

const isEditing = computed(() => !!props.incomeId)
const modalTitle = computed(() => (isEditing.value ? '編輯收入' : '新增收入'))

// Load income data when editing
watch(
  () => props.incomeId,
  async (id) => {
    if (id) {
      loading.value = true
      try {
        income.value = await store.fetchIncomeById(id)
      } catch {
        emit('close')
      } finally {
        loading.value = false
      }
    } else {
      income.value = null
    }
  },
  { immediate: true }
)

interface IncomeFormData {
  name: string
  amount: number
  frequency_type: 'monthly' | 'yearly' | 'one_time'
  frequency_interval: number
  start_date: string
  end_date: string | null
  note: string | null
}

async function handleSubmit(data: IncomeFormData) {
  loading.value = true

  const apiData: CreateIncomeRequest | UpdateIncomeRequest = {
    name: data.name,
    amount: data.amount,
    frequency_type: data.frequency_type,
    frequency_interval: data.frequency_interval,
    start_date: data.start_date,
    end_date: data.end_date || null,
    note: data.note || null,
  }

  try {
    if (isEditing.value && props.incomeId) {
      await updateIncome(props.incomeId, apiData)
    } else {
      await createIncome(apiData as CreateIncomeRequest)
    }
    emit('saved')
    emit('close')
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
  <AppModal :open="open" :title="modalTitle" size="md" :closeable="!loading" @close="handleClose">
    <div v-if="loading && isEditing" class="flex items-center justify-center py-12">
      <AppSpinner size="lg" />
    </div>

    <IncomeForm
      v-else
      :income="income"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>
