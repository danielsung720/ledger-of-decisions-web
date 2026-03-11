<script setup lang="ts">
interface Props {
  length?: number
  error?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  error: false,
  disabled: false,
})

const emit = defineEmits<{
  complete: [code: string]
}>()

const digits = ref<string[]>(Array(props.length).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])

const isComplete = computed(() => digits.value.every((d) => d !== ''))
const code = computed(() => digits.value.join(''))

function setInputRef(el: HTMLInputElement | null, index: number) {
  if (el) {
    inputRefs.value[index] = el
  }
}

function focusInput(index: number) {
  if (index >= 0 && index < props.length) {
    inputRefs.value[index]?.focus()
  }
}

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Only allow digits
  if (value && !/^\d$/.test(value)) {
    target.value = digits.value[index]
    return
  }

  digits.value[index] = value

  if (value && index < props.length - 1) {
    focusInput(index + 1)
  }

  if (isComplete.value) {
    emit('complete', code.value)
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (digits.value[index] === '' && index > 0) {
      focusInput(index - 1)
    } else {
      digits.value[index] = ''
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    focusInput(index - 1)
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    focusInput(index + 1)
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const pastedDigits = pastedData.replace(/\D/g, '').slice(0, props.length)

  if (pastedDigits) {
    for (let i = 0; i < props.length; i++) {
      digits.value[i] = pastedDigits[i] || ''
    }

    const lastFilledIndex = Math.min(pastedDigits.length, props.length) - 1
    focusInput(lastFilledIndex)

    if (isComplete.value) {
      emit('complete', code.value)
    }
  }
}

function clear() {
  digits.value = Array(props.length).fill('')
  focusInput(0)
}

function focus() {
  focusInput(0)
}

defineExpose({ clear, focus })
</script>

<template>
  <div class="flex justify-center gap-3" role="group" aria-label="驗證碼輸入">
    <input
      v-for="(_, index) in length"
      :key="index"
      :ref="(el) => setInputRef(el as HTMLInputElement, index)"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :value="digits[index]"
      :disabled="disabled"
      :aria-label="`驗證碼第 ${index + 1} 位`"
      :class="[
        'h-[60px] w-[52px] rounded-xl border-[1.5px] text-center text-heading-md font-semibold text-theme-text',
        'transition-all duration-fast',
        'focus:ring-theme-primary/30 focus:outline-none focus:ring-2',
        error
          ? 'animate-shake border-theme-error bg-theme-error-light'
          : digits[index]
            ? 'border-theme-border-hover bg-theme-surface-secondary'
            : 'border-theme-border bg-theme-surface-secondary focus:border-theme-primary',
        disabled && 'cursor-not-allowed opacity-60',
      ]"
      @input="handleInput(index, $event)"
      @keydown="handleKeydown(index, $event)"
      @paste="handlePaste"
    />
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
