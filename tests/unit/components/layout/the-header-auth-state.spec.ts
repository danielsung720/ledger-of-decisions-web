import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { mount } from '@vue/test-utils'

const isAuthenticatedState = ref(false)
const routePathState = ref('/')

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: computed(() => isAuthenticatedState.value),
  }),
}))

vi.mock('#imports', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...vue,
    useRoute: () => ({
      path: routePathState.value,
    }),
  }
})

vi.mock('#app/composables/router', () => ({
  useRoute: () => ({
    path: routePathState.value,
  }),
}))

describe('TheHeader auth-state render', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isAuthenticatedState.value = false
    routePathState.value = '/'
  })

  it('shows guest actions on first render when unauthenticated', async () => {
    const TheHeader = (await import('~/components/layout/TheHeader.vue')).default
    const wrapper = mount(TheHeader, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
          },
          AppIcon: true,
          AppButton: {
            template: '<button><slot /></button>',
          },
          UserMenu: true,
        },
      },
    })

    expect(wrapper.text()).toContain('登入')
    expect(wrapper.text()).toContain('註冊')
    expect(wrapper.text()).not.toContain('記一筆')
  })

  it('shows member actions on first render when authenticated', async () => {
    isAuthenticatedState.value = true

    const TheHeader = (await import('~/components/layout/TheHeader.vue')).default
    const wrapper = mount(TheHeader, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
          },
          AppIcon: true,
          AppButton: {
            template: '<button><slot /></button>',
          },
          UserMenu: true,
        },
      },
    })

    expect(wrapper.text()).toContain('記一筆')
    expect(wrapper.text()).not.toContain('登入')
    expect(wrapper.text()).not.toContain('註冊')
  })
})
