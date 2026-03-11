<script setup lang="ts">
import { useExpenseListViewModel } from '~/composables/useExpenseListViewModel'
import { useUiStore } from '~/stores/ui'

definePageMeta({
  middleware: 'auth',
})

const uiStore = useUiStore()
const {
  expenses,
  loading,
  currentPage,
  totalPages,
  totalItems,
  selectedIds,
  selectedCount,
  isAllSelected,
  isIndeterminate,
  batchDeleteLoading,
  filters,
  perPage,
  handleSearch,
  handlePageChange,
  handleToggleSelect,
  handleToggleSelectAll,
  handleBatchDelete,
  handleCancelSelection,
  handleEdit,
  handleDelete,
} = useExpenseListViewModel()
</script>

<template>
  <div class="mx-auto max-w-content px-6 py-8 lg:px-16">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-heading-lg font-bold text-theme-text">消費記錄</h1>
      <p class="text-body-md text-theme-text-secondary">查看和管理你的所有消費記錄</p>
    </div>

    <!-- Filters -->
    <div class="mb-6">
      <ExpenseFilterBar v-model="filters" @search="handleSearch" />
    </div>

    <!-- Batch Action Bar -->
    <Transition
      enter-active-class="transition-all duration-normal ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-fast ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="selectedCount > 0" class="mb-4">
        <BatchActionBar
          :selected-count="selectedCount"
          :loading="batchDeleteLoading"
          @delete="handleBatchDelete"
          @cancel="handleCancelSelection"
        />
      </div>
    </Transition>

    <!-- Record List -->
    <ExpenseRecordList
      :expenses="expenses"
      :loading="loading"
      :selected-ids="selectedIds"
      :is-all-selected="isAllSelected"
      :is-indeterminate="isIndeterminate"
      @edit="handleEdit"
      @delete="handleDelete"
      @toggle-select="handleToggleSelect"
      @toggle-select-all="handleToggleSelectAll"
    />

    <!-- Pagination -->
    <div v-if="expenses.length > 0 && totalPages > 1" class="mt-6">
      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="perPage"
        @update:current-page="handlePageChange"
      />
    </div>

    <!-- Confirm Dialog -->
    <AppConfirmDialog
      :open="uiStore.isConfirmDialogOpen"
      :title="uiStore.confirmDialogProps?.title ?? ''"
      :message="uiStore.confirmDialogProps?.message ?? ''"
      :variant="uiStore.confirmDialogProps?.variant ?? 'warning'"
      :loading="uiStore.confirmDialogProps?.loading ?? false"
      @confirm="uiStore.confirmDialogProps?.onConfirm"
      @cancel="uiStore.closeConfirmDialog"
    />
  </div>
</template>
