<script setup lang="ts">
import type { Category } from '~/types'
import type {
  CashFlowItem,
  CreateCashFlowItemRequest,
  UpdateCashFlowItemRequest,
  CashFlowFrequencyType,
} from '~/types/cashflow'
import { useCashFlow } from '~/composables/useCashFlow'
import { useCashFlowStore } from '~/stores/cashflow'

interface Props {
  open: boolean
  itemId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  itemId: null,
})

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useCashFlowStore()
const { createCashFlowItem, updateCashFlowItem } = useCashFlow()

const loading = ref(false)
const item = ref<CashFlowItem | null>(null)

const isEditing = computed(() => !!props.itemId)
const modalTitle = computed(() => (isEditing.value ? '編輯支出' : '新增支出'))

// Load item data when editing
watch(
  () => props.itemId,
  async (id) => {
    if (id) {
      loading.value = true
      try {
        item.value = await store.fetchCashFlowItemById(id)
      } catch {
        emit('close')
      } finally {
        loading.value = false
      }
    } else {
      item.value = null
    }
  },
  { immediate: true }
)

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

async function handleSubmit(data: CashFlowItemFormData) {
  loading.value = true

  const apiData: CreateCashFlowItemRequest | UpdateCashFlowItemRequest = {
    name: data.name,
    amount: data.amount,
    category: data.category,
    frequency_type: data.frequency_type,
    frequency_interval: data.frequency_interval,
    start_date: data.start_date,
    end_date: data.end_date || null,
    note: data.note || null,
  }

  try {
    if (isEditing.value && props.itemId) {
      await updateCashFlowItem(props.itemId, apiData)
    } else {
      await createCashFlowItem(apiData as CreateCashFlowItemRequest)
    }
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Failed to save cash flow item:', error)
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

    <CashFlowItemForm
      v-else
      :item="item"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>
