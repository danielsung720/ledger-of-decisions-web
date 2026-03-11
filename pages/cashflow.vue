<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useCashFlowViewModel } from '~/composables/useCashFlowViewModel'
import { useUiStore } from '~/stores/ui'

definePageMeta({
  middleware: 'auth',
})

const uiStore = useUiStore()
const {
  incomes,
  cashFlowItems,
  summary,
  projections,
  localSelectedMonths,
  loading,
  showIncomeModal,
  editingIncomeId,
  showExpenseModal,
  editingExpenseId,
  handleMonthChange,
  handleAddIncome,
  handleEditIncome,
  handleDeleteIncome,
  handleIncomeModalClose,
  handleIncomeModalSaved,
  handleAddExpense,
  handleEditExpense,
  handleDeleteExpense,
  handleExpenseModalClose,
  handleExpenseModalSaved,
} = useCashFlowViewModel()

function handleConfirmDialogConfirm() {
  const onConfirm = uiStore.confirmDialogProps?.onConfirm

  if (typeof onConfirm === 'function') {
    onConfirm()
    return
  }

  console.warn('[CashFlowPage] confirm dialog triggered without onConfirm callback')
  uiStore.closeConfirmDialog()
}
</script>

<template>
  <div class="mx-auto max-w-content px-6 py-8 lg:px-16">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="mb-2 text-heading-lg font-bold text-theme-text">每月現金流估算</h1>
        <p class="text-body-md text-theme-text-secondary">編輯收入和支出項目，預估每月花費</p>
      </div>
      <div class="flex gap-3">
        <AppButton data-testid="btn-add-income" variant="secondary" @click="handleAddIncome">
          <PlusIcon class="mr-1 h-5 w-5" />
          新增收入
        </AppButton>
        <AppButton data-testid="btn-add-expense" variant="primary" @click="handleAddExpense">
          <PlusIcon class="mr-1 h-5 w-5" />
          新增支出
        </AppButton>
      </div>
    </div>

    <!-- Month Selector -->
    <div class="mb-6">
      <label class="mb-2 block text-body-sm text-theme-text-secondary">預測區間</label>
      <MonthSelector
        data-testid="month-selector"
        :model-value="localSelectedMonths"
        @update:model-value="handleMonthChange"
      />
    </div>

    <!-- Summary Cards -->
    <div class="mb-8">
      <CashFlowSummaryCards :summary="summary" :loading="loading" />
    </div>

    <!-- Income and Expense Tables -->
    <div class="mb-8 grid gap-6 lg:grid-cols-2">
      <IncomeTable
        data-testid="income-table"
        :incomes="incomes"
        :loading="loading"
        @edit="handleEditIncome"
        @delete="handleDeleteIncome"
      />
      <CashFlowItemTable
        data-testid="expense-table"
        :items="cashFlowItems"
        :loading="loading"
        @edit="handleEditExpense"
        @delete="handleDeleteExpense"
      />
    </div>

    <!-- Projection Table -->
    <CashFlowProjectionTable
      data-testid="projection-table"
      :projections="projections"
      :selected-months="localSelectedMonths"
      :loading="loading"
    />

    <!-- Income Form Modal -->
    <IncomeFormModal
      v-if="showIncomeModal"
      data-testid="income-modal"
      :open="showIncomeModal"
      :income-id="editingIncomeId"
      @close="handleIncomeModalClose"
      @saved="handleIncomeModalSaved"
    />

    <!-- Expense Form Modal -->
    <CashFlowItemFormModal
      v-if="showExpenseModal"
      data-testid="expense-modal"
      :open="showExpenseModal"
      :item-id="editingExpenseId"
      @close="handleExpenseModalClose"
      @saved="handleExpenseModalSaved"
    />

    <!-- Confirm Dialog -->
    <AppConfirmDialog
      :open="uiStore.isConfirmDialogOpen"
      :title="uiStore.confirmDialogProps?.title ?? ''"
      :message="uiStore.confirmDialogProps?.message ?? ''"
      :variant="uiStore.confirmDialogProps?.variant ?? 'warning'"
      :loading="uiStore.confirmDialogProps?.loading ?? false"
      @confirm="handleConfirmDialogConfirm"
      @cancel="uiStore.closeConfirmDialog"
    />
  </div>
</template>
