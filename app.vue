<script setup lang="ts">
// Use cookie so both SSR and CSR read the same value, preventing hydration mismatch on data-theme
const themeCookie = useCookie<string>('ui-theme', {
  default: () => 'default',
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
})

const themeBootstrapScript = `
  (function () {
    try {
      var theme = localStorage.getItem('ui-theme');
      if (theme === 'default' || theme === 'code' || theme === 'ocean') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch (_err) {
      // Ignore localStorage access issues.
    }
  })();
`

useHead({
  htmlAttrs: {
    lang: 'zh-TW',
    'data-theme': themeCookie,
  },
  script: [
    {
      id: 'theme-bootstrap',
      // Apply theme as early as possible to prevent first-paint flash.
      innerHTML: themeBootstrapScript,
      tagPosition: 'head',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
