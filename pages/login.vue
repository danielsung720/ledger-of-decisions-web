<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login, isLoading, error, clearError } = useAuth()

const form = ref({
  email: '',
  password: '',
})

const formErrors = ref({
  email: '',
  password: '',
})

function validateForm(): boolean {
  formErrors.value = { email: '', password: '' }
  let isValid = true

  if (!form.value.email) {
    formErrors.value.email = '請輸入 Email'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.email = '請輸入有效的 Email 地址'
    isValid = false
  }

  if (!form.value.password) {
    formErrors.value.password = '請輸入密碼'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  clearError()

  if (!validateForm()) return

  await login({
    email: form.value.email,
    password: form.value.password,
  })
}
</script>

<template>
  <div>
    <!-- Brand -->
    <div class="mb-8 text-center">
      <AppIcon name="leaf" class="mx-auto h-10 w-10 text-theme-text-secondary" />
      <h1 class="mt-3 text-heading-lg font-bold text-theme-text">Ledger of Decisions</h1>
      <p class="mt-1 text-body-md text-theme-text-muted">決策記帳本</p>
    </div>

    <!-- Error Alert -->
    <AppFormAlert v-if="error" :message="error" type="error" class="mb-4" />

    <!-- Form -->
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppInput
        v-model="form.email"
        type="email"
        label="Email"
        placeholder="請輸入您的 Email"
        :error="formErrors.email"
        required
      />

      <AppPasswordInput
        v-model="form.password"
        label="密碼"
        placeholder="請輸入您的密碼"
        :error="formErrors.password"
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
        登入
      </AppButton>
    </form>

    <!-- Forgot Password Link -->
    <div class="mt-4 text-center">
      <NuxtLink to="/forgot-password" class="text-body-md text-theme-primary hover:underline">
        忘記密碼？
      </NuxtLink>
    </div>

    <!-- Divider -->
    <div class="my-6 border-t border-theme-border" />

    <!-- Register Link -->
    <p class="text-center text-body-md">
      <span class="text-theme-text-muted">還沒有帳號？</span>
      <NuxtLink to="/register" class="ml-1 text-theme-primary hover:underline"> 立即註冊 </NuxtLink>
    </p>
  </div>
</template>
