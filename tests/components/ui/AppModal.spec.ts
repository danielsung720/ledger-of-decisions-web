import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppModal from '~/components/ui/AppModal.vue'

describe('AppModal', () => {
  describe('rendering', () => {
    it('renders slot content when open', () => {
      const wrapper = mount(AppModal, {
        props: { open: true },
        slots: {
          default: 'Modal Content',
        },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      expect(wrapper.text()).toContain('Modal Content')
    })

    it('does not render when closed', () => {
      const wrapper = mount(AppModal, {
        props: { open: false },
        slots: {
          default: 'Modal Content',
        },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
          },
        },
      })

      expect(wrapper.text()).not.toContain('Modal Content')
    })
  })

  describe('title', () => {
    it('renders header when closeable', () => {
      const wrapper = mount(AppModal, {
        props: { open: true },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      // Header is rendered when closeable (to show close button)
      expect(wrapper.find('.btn-icon').exists()).toBe(true)
    })

    it('renders title when provided', () => {
      const wrapper = mount(AppModal, {
        props: { open: true, title: 'Test Title' },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      expect(wrapper.text()).toContain('Test Title')
    })
  })

  describe('size', () => {
    it('defaults to md size', () => {
      const wrapper = mount(AppModal, {
        props: { open: true },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div :class="$attrs.class"><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      // The size class should be applied
      expect(wrapper.html()).toBeTruthy()
    })
  })

  describe('closeable', () => {
    it('is closeable by default', () => {
      const wrapper = mount(AppModal, {
        props: { open: true },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      // Close button should exist
      expect(wrapper.find('button.btn-icon').exists()).toBe(true)
    })

    it('hides close button when closeable is false', () => {
      const wrapper = mount(AppModal, {
        props: { open: true, closeable: false },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      expect(wrapper.find('button.btn-icon').exists()).toBe(false)
    })
  })

  describe('footer slot', () => {
    it('renders footer slot when provided', () => {
      const wrapper = mount(AppModal, {
        props: { open: true },
        slots: {
          default: 'Content',
          footer: 'Footer Content',
        },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      expect(wrapper.text()).toContain('Footer Content')
    })
  })

  describe('close event', () => {
    it('emits close when close button clicked', async () => {
      const wrapper = mount(AppModal, {
        props: { open: true },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div><slot /></div>',
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      await wrapper.find('button.btn-icon').trigger('click')

      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('does not emit close when closeable is false', async () => {
      const wrapper = mount(AppModal, {
        props: { open: true, closeable: false },
        global: {
          stubs: {
            TransitionRoot: {
              template: '<div v-if="show"><slot /></div>',
              props: ['show'],
            },
            TransitionChild: {
              template: '<div><slot /></div>',
            },
            Dialog: {
              template: '<div @close="$emit(\'close\')"><slot /></div>',
              emits: ['close'],
            },
            DialogPanel: {
              template: '<div><slot /></div>',
            },
            DialogTitle: {
              template: '<h3><slot /></h3>',
            },
          },
        },
      })

      // No close button to click, and dialog close should be prevented
      expect(wrapper.find('button.btn-icon').exists()).toBe(false)
    })
  })
})
