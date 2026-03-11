<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'

interface ConfidenceData {
  high: number
  medium: number
  low: number
}

interface Props {
  data: ConfidenceData
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '滿意度分布',
})

const total = computed(() => props.data.high + props.data.medium + props.data.low)

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['很滿意', '還好', '有點後悔'],
  datasets: [
    {
      data: [props.data.high, props.data.medium, props.data.low],
      backgroundColor: ['#7EB88C', '#8C8279', '#D9936A'],
      borderWidth: 0,
      cutout: '70%',
    },
  ],
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw as number
          const percentage = total.value > 0 ? ((value / total.value) * 100).toFixed(1) : 0
          return `${context.label}: ${value} 筆 (${percentage}%)`
        },
      },
    },
  },
}))

const highPercentage = computed(() => {
  if (total.value === 0) return 0
  return Math.round((props.data.high / total.value) * 100)
})
</script>

<template>
  <div class="card">
    <h3 class="mb-6 text-heading-sm font-semibold text-theme-text">
      {{ title }}
    </h3>

    <div v-if="total === 0" class="flex h-64 items-center justify-center text-theme-text-muted">
      尚無數據
    </div>

    <div v-else class="relative">
      <div class="h-64">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>

      <!-- Center Label -->
      <div class="absolute left-1/2 top-1/2 -mt-6 -translate-x-1/2 -translate-y-1/2 text-center">
        <p class="font-number text-display-md font-bold text-theme-text">{{ highPercentage }}%</p>
        <p class="text-body-sm text-theme-text-muted">滿意度</p>
      </div>
    </div>
  </div>
</template>
