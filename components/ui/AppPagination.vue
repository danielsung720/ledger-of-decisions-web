<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const canGoPrev = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.totalPages)

const startItem = computed(() => (props.currentPage - 1) * props.perPage + 1)
const endItem = computed(() => Math.min(props.currentPage * props.perPage, props.totalItems))

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (current > 3) {
      pages.push('...')
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }

    pages.push(total)
  }

  return pages
})

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <p class="text-body-sm text-theme-text-secondary">
      顯示第 {{ startItem }} - {{ endItem }} 筆，共 {{ totalItems }} 筆
    </p>

    <nav class="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        :disabled="!canGoPrev"
        class="btn-icon"
        @click="goToPage(currentPage - 1)"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </button>

      <template v-for="(page, index) in visiblePages" :key="index">
        <span v-if="page === '...'" class="px-2 text-theme-text-muted"> ... </span>
        <button
          v-else
          type="button"
          :class="[
            'h-10 w-10 rounded-md text-body-sm font-medium transition-all duration-fast',
            page === currentPage
              ? 'bg-theme-primary text-white'
              : 'text-theme-text-secondary hover:bg-theme-surface-secondary',
          ]"
          @click="goToPage(page as number)"
        >
          {{ page }}
        </button>
      </template>

      <button
        type="button"
        :disabled="!canGoNext"
        class="btn-icon"
        @click="goToPage(currentPage + 1)"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </button>
    </nav>
  </div>
</template>
