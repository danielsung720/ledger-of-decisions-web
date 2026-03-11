import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '~/components/shared/EmptyState.vue'

describe('EmptyState', () => {
  const global = {
    stubs: {
      AppButton: true,
      AppIcon: {
        props: ['name'],
        template: '<span>{{ name }}</span>',
      },
    },
  }

  describe('rendering', () => {
    it('renders title', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'No Data Found' },
        global,
      })

      expect(wrapper.text()).toContain('No Data Found')
    })

    it('renders default icon', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'Empty' },
        global,
      })

      expect(wrapper.text()).toContain('inbox')
    })

    it('renders custom icon', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'Empty', icon: 'sparkles' },
        global,
      })

      expect(wrapper.text()).toContain('sparkles')
    })
  })

  describe('description', () => {
    it('does not render description when not provided', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'Empty' },
        global,
      })

      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBe(0)
    })

    it('renders description when provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
          description: 'No items to display',
        },
        global,
      })

      expect(wrapper.text()).toContain('No items to display')
    })
  })

  describe('action button', () => {
    it('does not render button when actionLabel not provided', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'Empty' },
        global,
      })

      expect(wrapper.findComponent({ name: 'AppButton' }).exists()).toBe(false)
    })

    it('renders button when actionLabel provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
          actionLabel: 'Add Item',
        },
        global,
      })

      expect(wrapper.findComponent({ name: 'AppButton' }).exists()).toBe(true)
    })

    it('emits action when button clicked', async () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
          actionLabel: 'Add Item',
        },
        global: {
          stubs: {
            AppButton: {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
              emits: ['click'],
            },
          },
        },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('action')).toBeTruthy()
      expect(wrapper.emitted('action')!.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('slot', () => {
    it('renders default slot content', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'Empty' },
        slots: {
          default: '<p>Custom Content</p>',
        },
        global,
      })

      expect(wrapper.text()).toContain('Custom Content')
    })
  })

  describe('styling', () => {
    it('centers content', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'Empty' },
        global,
      })

      expect(wrapper.find('div').classes()).toContain('text-center')
    })

    it('has vertical padding', () => {
      const wrapper = mount(EmptyState, {
        props: { title: 'Empty' },
        global,
      })

      expect(wrapper.find('div').classes()).toContain('py-12')
    })
  })
})
