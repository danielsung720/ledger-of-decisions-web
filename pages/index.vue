<script setup lang="ts">
import { useDashboardViewModel } from '~/composables/useDashboardViewModel'

definePageMeta({
  middleware: 'auth',
})

const {
  expenses,
  expensesLoading,
  summaryLoading,
  totalAmount,
  totalCount,
  impulseRatio,
  intentStats,
  todayAmount,
  todayCount,
  weekAmount,
  weekCount,
  handleAddExpense,
  handleViewAllRecords,
} = useDashboardViewModel()

const impulseCount = computed(
  () => intentStats.value.find((item) => item.intent === 'impulse')?.count ?? 0
)
</script>

<template>
  <div>
    <HeroSection
      :total-amount="totalAmount"
      :total-count="totalCount"
      :impulse-ratio="impulseRatio"
      :today-amount="todayAmount"
      :today-count="todayCount"
      :week-amount="weekAmount"
      :week-count="weekCount"
      :impulse-count="impulseCount"
      @add-expense="handleAddExpense"
    />

    <div class="mx-auto max-w-content px-4 pb-12 pt-0 md:px-8 lg:px-16">
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
        <div class="lg:col-span-5">
          <DonutChart :data="intentStats" :loading="summaryLoading" />
        </div>

        <div class="lg:col-span-7">
          <RecentRecordList
            :expenses="expenses"
            :loading="expensesLoading"
            @view-all="handleViewAllRecords"
          />
        </div>
      </div>
    </div>
  </div>
</template>
