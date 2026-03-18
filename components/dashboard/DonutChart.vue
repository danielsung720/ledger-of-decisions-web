<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import type { ChartData, ChartOptions, Plugin } from 'chart.js'
import type { IntentStats } from '~/types'
import { INTENT_COLORS, INTENT_OPTIONS } from '~/utils/constants'
import { formatCurrency } from '~/utils/formatters'
import { useThemeStore } from '~/stores/theme'

interface Props {
  data: IntentStats[]
  title?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '意圖分布',
  loading: false,
})

const themeStore = useThemeStore()

const activeIndex = ref<number | null>(null)

const orderedIntents = INTENT_OPTIONS.map((item) => item.value)

const totalAmount = computed(() => props.data.reduce((sum, item) => sum + item.total_amount, 0))
const totalCount = computed(() => props.data.reduce((sum, item) => sum + item.count, 0))
const isEmpty = computed(() => !props.loading && totalAmount.value === 0)

const legendItems = computed(() => {
  return orderedIntents.map((intent) => {
    const option = INTENT_OPTIONS.find((item) => item.value === intent)
    const item = props.data.find((entry) => entry.intent === intent)
    const amount = item?.total_amount ?? 0
    const percentage = totalAmount.value > 0 ? (amount / totalAmount.value) * 100 : 0

    return {
      intent,
      label: item?.intent_label ?? `${option?.label ?? ''}${option?.subLabel ?? ''}`,
      amount,
      percentage,
      color: INTENT_COLORS[intent as keyof typeof INTENT_COLORS] ?? '#8C8279',
    }
  })
})

const chartData = computed<ChartData<'doughnut'>>(() => {
  if (props.loading || isEmpty.value) {
    return {
      labels: ['empty'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#F5E6D3'],
          borderWidth: 0,
          cutout: '72%',
          hoverOffset: 0,
        },
      ],
    }
  }

  return {
    labels: legendItems.value.map((item) => item.label),
    datasets: [
      {
        data: legendItems.value.map((item) => item.amount),
        backgroundColor: legendItems.value.map((item) => item.color),
        borderWidth: 0,
        cutout: '72%',
        hoverOffset: 8,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: !props.loading && !isEmpty.value,
      backgroundColor: '#3D3833',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      titleFont: {
        size: 12,
        weight: 600,
      },
      bodyFont: {
        size: 12,
        weight: 400,
      },
      borderRadius: 6,
      padding: {
        top: 6,
        right: 10,
        bottom: 6,
        left: 10,
      },
      callbacks: {
        label: (context) => {
          const value = Number(context.raw ?? 0)
          const percentage = totalAmount.value > 0 ? (value / totalAmount.value) * 100 : 0
          return `${formatCurrency(value)} (${percentage.toFixed(0)}%)`
        },
      },
    },
  },
  onHover: (_event, elements) => {
    if (props.loading || isEmpty.value || elements.length === 0) {
      activeIndex.value = null
      return
    }

    activeIndex.value = elements[0].index
  },
}))

const centerTextPlugin = computed<Plugin<'doughnut'>>(() => {
  // Access currentTheme to force recompute when theme changes
  const _theme = themeStore.currentTheme

  return {
    id: 'dashboard-center-text',
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart

      if (!chartArea) return

      const centerX = (chartArea.left + chartArea.right) / 2
      const centerY = (chartArea.top + chartArea.bottom) / 2

      const mainText = props.loading ? '' : isEmpty.value ? '—' : `${totalCount.value}`
      const subText = props.loading ? '' : isEmpty.value ? '尚無消費記錄' : '本月記錄'

      if (!mainText && !subText) return

      const styles = getComputedStyle(document.documentElement)
      const textColor = styles.getPropertyValue('--color-text').trim()
      const mutedColor = styles.getPropertyValue('--color-text-muted').trim()

      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (mainText) {
        ctx.fillStyle = isEmpty.value ? mutedColor : textColor
        ctx.font = `700 ${isEmpty.value ? 20 : 24}px "DM Sans", "Inter", sans-serif`
        ctx.fillText(mainText, centerX, centerY - 8)
      }

      if (subText) {
        ctx.fillStyle = textColor
        ctx.font = '400 11px "Inter", "Noto Sans TC", sans-serif'
        ctx.fillText(subText, centerX, centerY + 13)
      }

      ctx.restore()
    },
  }
})

function legendOpacity(index: number): number {
  if (activeIndex.value === null) return 1
  return activeIndex.value === index ? 1 : 0.6
}
</script>

<template>
  <div
    class="rounded-lg border border-theme-border bg-theme-surface p-6"
    data-testid="intent-donut-chart"
  >
    <h3 class="mb-5 text-body-md font-medium text-theme-text-secondary">{{ title }}</h3>

    <div class="flex flex-col items-center gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div
        class="h-[140px] w-[140px] md:h-[180px] md:w-[180px]"
        :class="{ 'skeleton-pulse': loading }"
      >
        <Doughnut :data="chartData" :options="chartOptions" :plugins="[centerTextPlugin]" />
      </div>

      <div class="grid w-full grid-cols-2 gap-x-3 gap-y-2 lg:flex-1 lg:grid-cols-1">
        <div
          v-for="(item, index) in legendItems"
          :key="item.intent"
          class="flex items-center justify-between rounded-md px-1 py-0.5 transition-opacity duration-fast"
          :style="{ opacity: legendOpacity(index) }"
        >
          <div class="flex min-w-0 items-center gap-2">
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: item.color }" />
            <span class="truncate text-[12px] font-medium leading-[1.2] text-theme-text">{{
              item.label
            }}</span>
          </div>

          <div class="ml-2 flex items-center gap-2 text-[12px] leading-[1.2]">
            <span class="font-number font-semibold text-theme-text">{{
              formatCurrency(item.amount)
            }}</span>
            <span class="font-number text-theme-text">{{ item.percentage.toFixed(0) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.skeleton-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-pulse :deep(canvas),
:deep(canvas) {
  display: block;
  height: 100% !important;
  max-width: 100% !important;
  width: 100% !important;
}
</style>
