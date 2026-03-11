<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useRecurringExpenseListViewModel } from '~/composables/useRecurringExpenseListViewModel'
import { useUiStore } from '~/stores/ui'

definePageMeta({
  middleware: 'auth',
})

const uiStore = useUiStore()
const {
  recurringExpenses,
  loading,
  currentPage,
  totalPages,
  totalItems,
  perPage,
  showFormModal,
  editingRecurringExpenseId,
  handlePageChange,
  handleAdd,
  handleEdit,
  handleDelete,
  handleToggleActive,
  handleGenerate,
  handleViewHistory,
  handleModalClose,
  handleModalSaved,
  activeFilter,
  setActiveFilter,
} = useRecurringExpenseListViewModel()
</script>

<template>
  <div class="mx-auto max-w-content px-6 py-8 lg:px-16">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1
          data-testid="recurring-page-title"
          class="mb-2 text-heading-lg font-bold text-theme-text"
        >
          固定支出
        </h1>
        <p class="text-body-md text-theme-text-secondary">
          管理定期扣款項目，系統會自動在到期日產生消費記錄
        </p>
      </div>
      <AppButton data-testid="recurring-add-button" variant="primary" @click="handleAdd">
        <PlusIcon class="mr-1 h-5 w-5" />
        新增固定支出
      </AppButton>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6 flex gap-2">
      <button
        data-testid="recurring-filter-all"
        :class="[
          'rounded-lg px-4 py-2 text-body-sm font-medium transition-colors',
          activeFilter === 'all'
            ? 'bg-theme-primary text-white'
            : 'bg-theme-surface-secondary text-theme-text-secondary hover:bg-theme-border',
        ]"
        @click="setActiveFilter('all')"
      >
        全部
      </button>
      <button
        data-testid="recurring-filter-active"
        :class="[
          'rounded-lg px-4 py-2 text-body-sm font-medium transition-colors',
          activeFilter === 'active'
            ? 'bg-theme-primary text-white'
            : 'bg-theme-surface-secondary text-theme-text-secondary hover:bg-theme-border',
        ]"
        @click="setActiveFilter('active')"
      >
        啟用中
      </button>
      <button
        data-testid="recurring-filter-inactive"
        :class="[
          'rounded-lg px-4 py-2 text-body-sm font-medium transition-colors',
          activeFilter === 'inactive'
            ? 'bg-theme-primary text-white'
            : 'bg-theme-surface-secondary text-theme-text-secondary hover:bg-theme-border',
        ]"
        @click="setActiveFilter('inactive')"
      >
        已停用
      </button>
    </div>

    <!-- Recurring Expense List -->
    <RecurringExpenseList
      :recurring-expenses="recurringExpenses"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
      @toggle-active="handleToggleActive"
      @generate="handleGenerate"
      @view-history="handleViewHistory"
    />

    <!-- Pagination -->
    <div v-if="recurringExpenses.length > 0 && totalPages > 1" class="mt-6">
      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="perPage"
        @update:current-page="handlePageChange"
      />
    </div>

    <!-- Form Modal -->
    <RecurringExpenseFormModal
      :open="showFormModal"
      :recurring-expense-id="editingRecurringExpenseId"
      @close="handleModalClose"
      @saved="handleModalSaved"
    />

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
