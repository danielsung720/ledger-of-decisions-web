<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const router = useRouter()
const { initialize, resetPassword, isLoading, error, clearError, pendingEmail } = useAuth()

const otpRef = ref<{ clear: () => void; focus: () => void } | null>(null)
const step = ref<'code' | 'password'>('code')
const verificationCode = ref('')
const hasOtpError = ref(false)

const form = ref({
  password: '',
  password_confirmation: '',
})

const formErrors = ref({
  password: '',
  password_confirmation: '',
})

// Redirect to forgot-password if no pending email
onMounted(async () => {
  await initialize()
  if (!pendingEmail.value) {
    router.push('/forgot-password')
  }
})

function handleCodeComplete(code: string) {
  hasOtpError.value = false
  verificationCode.value = code
  step.value = 'password'
}

function validateForm(): boolean {
  formErrors.value = { password: '', password_confirmation: '' }
  let isValid = true

  if (!form.value.password) {
    formErrors.value.password = '請輸入新密碼'
    isValid = false
  } else if (form.value.password.length < 8) {
    formErrors.value.password = '密碼至少需要 8 個字元'
    isValid = false
  }

  if (!form.value.password_confirmation) {
    formErrors.value.password_confirmation = '請確認新密碼'
    isValid = false
  } else if (form.value.password !== form.value.password_confirmation) {
    formErrors.value.password_confirmation = '兩次輸入的密碼不一致'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  clearError()

  if (!validateForm()) return

  const email = pendingEmail.value
  if (!email) return

  await resetPassword({
    email,
    code: verificationCode.value,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation,
  })
}

function goBack() {
  if (step.value === 'password') {
    step.value = 'code'
    verificationCode.value = ''
  } else {
    router.push('/forgot-password')
  }
}
</script>

<template>
  <div>
    <!-- Step 1: Enter Verification Code -->
    <template v-if="step === 'code'">
      <!-- Header -->
      <div class="mb-8 text-center">
        <AppIcon name="lock" class="mx-auto h-10 w-10 text-theme-text-secondary" />
        <h1 class="mt-3 text-heading-lg font-bold text-theme-text">輸入驗證碼</h1>
        <p class="mt-2 text-body-md text-theme-text-muted">請輸入收到的 6 位數驗證碼</p>
      </div>

      <!-- Error Alert -->
      <AppFormAlert v-if="error" :message="error" type="error" class="mb-6" />

      <!-- OTP Input -->
      <div class="mb-6">
        <AppOtpInput
          ref="otpRef"
          :error="hasOtpError"
          :disabled="isLoading"
          @complete="handleCodeComplete"
        />
      </div>
    </template>

    <!-- Step 2: Set New Password -->
    <template v-else>
      <!-- Header -->
      <div class="mb-8 text-center">
        <AppIcon name="lock" class="mx-auto h-10 w-10 text-theme-text-secondary" />
        <h1 class="mt-3 text-heading-lg font-bold text-theme-text">設定新密碼</h1>
      </div>

      <!-- Error Alert -->
      <AppFormAlert v-if="error" :message="error" type="error" class="mb-4" />

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <AppPasswordInput
          v-model="form.password"
          label="新密碼"
          placeholder="請輸入新密碼"
          :error="formErrors.password"
          hint="至少 8 個字元"
          required
        />

        <AppPasswordInput
          v-model="form.password_confirmation"
          label="確認新密碼"
          placeholder="請再次輸入新密碼"
          :error="formErrors.password_confirmation"
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
          重設密碼
        </AppButton>
      </form>
    </template>

    <!-- Divider -->
    <div class="my-6 border-t border-theme-border" />

    <!-- Back Link -->
    <div class="text-center">
      <button
        type="button"
        class="text-body-md text-theme-text-muted hover:text-theme-text-secondary"
        @click="goBack"
      >
        ← 返回上一步
      </button>
    </div>
  </div>
</template>
