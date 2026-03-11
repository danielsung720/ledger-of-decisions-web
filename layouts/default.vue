<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

const uiStore = useUiStore()
const authStore = useAuthStore()
const expenseDataVersion = useState<number>('expense-data-version', () => 0)

const isExpenseModalOpen = computed(() => uiStore.isExpenseModalOpen)
const editingExpenseId = computed(() => uiStore.editingExpenseId)

function openExpenseModal() {
  uiStore.openExpenseModal()
}

function closeExpenseModal() {
  uiStore.closeExpenseModal()
}

function handleExpenseSaved() {
  expenseDataVersion.value += 1
  closeExpenseModal()
}

// Provide modal state to child components
provide('expenseModal', {
  isOpen: isExpenseModalOpen,
  open: openExpenseModal,
  close: closeExpenseModal,
})

// Initialize auth state on app load
onMounted(async () => {
  await authStore.initialize()
})
</script>

<template>
  <div class="min-h-screen bg-theme-bg">
    <TheHeader @open-expense-modal="openExpenseModal" />

    <main class="pb-20">
      <slot />
    </main>

    <!-- Global Expense Modal -->
    <ExpenseFormModal
      :open="isExpenseModalOpen"
      :expense-id="editingExpenseId"
      @close="closeExpenseModal"
      @saved="handleExpenseSaved"
    />

    <!-- Toast - shows the first toast from the stack -->
    <AppToast
      v-if="uiStore.toasts.length > 0"
      :show="true"
      :type="uiStore.toasts[0].type"
      :title="uiStore.toasts[0].title"
      :message="uiStore.toasts[0].message"
      :duration="0"
      @close="uiStore.removeToast(uiStore.toasts[0].id)"
    />
  </div>
</template>
