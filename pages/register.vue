<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { register, isLoading, error, clearError } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const formErrors = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

function validateForm(): boolean {
  formErrors.value = { name: '', email: '', password: '', password_confirmation: '' }
  let isValid = true

  if (!form.value.name) {
    formErrors.value.name = '請輸入使用者名稱'
    isValid = false
  } else if (form.value.name.length < 2 || form.value.name.length > 50) {
    formErrors.value.name = '使用者名稱需為 2-50 字元'
    isValid = false
  }

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
  } else if (form.value.password.length < 8) {
    formErrors.value.password = '密碼至少需要 8 個字元'
    isValid = false
  }

  if (!form.value.password_confirmation) {
    formErrors.value.password_confirmation = '請確認密碼'
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

  await register({
    name: form.value.name,
    email: form.value.email,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation,
  })
}
</script>

<template>
  <div>
    <!-- Brand -->
    <div class="mb-8 text-center">
      <AppIcon name="leaf" class="mx-auto h-10 w-10 text-theme-text-secondary" />
      <h1 class="mt-3 text-heading-lg font-bold text-theme-text">建立帳號</h1>
      <p class="mt-1 text-body-md text-theme-text-muted">開始記錄你的消費決策</p>
    </div>

    <!-- Error Alert -->
    <AppFormAlert v-if="error" :message="error" type="error" class="mb-4" />

    <!-- Form -->
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppInput
        v-model="form.name"
        type="text"
        label="使用者名稱"
        placeholder="請輸入您的名稱"
        :error="formErrors.name"
        required
      />

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
        placeholder="請輸入密碼"
        :error="formErrors.password"
        hint="至少 8 個字元"
        required
      />

      <AppPasswordInput
        v-model="form.password_confirmation"
        label="確認密碼"
        placeholder="請再次輸入密碼"
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
        建立帳號
      </AppButton>
    </form>

    <!-- Divider -->
    <div class="my-6 border-t border-theme-border" />

    <!-- Login Link -->
    <p class="text-center text-body-md">
      <span class="text-theme-text-muted">已有帳號？</span>
      <NuxtLink to="/login" class="ml-1 text-theme-primary hover:underline"> 立即登入 </NuxtLink>
    </p>
  </div>
</template>
