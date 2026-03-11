<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { IntentStats } from '~/types'
import { INTENT_COLORS } from '~/utils/constants'

interface Props {
  data: IntentStats[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '消費意圖分布',
})

const chartData = computed<ChartData<'bar'>>(() => {
  const labels = props.data.map((item) => item.intent_label)
  const amounts = props.data.map((item) => item.total_amount)
  const colors = props.data.map(
    (item) => INTENT_COLORS[item.intent as keyof typeof INTENT_COLORS] ?? '#8C8279'
  )

  return {
    labels,
    datasets: [
      {
        label: '消費金額',
        data: amounts,
        backgroundColor: colors,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw as number
          return `$${value.toLocaleString()}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: '#F5E6D3',
      },
      border: {
        display: false,
      },
      ticks: {
        callback: (value) => `$${Number(value).toLocaleString()}`,
      },
    },
  },
}))
</script>

<template>
  <div class="card">
    <h3 class="mb-6 text-heading-sm font-semibold text-theme-text">
      {{ title }}
    </h3>

    <div
      v-if="data.length === 0"
      class="flex h-64 items-center justify-center text-theme-text-muted"
    >
      尚無數據
    </div>

    <div v-else class="h-64">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
