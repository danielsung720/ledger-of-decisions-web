<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
  middleware: ['guest', 'verify-email-access'],
})

const { initialize, verifyEmail, resendVerification, isLoading, error, clearError, pendingEmail } =
  useAuth()

const otpRef = ref<{ clear: () => void; focus: () => void } | null>(null)
const hasError = ref(false)

onMounted(async () => {
  await initialize()
})

// Mask email: u***@example.com
const maskedEmail = computed(() => {
  const email = pendingEmail.value
  if (!email) return ''

  const [local, domain] = email.split('@')
  if (!local || !domain) return email

  const maskedLocal = local[0] + '***'
  return `${maskedLocal}@${domain}`
})

async function handleComplete(code: string) {
  clearError()
  hasError.value = false

  const email = pendingEmail.value
  if (!email) return

  const success = await verifyEmail({ email, code })
  if (!success) {
    hasError.value = true
    // Clear and refocus on error
    nextTick(() => {
      otpRef.value?.clear()
      otpRef.value?.focus()
    })
  }
}

async function handleResend() {
  clearError()
  hasError.value = false
  await resendVerification()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 text-center">
      <AppIcon name="mail" class="mx-auto h-10 w-10 text-theme-text-secondary" />
      <h1 class="mt-3 text-heading-lg font-bold text-theme-text">驗證您的 Email</h1>
      <p class="mt-2 text-body-md text-theme-text-muted">已發送 6 位數驗證碼至</p>
      <p class="text-body-md font-medium text-theme-text">
        {{ maskedEmail }}
      </p>
    </div>

    <!-- Error Alert -->
    <AppFormAlert v-if="error" :message="error" type="error" class="mb-6" />

    <!-- OTP Input -->
    <div class="mb-4">
      <AppOtpInput
        ref="otpRef"
        :error="hasError"
        :disabled="isLoading"
        @complete="handleComplete"
      />
    </div>

    <!-- Hint -->
    <p class="mb-6 text-center text-caption text-theme-text-muted">驗證碼 10 分鐘內有效</p>

    <!-- Loading State -->
    <div v-if="isLoading" class="mb-6 flex justify-center">
      <AppSpinner size="md" />
    </div>

    <!-- Divider -->
    <div class="my-6 border-t border-theme-border" />

    <!-- Resend Section -->
    <div class="text-center">
      <p class="mb-2 text-body-md text-theme-text-muted">沒收到驗證碼？</p>
      <AppCountdownButton
        text="重新發送"
        :cooldown-seconds="60"
        :disabled="isLoading"
        @click="handleResend"
      />
    </div>

    <!-- Divider -->
    <div class="my-6 border-t border-theme-border" />

    <!-- Back to Login -->
    <div class="text-center">
      <NuxtLink
        to="/login"
        class="text-body-md text-theme-text-muted hover:text-theme-text-secondary"
      >
        ← 返回登入
      </NuxtLink>
    </div>
  </div>
</template>
