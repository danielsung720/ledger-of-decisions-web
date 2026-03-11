import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppConfirmDialog from '~/components/ui/AppConfirmDialog.vue'

describe('AppConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  }

  const defaultStubs = {
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
    AppSpinner: true,
  }

  describe('rendering', () => {
    it('renders title', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Confirm Action')
    })

    it('renders message', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Are you sure you want to proceed?')
    })

    it('does not render when closed', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, open: false },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).not.toContain('Confirm Action')
    })
  })

  describe('button text', () => {
    it('uses default confirm text', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('確認')
    })

    it('uses default cancel text', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('取消')
    })

    it('uses custom confirm text', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, confirmText: 'Delete' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Delete')
    })

    it('uses custom cancel text', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, cancelText: 'Go Back' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('Go Back')
    })
  })

  describe('variants', () => {
    it('applies danger variant styles by default', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })

    it('applies warning variant styles', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, variant: 'warning' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-warning').exists()).toBe(true)
    })

    it('applies info variant styles', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, variant: 'info' },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('.text-theme-info').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits confirm when confirm button clicked', async () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      const confirmButton = buttons[1] // Second button is confirm
      await confirmButton.trigger('click')

      expect(wrapper.emitted('confirm')).toHaveLength(1)
    })

    it('emits cancel when cancel button clicked', async () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      const cancelButton = buttons[0] // First button is cancel
      await cancelButton.trigger('click')

      expect(wrapper.emitted('cancel')).toHaveLength(1)
    })
  })

  describe('loading state', () => {
    it('disables buttons when loading', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, loading: true },
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })

    it('shows spinner in confirm button when loading', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, loading: true },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(true)
    })

    it('does not show spinner when not loading', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, loading: false },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(false)
    })

    it('applies opacity class when loading', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: { ...defaultProps, loading: true },
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      const confirmButton = buttons[1]
      expect(confirmButton.classes()).toContain('opacity-70')
    })
  })

  describe('button types', () => {
    it('all buttons have type="button"', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.attributes('type')).toBe('button')
      })
    })

    it('renders two buttons', () => {
      const wrapper = mount(AppConfirmDialog, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.findAll('button').length).toBe(2)
    })
  })
})
