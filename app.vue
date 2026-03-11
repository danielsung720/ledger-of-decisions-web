<script setup lang="ts">
// Use cookie so both SSR and CSR read the same value, preventing hydration mismatch on data-theme
const themeCookie = useCookie<string>('ui-theme', {
  default: () => 'default',
  maxAge: 60 * 60 * 24 * 365,
})

useHead({
  htmlAttrs: {
    lang: 'zh-TW',
    'data-theme': themeCookie,
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
