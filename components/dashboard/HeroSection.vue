<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { formatCurrency, formatPercentage } from '~/utils/formatters'

interface Props {
  totalAmount: number
  totalCount: number
  impulseRatio: number
  todayAmount: number
  todayCount: number
  weekAmount: number
  weekCount: number
  impulseCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  addExpense: []
}>()
</script>

<template>
  <section class="pb-4 pt-6">
    <div class="mx-auto max-w-content px-4 md:px-8 lg:px-16">
      <div
        class="grid grid-cols-1 gap-4 rounded-xl bg-warm-sunrise px-6 py-8 md:grid-cols-12 md:items-center md:gap-6 md:px-8"
      >
        <div class="md:col-span-7 lg:col-span-8">
          <h1
            data-testid="dashboard-hero-title"
            class="mb-2 text-heading-md font-semibold text-warm-gray-900 md:text-heading-lg"
          >
            決策驅動的記帳
          </h1>
          <p class="mb-4 max-w-xl text-body-sm text-warm-gray-700 md:text-body-md">
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

        <div class="md:col-span-5 lg:col-span-4">
          <div class="grid grid-cols-2 gap-2">
            <div
              data-testid="stats-card-today"
              class="flex flex-col justify-between rounded-[10px] border border-cream-200 bg-white/60 px-3 py-2.5"
              style="height: 72px"
            >
              <p class="text-[11px] text-warm-gray-500">今日消費</p>
              <p class="font-number text-[20px] font-bold leading-none text-warm-gray-900">
                {{ formatCurrency(todayAmount) }}
              </p>
              <p class="text-[11px] text-warm-gray-500">{{ todayCount }} 筆記錄</p>
            </div>

            <div
              data-testid="stats-card-week"
              class="flex flex-col justify-between rounded-[10px] border border-cream-200 bg-white/60 px-3 py-2.5"
              style="height: 72px"
            >
              <p class="text-[11px] text-warm-gray-500">本週消費</p>
              <p class="font-number text-[20px] font-bold leading-none text-warm-gray-900">
                {{ formatCurrency(weekAmount) }}
              </p>
              <p class="text-[11px] text-warm-gray-500">{{ weekCount }} 筆記錄</p>
            </div>

            <div
              data-testid="stats-card-month"
              class="flex flex-col justify-between rounded-[10px] border border-cream-200 bg-white/60 px-3 py-2.5"
              style="height: 72px"
            >
              <p class="text-[11px] text-warm-gray-500">本月支出</p>
              <p class="font-number text-[20px] font-bold leading-none text-warm-gray-900">
                {{ formatCurrency(totalAmount) }}
              </p>
              <p class="text-[11px] text-warm-gray-500">{{ totalCount }} 筆記錄</p>
            </div>

            <div
              data-testid="stats-card-impulse"
              class="flex flex-col justify-between rounded-[10px] border border-cream-200 bg-white/60 px-3 py-2.5"
              style="height: 72px"
            >
              <p class="text-[11px] text-warm-gray-500">衝動佔比</p>
              <p class="font-number text-[20px] font-bold leading-none text-intent-impulse">
                {{ formatPercentage(impulseRatio, 0) }}
              </p>
              <p class="text-[11px] text-intent-impulse">{{ impulseCount }} 筆衝動消費</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
