<script setup lang="ts">
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  selectedCount: number
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  delete: []
  cancel: []
}>()
</script>

<template>
  <div
    class="flex items-center justify-between rounded-xl border border-info-500 bg-info-50 px-4 py-3"
    data-testid="batch-action-bar"
  >
    <div class="flex items-center gap-3">
      <span class="text-info-700 text-body-sm font-medium" data-testid="selected-count">
        已選取 {{ selectedCount }} 筆記錄
      </span>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="btn-secondary btn-sm"
        :disabled="loading"
        @click="emit('cancel')"
      >
        <XMarkIcon class="mr-1 h-4 w-4" />
        取消
      </button>
      <button
        type="button"
        class="btn-danger btn-sm"
        data-testid="batch-delete-button"
        :disabled="loading"
        @click="emit('delete')"
      >
        <AppSpinner v-if="loading" size="sm" class="mr-1" />
        <TrashIcon v-else class="mr-1 h-4 w-4" />
        批次刪除
      </button>
    </div>
  </div>
</template>
