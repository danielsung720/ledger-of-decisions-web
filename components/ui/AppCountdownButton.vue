<script setup lang="ts">
interface Props {
  text?: string
  cooldownSeconds?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '重新發送',
  cooldownSeconds: 60,
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()

const countdown = ref(0)
const isCoolingDown = computed(() => countdown.value > 0)
const isDisabled = computed(() => props.disabled || isCoolingDown.value)

let intervalId: ReturnType<typeof setInterval> | null = null

function startCountdown() {
  countdown.value = props.cooldownSeconds

  intervalId = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }, 1000)
}

function handleClick() {
  if (isDisabled.value) return
  emit('click')
  startCountdown()
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Expose start method for external triggering
defineExpose({ startCountdown })
</script>

<template>
  <button
    type="button"
    :disabled="isDisabled"
    :class="[
      'text-body-md font-medium transition-colors',
      isDisabled
        ? 'cursor-not-allowed text-theme-text-placeholder'
        : 'cursor-pointer text-theme-primary hover:underline',
    ]"
    :aria-disabled="isDisabled"
    :aria-label="isCoolingDown ? `${text}，請等待 ${countdown} 秒` : text"
    @click="handleClick"
  >
    {{ text }}
    <span v-if="isCoolingDown"> ({{ countdown }}秒)</span>
  </button>
</template>
