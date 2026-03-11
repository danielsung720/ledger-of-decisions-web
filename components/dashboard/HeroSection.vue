<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { formatCurrency, formatPercentage } from '~/utils/formatters'

interface Props {
  totalAmount: number
  totalCount: number
  impulseRatio: number
}

defineProps<Props>()

const emit = defineEmits<{
  addExpense: []
}>()
</script>

<template>
  <section class="bg-theme-surface py-12 lg:py-16">
    <div class="mx-auto max-w-content px-6 lg:px-16">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <!-- Left Content -->
        <div>
          <h1
            data-testid="dashboard-hero-title"
            class="mb-4 text-display-md font-bold text-theme-text"
          >
            決策驅動的記帳
          </h1>
          <p class="mb-6 max-w-lg text-body-lg text-theme-text-secondary">
            每一筆消費都是一個決策。追蹤你的消費意圖，培養更好的理財習慣。
          </p>

          <AppButton
            data-testid="dashboard-add-expense"
            variant="primary"
            size="lg"
            @click="emit('addExpense')"
          >
            <PlusIcon class="mr-2 h-5 w-5" />
            記一筆消費
          </AppButton>
        </div>

        <!-- Right Stats -->
        <div class="flex gap-6 lg:gap-8">
          <!-- Total Amount -->
          <div class="text-center lg:text-right">
            <p class="mb-1 text-body-sm text-theme-text-muted">本月消費</p>
            <p class="font-number text-display-md font-bold text-theme-text">
              {{ formatCurrency(totalAmount) }}
            </p>
            <p class="text-body-sm text-theme-text-muted">共 {{ totalCount }} 筆</p>
          </div>

          <!-- Impulse Ratio -->
          <div class="text-center lg:text-right">
            <p class="mb-1 text-body-sm text-theme-text-muted">衝動消費佔比</p>
            <p
              :class="[
                'font-number text-display-md font-bold',
                impulseRatio > 20 ? 'text-theme-error' : 'text-theme-success',
              ]"
            >
              {{ formatPercentage(impulseRatio, 0) }}
            </p>
            <p class="text-body-sm text-theme-text-muted">
              {{ impulseRatio > 20 ? '可以再改善' : '控制得不錯' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
