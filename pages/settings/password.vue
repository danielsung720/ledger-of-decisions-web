<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const { updatePassword, isLoading, error, clearError } = useAuth()

const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const formErrors = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

function validateForm(): boolean {
  // Reset errors
  formErrors.current_password = ''
  formErrors.password = ''
  formErrors.password_confirmation = ''

  let isValid = true

  // Validate current password
  if (!form.current_password) {
    formErrors.current_password = '請輸入目前密碼'
    isValid = false
  }

  // Validate new password
  if (!form.password) {
    formErrors.password = '請輸入新密碼'
    isValid = false
  } else if (form.password.length < 8) {
    formErrors.password = '密碼至少需要 8 個字元'
    isValid = false
  }

  // Validate password confirmation
  if (!form.password_confirmation) {
    formErrors.password_confirmation = '請確認新密碼'
    isValid = false
  } else if (form.password !== form.password_confirmation) {
    formErrors.password_confirmation = '兩次輸入的密碼不一致'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  clearError()

  if (!validateForm()) {
    return
  }

  const success = await updatePassword({
    current_password: form.current_password,
    password: form.password,
    password_confirmation: form.password_confirmation,
  })

  if (success) {
    // Clear form on success
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
  }
}
</script>

<template>
  <div class="mx-auto max-w-md px-6 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-heading-lg font-bold text-theme-text">修改密碼</h1>
      <p class="text-body-md text-theme-text-secondary">請輸入目前密碼並設定新密碼</p>
    </div>

    <!-- Error Alert -->
    <AppFormAlert v-if="error" :message="error" type="error" class="mb-6" />

    <!-- Form -->
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppPasswordInput
        v-model="form.current_password"
        label="目前密碼"
        placeholder="請輸入目前密碼"
        :error="formErrors.current_password"
        :disabled="isLoading"
        required
      />

      <AppPasswordInput
        v-model="form.password"
        label="新密碼"
        placeholder="請輸入新密碼"
        hint="密碼至少需要 8 個字元"
        :error="formErrors.password"
        :disabled="isLoading"
        required
      />

      <AppPasswordInput
        v-model="form.password_confirmation"
        label="確認新密碼"
        placeholder="請再次輸入新密碼"
        :error="formErrors.password_confirmation"
        :disabled="isLoading"
        required
      />

      <div class="pt-4">
        <AppButton
          type="submit"
          variant="primary"
          :loading="isLoading"
          :disabled="isLoading"
          class="w-full"
        >
          更新密碼
        </AppButton>
      </div>
    </form>

    <!-- Back Link -->
    <div class="mt-6 text-center">
      <NuxtLink
        to="/"
        class="text-body-md text-theme-text-secondary transition-colors hover:text-theme-primary"
      >
        返回首頁
      </NuxtLink>
    </div>
  </div>
</template>
