// https://nuxt.com/docs/api/configuration/nuxt-config
const configuredApiBase = process.env.NUXT_PUBLIC_API_BASE
const apiBase = configuredApiBase || '/api'

const apiProxyTarget = process.env.NUXT_API_PROXY_TARGET || 'http://localhost:8080'
const enableApiProxy = apiBase.startsWith('/')
const canonicalOrigin =
  process.env.NUXT_CANONICAL_ORIGIN || process.env.NUXT_PUBLIC_CANONICAL_ORIGIN || ''

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/eslint'],

  css: ['~/assets/css/themes.css', '~/assets/css/main.css'],

  components: [
    { path: '~/components/ui', prefix: '' },
    { path: '~/components/layout', prefix: '' },
    { path: '~/components/expense', prefix: '' },
    { path: '~/components/recurring', prefix: '' },
    { path: '~/components/dashboard', prefix: '' },
    { path: '~/components/review', prefix: '' },
    { path: '~/components/shared', prefix: '' },
    { path: '~/components/cashflow', prefix: '' },
    { path: '~/components/settings', prefix: '' },
  ],

  runtimeConfig: {
    // Private: proxy target for server-side (not exposed to client)
    apiProxyTarget,
    // Optional: force all requests to a single public origin in production.
    canonicalOrigin,
    public: {
      // Public API base used by the browser.
      apiBase,
    },
  },

  nitro: {
    routeRules: enableApiProxy
      ? {
          '/api/**': {
            proxy: `${apiProxyTarget}/api/**`,
          },
          '/sanctum/**': {
            proxy: `${apiProxyTarget}/sanctum/**`,
          },
        }
      : {},
  },

  app: {
    head: {
      title: 'Ledger of Decisions',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Decision-driven expense tracking' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600;700&family=Fira+Code:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
})
