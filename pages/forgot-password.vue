<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const router = useRouter()
const { initialize, forgotPassword, isLoading, error, clearError, pendingEmail } = useAuth()

const email = ref('')
const emailError = ref('')
const codeSent = ref(false)

onMounted(async () => {
  await initialize()

  if (pendingEmail.value) {
    email.value = pendingEmail.value
    codeSent.value = true
  }
})

// Mask email: u***@example.com
const maskedEmail = computed(() => {
  const emailValue = pendingEmail.value
  if (!emailValue) return ''

  const [local, domain] = emailValue.split('@')
  if (!local || !domain) return emailValue

  const maskedLocal = local[0] + '***'
  return `${maskedLocal}@${domain}`
})

function validateEmail(): boolean {
  emailError.value = ''

  if (!email.value) {
    emailError.value = '請輸入 Email'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = '請輸入有效的 Email 地址'
    return false
  }

  return true
}

async function handleSubmit() {
  clearError()

  if (!validateEmail()) return

  const success = await forgotPassword({ email: email.value })
  if (success) {
    codeSent.value = true
  }
}

function goToResetPassword() {
  router.push('/reset-password')
}
</script>

<template>
  <div>
    <!-- Initial State: Enter Email -->
    <template v-if="!codeSent">
      <!-- Header -->
      <div class="mb-8 text-center">
        <AppIcon name="key" class="mx-auto h-10 w-10 text-theme-text-secondary" />
        <h1 class="mt-3 text-heading-lg font-bold text-theme-text">忘記密碼？</h1>
        <p class="mt-2 text-body-md text-theme-text-muted">輸入您的 Email，我們將發送</p>
        <p class="text-body-md text-theme-text-muted">密碼重設驗證碼給您</p>
      </div>

      <!-- Error Alert -->
      <AppFormAlert v-if="error" :message="error" type="error" class="mb-4" />

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <AppInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="請輸入您的 Email"
          :error="emailError"
          required
        />

        <AppButton
          type="submit"
          variant="primary"
          size="md"
          :loading="isLoading"
          :disabled="isLoading"
          class="w-full"
        >
          發送驗證碼
        </AppButton>
      </form>
    </template>

    <!-- Code Sent State -->
    <template v-else>
      <!-- Header -->
      <div class="mb-8 text-center">
        <AppIcon name="circle-check" class="mx-auto h-10 w-10 text-theme-success" />
        <h1 class="mt-3 text-heading-lg font-bold text-theme-text">驗證碼已發送</h1>
        <p class="mt-2 text-body-md text-theme-text-muted">請查看 {{ maskedEmail }} 的信箱</p>
        <p class="text-body-md text-theme-text-muted">並點擊下方按鈕輸入驗證碼</p>
      </div>

      <AppButton variant="primary" size="md" class="w-full" @click="goToResetPassword">
        輸入驗證碼
      </AppButton>

      <!-- Resend -->
      <div class="mt-6 text-center">
        <AppCountdownButton
          text="重新發送"
          :cooldown-seconds="60"
          :disabled="isLoading"
          @click="handleSubmit"
        />
      </div>
    </template>

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
