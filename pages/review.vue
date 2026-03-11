<script setup lang="ts">
import { useReviewViewModel } from '~/composables/useReviewViewModel'

definePageMeta({
  middleware: 'auth',
})

const {
  loading,
  preset,
  customStartDate,
  customEndDate,
  totalAmount,
  totalCount,
  impulseRatio,
  intentStats,
  impulseTrend,
  confidenceData,
  insights,
  handleDateRangeChange,
  handlePresetUpdate,
  handleStartDateUpdate,
  handleEndDateUpdate,
} = useReviewViewModel()
</script>

<template>
  <div class="mx-auto max-w-content px-6 py-8 lg:px-16">
    <!-- Header -->
    <div class="mb-8">
      <h1 data-testid="review-page-title" class="mb-2 text-heading-lg font-bold text-theme-text">
        消費回顧
      </h1>
      <p class="text-body-md text-theme-text-secondary">分析你的消費習慣和決策品質</p>
    </div>

    <!-- Date Range Selector -->
    <div class="mb-8">
      <DateRangeSelector
        :preset="preset"
        :start-date="customStartDate"
        :end-date="customEndDate"
        @update:preset="handlePresetUpdate"
        @update:start-date="handleStartDateUpdate"
        @update:end-date="handleEndDateUpdate"
        @change="handleDateRangeChange"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <AppSpinner size="lg" />
    </div>

    <template v-else>
      <!-- Overview Cards -->
      <div class="mb-8">
        <OverviewCard
          :total-amount="totalAmount"
          :total-count="totalCount"
          :impulse-ratio="impulseRatio"
          :impulse-trend="impulseTrend"
        />
      </div>

      <!-- Charts -->
      <div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IntentBarChart title="消費意圖分布" :data="intentStats" />

        <ConfidenceDonutChart title="滿意度分布（估算）" :data="confidenceData" />
      </div>

      <!-- Insights -->
      <InsightList title="洞察與建議" :insights="insights" />
    </template>
  </div>
</template>
