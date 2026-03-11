<script setup lang="ts">
import { useDashboardViewModel } from '~/composables/useDashboardViewModel'

definePageMeta({
  middleware: 'auth',
})

const {
  expenses,
  expensesLoading,
  totalAmount,
  totalCount,
  impulseRatio,
  intentStats,
  todayAmount,
  todayCount,
  weekAmount,
  weekCount,
  isLoading,
  handleAddExpense,
  handleViewAllRecords,
} = useDashboardViewModel()
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection
      :total-amount="totalAmount"
      :total-count="totalCount"
      :impulse-ratio="impulseRatio"
      @add-expense="handleAddExpense"
    />

    <!-- Main Content -->
    <div class="mx-auto max-w-content px-6 py-8 lg:px-16">
      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <AppSpinner size="lg" />
      </div>

      <template v-else>
        <!-- Stats Cards -->
        <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <StatsSummaryCard title="今日消費" icon="sun" :count="todayCount" :amount="todayAmount" />
          <StatsSummaryCard
            title="本週消費"
            icon="calendar"
            :count="weekCount"
            :amount="weekAmount"
          />
        </div>

        <!-- Charts & Recent Records -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MiniBarChart title="意圖分布" :data="intentStats" />

          <RecentRecordList
            :expenses="expenses"
            :loading="expensesLoading"
            @view-all="handleViewAllRecords"
          />
        </div>
      </template>
    </div>
  </div>
</template>
